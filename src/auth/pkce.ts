import type { AuthorizationTransactionStore } from './ports';
import type { AuthorizationTransaction } from './types';

const PKCE_STORAGE_KEY = 'mom-mobile:auth:pkce-transaction:v1';

function base64Url(bytes: Uint8Array): string {
  let binary = '';
  bytes.forEach((byte) => { binary += String.fromCharCode(byte); });
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

export function randomUrlSafe(byteLength = 32): string {
  const bytes = new Uint8Array(byteLength);
  crypto.getRandomValues(bytes);
  return base64Url(bytes);
}

export async function createPkcePair(): Promise<{ verifier: string; challenge: string }> {
  const verifier = randomUrlSafe(64);
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(verifier));
  return { verifier, challenge: base64Url(new Uint8Array(digest)) };
}

/** PKCE 事务允许持久化以承受进程回收，但与 Refresh Token 安全存储完全隔离。 */
export class UniAuthorizationTransactionStore implements AuthorizationTransactionStore {
  async load(): Promise<AuthorizationTransaction | null> {
    const value = uni.getStorageSync(PKCE_STORAGE_KEY) as AuthorizationTransaction | '' | undefined;
    return value && typeof value === 'object' ? value : null;
  }

  async save(transaction: AuthorizationTransaction): Promise<void> {
    uni.setStorageSync(PKCE_STORAGE_KEY, transaction);
  }

  async clear(): Promise<void> {
    uni.removeStorageSync(PKCE_STORAGE_KEY);
  }
}
