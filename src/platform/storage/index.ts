export interface StorageAdapter {
  get<T>(key: string, fallback: T): T;
  set<T>(key: string, value: T): void;
  remove(key: string): void;
}

export const storage: StorageAdapter = {
  get<T>(key: string, fallback: T): T {
    try {
      const value = uni.getStorageSync(key) as T | undefined;
      return value === undefined || value === '' ? fallback : value;
    } catch {
      return fallback;
    }
  },
  set<T>(key: string, value: T): void {
    uni.setStorageSync(key, value);
  },
  remove(key: string): void {
    uni.removeStorageSync(key);
  },
};
