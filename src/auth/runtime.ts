import { AuthRuntimeError, HttpStatusError } from './errors';
import { createPkcePair, randomUrlSafe } from './pkce';
import type { AuthorizationTransactionStore, HttpRequest, HttpResponse, HttpTransport, IdTokenValidator, SystemBrowser } from './ports';
import type { RefreshTokenSecureStorage } from './secure-storage';
import { MOBILE_CLIENT_ID, type AuthRuntimeConfig, type AuthRuntimeSnapshot, type AuthorizationTransaction, type MobileAccessContext, type MobileAccessContextResponse, type OAuthTokenResponse } from './types';

function form(values: Record<string, string>): string {
  return new URLSearchParams(values).toString();
}

function decodeAccessClaims(token: string): { sub?: string; sid?: string; client_id?: string } {
  const payload = token.split('.')[1];
  if (!payload) throw new AuthRuntimeError('invalid_access_token', 'Access Token 格式无效');
  const normalized = payload.replace(/-/g, '+').replace(/_/g, '/');
  const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '=');
  return JSON.parse(new TextDecoder().decode(
    Uint8Array.from(atob(padded), (character) => character.charCodeAt(0)),
  )) as { sub?: string; sid?: string; client_id?: string };
}

export class MobileAuthRuntime {
  private accessToken: string | null = null;
  private snapshot: AuthRuntimeSnapshot = { status: 'ANONYMOUS', context: null, currentFactoryId: null };
  private refreshFlight: Promise<MobileAccessContext> | null = null;

  constructor(
    private readonly config: AuthRuntimeConfig,
    private readonly transport: HttpTransport,
    private readonly secureStorage: RefreshTokenSecureStorage,
    private readonly transactions: AuthorizationTransactionStore,
    private readonly browser: SystemBrowser,
    private readonly idTokenValidator: IdTokenValidator,
    private readonly now: () => number = Date.now,
    private readonly countUnsyncedCommands: () => number = () => 0,
  ) {}

  getSnapshot(): AuthRuntimeSnapshot {
    return { ...this.snapshot, context: this.snapshot.context ? { ...this.snapshot.context } : null };
  }

  getAccessTokenForRequest(): string | null {
    return this.accessToken;
  }

  async beginLogin(returnRoute: string | null = null, acknowledgeUnsyncedCommands = false): Promise<string> {
    const unsyncedCount = this.countUnsyncedCommands();
    if (unsyncedCount > 0 && !acknowledgeUnsyncedCommands) {
      throw new AuthRuntimeError(
        'unsynced_commands_require_confirmation',
        `登录切换前必须确认设备上仍有 ${unsyncedCount} 条未同步命令`,
      );
    }
    const { verifier, challenge } = await createPkcePair();
    const transaction: AuthorizationTransaction = {
      state: randomUrlSafe(), nonce: randomUrlSafe(), codeVerifier: verifier,
      clientId: MOBILE_CLIENT_ID, redirectUri: this.config.redirectUri, returnRoute,
      createdAt: this.now(), expiresAt: this.now() + (this.config.transactionTtlMs ?? 10 * 60_000),
    };
    await this.transactions.save(transaction);
    this.snapshot = { status: 'AUTHORIZING', context: null, currentFactoryId: null };
    const url = new URL(this.config.authorizationEndpoint);
    url.search = new URLSearchParams({
      response_type: 'code', client_id: MOBILE_CLIENT_ID, redirect_uri: this.config.redirectUri,
      scope: this.config.scope ?? 'openid', state: transaction.state, nonce: transaction.nonce,
      code_challenge: challenge, code_challenge_method: 'S256',
    }).toString();
    await this.browser.open(url.toString());
    return url.toString();
  }

  async handleCallback(callbackUrl: string): Promise<MobileAccessContext> {
    const transaction = await this.transactions.load();
    try {
      if (!transaction || transaction.expiresAt <= this.now()) {
        throw new AuthRuntimeError('expired_transaction', '登录事务不存在或已过期');
      }
      const callback = new URL(callbackUrl);
      const expected = new URL(transaction.redirectUri);
      if (callback.protocol !== expected.protocol || callback.host !== expected.host || callback.pathname !== expected.pathname
        || callback.searchParams.get('state') !== transaction.state) {
        throw new AuthRuntimeError('invalid_callback', 'App Link 或 state 校验失败');
      }
      const code = callback.searchParams.get('code');
      if (!code || callback.searchParams.has('error')) {
        throw new AuthRuntimeError('authorization_failed', '授权服务器未返回有效 Code');
      }
      const tokens = await this.exchange({
        grant_type: 'authorization_code', client_id: MOBILE_CLIENT_ID,
        redirect_uri: transaction.redirectUri, code, code_verifier: transaction.codeVerifier,
      });
      if (!tokens.id_token) throw new AuthRuntimeError('missing_id_token', 'OIDC 响应缺少 ID Token');
      await this.idTokenValidator.validate({
        idToken: tokens.id_token, issuer: this.config.issuer, audience: MOBILE_CLIENT_ID,
        nonce: transaction.nonce, nowEpochSeconds: Math.floor(this.now() / 1000),
      });
      if (await this.secureStorage.storeInitial(tokens.refresh_token) !== 'COMMITTED') {
        throw new AuthRuntimeError('secure_store_uncertain', 'Refresh Token 安全存储结果不确定');
      }
      this.accessToken = tokens.access_token;
      return await this.loadAndEstablishContext(tokens.access_token);
    } catch (error) {
      await this.failClosed();
      throw error;
    } finally {
      await this.transactions.clear();
    }
  }

