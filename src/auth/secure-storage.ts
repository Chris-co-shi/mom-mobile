export type SecureWriteOutcome = 'COMMITTED' | 'REJECTED' | 'UNKNOWN';

export interface RefreshTokenRecord {
  token: string;
  state: 'READY' | 'IN_FLIGHT';
  operationId: string | null;
  updatedAt: string;
}

export interface RefreshTokenLease {
  token: string;
  operationId: string;
}

/**
 * Android Refresh Token 安全存储边界。
 *
 * 原生实现必须使用 Android Keystore 支持的加密存储，并在单个原子操作中完成
 * READY -> IN_FLIGHT 和 IN_FLIGHT -> 新 READY 的 CAS。任何进程崩溃后残留的
 * IN_FLIGHT 记录都不可再次使用；提交结果无法确认时必须返回 UNKNOWN。
 */
export interface RefreshTokenSecureStorage {
  read(): Promise<RefreshTokenRecord | null>;
  storeInitial(token: string): Promise<SecureWriteOutcome>;
  beginUse(operationId: string): Promise<RefreshTokenLease | null>;
  commitReplacement(operationId: string, replacementToken: string): Promise<SecureWriteOutcome>;
  invalidate(operationId?: string): Promise<void>;
  clear(): Promise<void>;
}

/** Android 原生插件必须提供的最小、可审计桥接协议。 */
export interface AndroidSecureStorageBridge extends RefreshTokenSecureStorage {
  readonly implementation: 'android-keystore';
}

/**
 * H5 仅使用进程内记录，刷新页面即丢失，绝不调用 localStorage、uni storage 或文件系统。
 */
export class H5MemoryRefreshTokenStorage implements RefreshTokenSecureStorage {
  private record: RefreshTokenRecord | null = null;

  async read(): Promise<RefreshTokenRecord | null> {
    return this.record ? { ...this.record } : null;
  }

  async storeInitial(token: string): Promise<SecureWriteOutcome> {
    this.record = { token, state: 'READY', operationId: null, updatedAt: new Date().toISOString() };
    return 'COMMITTED';
  }

  async beginUse(operationId: string): Promise<RefreshTokenLease | null> {
    if (!this.record || this.record.state !== 'READY') return null;
    const token = this.record.token;
    this.record = { ...this.record, state: 'IN_FLIGHT', operationId, updatedAt: new Date().toISOString() };
    return { token, operationId };
  }

  async commitReplacement(operationId: string, replacementToken: string): Promise<SecureWriteOutcome> {
    if (!this.record || this.record.state !== 'IN_FLIGHT' || this.record.operationId !== operationId) {
      return 'REJECTED';
    }
    this.record = {
      token: replacementToken,
      state: 'READY',
      operationId: null,
      updatedAt: new Date().toISOString(),
    };
    return 'COMMITTED';
  }

  async invalidate(operationId?: string): Promise<void> {
    if (!operationId || this.record?.operationId === operationId) this.record = null;
  }

  async clear(): Promise<void> {
    this.record = null;
  }
}
