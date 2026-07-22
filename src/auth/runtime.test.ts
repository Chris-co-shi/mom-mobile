import { describe, expect, it, vi } from 'vitest';
import { AuthRuntimeError } from './errors';
import type { AuthorizationTransactionStore, HttpRequest, HttpResponse, HttpTransport, IdTokenValidator, SystemBrowser } from './ports';
import { MobileAuthRuntime } from './runtime';
import { H5MemoryRefreshTokenStorage, type SecureWriteOutcome } from './secure-storage';
import { MOBILE_CLIENT_ID, type AuthorizationTransaction, type MobileAccessContextResponse, type OAuthTokenResponse } from './types';

function base64Url(value: object): string {
  return btoa(JSON.stringify(value)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

function accessToken(sequence: number, userId = 'user-a', sid = 'sid-a'): string {
  return `${base64Url({ alg: 'RS256' })}.${base64Url({ sub: userId, sid, client_id: MOBILE_CLIENT_ID, seq: sequence })}.signature`;
}

const context: MobileAccessContextResponse = {
  userId: 'user-a', username: 'operator-a', displayName: 'Operator A', userType: 'INTERNAL',
  clientId: MOBILE_CLIENT_ID, sid: 'sid-a', mobileAccessEnabled: true,
  roles: ['PDA_OPERATOR'], permissions: ['wms:receipt:create'], factoryIds: ['factory-a'],
  partyType: null, partyId: null, currentFactoryId: 'factory-a',
};

class MemoryTransactions implements AuthorizationTransactionStore {
  value: AuthorizationTransaction | null = null;
  async load() { return this.value; }
  async save(value: AuthorizationTransaction) { this.value = value; }
  async clear() { this.value = null; }
}

class FakeBrowser implements SystemBrowser {
  urls: string[] = [];
  async open(url: string) { this.urls.push(url); }
}

class FakeIdTokenValidator implements IdTokenValidator {
  readonly validate = vi.fn(async () => undefined);
}

class FakeTransport implements HttpTransport {
  tokenCalls = 0;
  businessCalls = 0;
  businessMode: 'OK' | 'EXPIRE_ONCE' | 'FORBIDDEN' = 'OK';
  tokenDelay: (() => Promise<void>) | null = null;

  async request<T>(request: HttpRequest): Promise<HttpResponse<T>> {
    if (request.url.endsWith('/oauth2/token')) {
      this.tokenCalls += 1;
      if (this.tokenDelay) await this.tokenDelay();
      const body: OAuthTokenResponse = {
        access_token: accessToken(this.tokenCalls), refresh_token: `refresh-${this.tokenCalls}`,
        id_token: 'id-token', token_type: 'Bearer', expires_in: 600,
      };
      return { status: 200, headers: {}, body: body as T };
    }
    if (request.url.endsWith('/api/iam/me')) {
      return { status: 200, headers: {}, body: context as T };
    }
    this.businessCalls += 1;
    if (this.businessMode === 'FORBIDDEN') return { status: 403, headers: {}, body: {} as T };
    if (this.businessMode === 'EXPIRE_ONCE' && request.headers?.Authorization?.includes(accessToken(1))) {
      return { status: 401, headers: {}, body: {} as T };
    }
    return { status: 200, headers: {}, body: { ok: true } as T };
  }
}

class UncertainReplacementStorage extends H5MemoryRefreshTokenStorage {
  override async commitReplacement(): Promise<SecureWriteOutcome> { return 'UNKNOWN'; }
}

function runtime(
  transport: FakeTransport,
  storage = new H5MemoryRefreshTokenStorage(),
  transactions = new MemoryTransactions(),
  browser = new FakeBrowser(),
  unsynced = () => 0,
) {
  return {
    runtime: new MobileAuthRuntime({
      issuer: 'https://iam.example.test',
      authorizationEndpoint: 'https://iam.example.test/oauth2/authorize',
      tokenEndpoint: 'https://iam.example.test/oauth2/token',
      redirectUri: 'https://mobile.example.test/oauth2/callback',
    }, transport, storage, transactions, browser, new FakeIdTokenValidator(), () => 1_800_000, unsynced),
    storage, transactions, browser,
  };
}

describe('MobileAuthRuntime', () => {
  it('creates a recoverable PKCE S256 transaction before opening the system browser', async () => {
    const fixture = runtime(new FakeTransport());
    const url = await fixture.runtime.beginLogin('/pages/index/index');
    expect(fixture.transactions.value?.codeVerifier.length).toBeGreaterThan(43);
    expect(fixture.transactions.value?.returnRoute).toBe('/pages/index/index');
    expect(new URL(url).searchParams.get('code_challenge_method')).toBe('S256');
    expect(fixture.browser.urls).toEqual([url]);
  });

  it('completes an App Link callback from a persisted transaction and clears it once', async () => {
    const fixture = runtime(new FakeTransport());
    await fixture.runtime.beginLogin('/pages/index/index');
    const state = fixture.transactions.value?.state;
    const result = await fixture.runtime.handleCallback(
      `https://mobile.example.test/oauth2/callback?code=authorization-code&state=${state}`,
    );
    expect(result).toMatchObject({ userId: 'user-a', sid: 'sid-a', clientId: MOBILE_CLIENT_ID });
    expect(fixture.transactions.value).toBeNull();
    expect(await fixture.storage.read()).toMatchObject({ token: 'refresh-1', state: 'READY' });
  });

  it('requires explicit acknowledgement before login switching with unsynced commands', async () => {
    const fixture = runtime(new FakeTransport(), undefined, undefined, undefined, () => 2);
    await expect(fixture.runtime.beginLogin()).rejects.toMatchObject({
      code: 'unsynced_commands_require_confirmation',
    } satisfies Partial<AuthRuntimeError>);
    await expect(fixture.runtime.beginLogin(null, true)).resolves.toContain('client_id=mom-mobile-pda');
  });

  it('restores a cold-start session through refresh and authoritative /api/iam/me', async () => {
    const transport = new FakeTransport();
    const fixture = runtime(transport);
    await fixture.storage.storeInitial('refresh-initial');
    await expect(fixture.runtime.restoreColdStart()).resolves.toBe(true);
    expect(fixture.runtime.getSnapshot()).toMatchObject({
      status: 'AUTHENTICATED', currentFactoryId: 'factory-a', context: { userId: 'user-a', sid: 'sid-a' },
    });
    expect(transport.tokenCalls).toBe(1);
  });

  it('uses one refresh flight for concurrent 401 responses and retries each request once', async () => {
    const transport = new FakeTransport();
    const fixture = runtime(transport);
    await fixture.storage.storeInitial('refresh-initial');
    await fixture.runtime.restoreColdStart();
    transport.businessMode = 'EXPIRE_ONCE';
    transport.tokenDelay = () => new Promise((resolve) => setTimeout(resolve, 5));
    const [one, two] = await Promise.all([
      fixture.runtime.request<{ ok: boolean }>({ url: 'https://api.test/one', method: 'GET' }),
      fixture.runtime.request<{ ok: boolean }>({ url: 'https://api.test/two', method: 'GET' }),
    ]);
    expect(one.body.ok && two.body.ok).toBe(true);
    expect(transport.tokenCalls).toBe(2);
    expect(transport.businessCalls).toBe(4);
  });

  it('does not refresh a 403 response', async () => {
    const transport = new FakeTransport();
    const fixture = runtime(transport);
    await fixture.storage.storeInitial('refresh-initial');
    await fixture.runtime.restoreColdStart();
    transport.businessMode = 'FORBIDDEN';
    await expect(fixture.runtime.request({ url: 'https://api.test/forbidden', method: 'GET' }))
      .rejects.toMatchObject({ status: 403 });
    expect(transport.tokenCalls).toBe(1);
  });

  it('fails closed and never reuses the old token when local replacement is uncertain', async () => {
    const transport = new FakeTransport();
    const storage = new UncertainReplacementStorage();
    const fixture = runtime(transport, storage);
    await storage.storeInitial('refresh-initial');
    await expect(fixture.runtime.restoreColdStart()).resolves.toBe(false);
    expect(await storage.read()).toBeNull();
    expect(fixture.runtime.getSnapshot().status).toBe('REAUTHENTICATION_REQUIRED');
    await expect(fixture.runtime.restoreColdStart()).resolves.toBe(false);
    expect(transport.tokenCalls).toBe(1);
  });
});