  async restoreColdStart(): Promise<boolean> {
    this.accessToken = null;
    this.snapshot = { status: 'RESTORING', context: null, currentFactoryId: null };
    const record = await this.secureStorage.read();
    if (!record) {
      this.snapshot.status = 'ANONYMOUS';
      return false;
    }
    if (record.state !== 'READY') {
      await this.failClosed();
      return false;
    }
    try {
      await this.refresh();
      return true;
    } catch {
      return false;
    }
  }

  async refresh(): Promise<MobileAccessContext> {
    if (this.refreshFlight) return this.refreshFlight;
    this.refreshFlight = this.performRefresh().finally(() => { this.refreshFlight = null; });
    return this.refreshFlight;
  }

  private async performRefresh(): Promise<MobileAccessContext> {
    const operationId = randomUrlSafe();
    const lease = await this.secureStorage.beginUse(operationId);
    if (!lease) {
      await this.failClosed();
      throw new AuthRuntimeError('refresh_unavailable', '没有可安全使用的 Refresh Token');
    }
    try {
      const tokens = await this.exchange({
        grant_type: 'refresh_token', client_id: MOBILE_CLIENT_ID, refresh_token: lease.token,
      });
      const outcome = await this.secureStorage.commitReplacement(operationId, tokens.refresh_token);
      if (outcome !== 'COMMITTED') {
        await this.secureStorage.invalidate(operationId);
        throw new AuthRuntimeError('refresh_replace_uncertain', 'Refresh Token 本地替换结果不确定');
      }
      this.accessToken = tokens.access_token;
      return await this.loadAndEstablishContext(tokens.access_token);
    } catch (error) {
      await this.secureStorage.invalidate(operationId);
      await this.failClosed();
      throw error;
    }
  }

  async request<T>(request: Omit<HttpRequest, 'headers'> & { headers?: Record<string, string> }): Promise<HttpResponse<T>> {
    return this.requestOnce<T>(request, false);
  }

  private async requestOnce<T>(request: HttpRequest, retried: boolean): Promise<HttpResponse<T>> {
    if (!this.accessToken || !this.snapshot.context) {
      throw new AuthRuntimeError('authentication_required', '当前没有有效 Mobile Session');
    }
    const response = await this.transport.request<T>({
      ...request,
      headers: {
        ...request.headers,
        Authorization: `Bearer ${this.accessToken}`,
        ...(this.snapshot.currentFactoryId ? { 'X-Factory-Id': this.snapshot.currentFactoryId } : {}),
      },
    });
    if (response.status === 401 && !retried) {
      await this.refresh();
      return this.requestOnce<T>(request, true);
    }
    if (response.status < 200 || response.status >= 300) {
      throw new HttpStatusError(response.status, response.body);
    }
    return response;
  }

  selectFactory(factoryId: string): void {
    if (!this.snapshot.context?.factoryIds.includes(factoryId)) {
      throw new AuthRuntimeError('factory_not_authorized', 'Factory 不在 /api/iam/me 授权范围内');
    }
    this.snapshot.currentFactoryId = factoryId;
  }

  async logout(): Promise<void> {
    await this.transactions.clear();
    await this.secureStorage.clear();
    this.accessToken = null;
    this.snapshot = { status: 'ANONYMOUS', context: null, currentFactoryId: null };
  }

  private async exchange(values: Record<string, string>): Promise<OAuthTokenResponse> {
    let response: HttpResponse<OAuthTokenResponse>;
    try {
      response = await this.transport.request<OAuthTokenResponse>({
        url: this.config.tokenEndpoint, method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: form(values),
      });
    } catch (error) {
      throw new AuthRuntimeError('token_result_unknown', `Token 请求结果未知：${String(error)}`);
    }
    if (response.status !== 200 || !response.body.access_token || !response.body.refresh_token) {
      throw new AuthRuntimeError('token_exchange_failed', `Token Endpoint 返回 ${response.status}`);
    }
    return response.body;
  }

  private async loadAndEstablishContext(accessToken: string): Promise<MobileAccessContext> {
    const response = await this.transport.request<MobileAccessContextResponse>({
      url: `${this.config.issuer.replace(/\/$/, '')}/api/iam/me`, method: 'GET',
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (response.status !== 200) throw new HttpStatusError(response.status, response.body);
    const claims = decodeAccessClaims(accessToken);
    const context = response.body;
    if (context.userType !== 'INTERNAL' || context.clientId !== MOBILE_CLIENT_ID
      || !context.mobileAccessEnabled || !context.sid || context.sid !== claims.sid
      || context.userId !== claims.sub || claims.client_id !== MOBILE_CLIENT_ID
      || context.partyType !== null || context.partyId !== null) {
      throw new AuthRuntimeError('invalid_mobile_context', '/api/iam/me 未返回有效 Mobile Access Context');
    }
    const currentFactoryId = context.currentFactoryId && context.factoryIds.includes(context.currentFactoryId)
      ? context.currentFactoryId : null;
    const mobileContext = context as MobileAccessContext;
    this.snapshot = { status: 'AUTHENTICATED', context: mobileContext, currentFactoryId };
    return mobileContext;
  }

  private async failClosed(): Promise<void> {
    this.accessToken = null;
    this.snapshot = { status: 'REAUTHENTICATION_REQUIRED', context: null, currentFactoryId: null };
    await this.secureStorage.clear();
  }
}
