import { configureAuthenticatedClient } from '@/api/client';
import { countUnsyncedCommands } from '@/offline/service';
import { RemoteJwksIdTokenValidator } from './oidc';
import { UniAuthorizationTransactionStore } from './pkce';
import { MobileAuthRuntime } from './runtime';
import { H5MemoryRefreshTokenStorage, type AndroidSecureStorageBridge, type RefreshTokenSecureStorage } from './secure-storage';
import type { AuthRuntimeConfig } from './types';
import { UniHttpTransport, UniSystemBrowser } from './uni-adapters';

let activeRuntime: MobileAuthRuntime | null = null;

export function createMobileAuthRuntime(
  secureStorage: RefreshTokenSecureStorage,
  overrides: Partial<AuthRuntimeConfig> = {},
): MobileAuthRuntime {
  const issuer = (overrides.issuer ?? import.meta.env.VITE_MOM_IAM_ISSUER ?? 'http://127.0.0.1:8100').replace(/\/$/, '');
  const config: AuthRuntimeConfig = {
    issuer,
    authorizationEndpoint: `${issuer}/oauth2/authorize`,
    tokenEndpoint: `${issuer}/oauth2/token`,
    redirectUri: import.meta.env.VITE_MOM_MOBILE_REDIRECT_URI ?? 'http://127.0.0.1:5173/oauth2/callback',
    ...overrides,
  };
  if (import.meta.env.PROD && (!config.redirectUri.startsWith('https://') || !config.issuer.startsWith('https://'))) {
    throw new Error('正式环境必须使用 HTTPS Issuer 与已验证 HTTPS App Link');
  }
  const transport = new UniHttpTransport();
  const runtime = new MobileAuthRuntime(
    config,
    transport,
    secureStorage,
    new UniAuthorizationTransactionStore(),
    new UniSystemBrowser(),
    new RemoteJwksIdTokenValidator(transport),
    Date.now,
    countUnsyncedCommands,
  );
  activeRuntime = runtime;
  configureAuthenticatedClient(runtime);
  return runtime;
}

/** H5 开发运行时仅使用内存 Refresh Token；刷新页面后必须重新登录。 */
export function createH5AuthRuntime(overrides: Partial<AuthRuntimeConfig> = {}): MobileAuthRuntime {
  return createMobileAuthRuntime(new H5MemoryRefreshTokenStorage(), overrides);
}

/** Android 启动代码只能通过 Keystore 原生桥接注入安全存储，不能回退普通 uni storage。 */
export function createAndroidAuthRuntime(
  bridge: AndroidSecureStorageBridge,
  overrides: Partial<AuthRuntimeConfig> = {},
): MobileAuthRuntime {
  if (bridge.implementation !== 'android-keystore') throw new Error('Android 必须使用 Keystore 安全存储桥接');
  return createMobileAuthRuntime(bridge, overrides);
}

export function getMobileAuthRuntime(): MobileAuthRuntime | null {
  return activeRuntime;
}
