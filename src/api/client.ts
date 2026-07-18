import { createRequestId } from '@/idempotency';

const baseUrl = import.meta.env.VITE_MOM_API_BASE_URL || 'http://localhost:8080';

export interface RequestContext {
  accessToken?: string;
  factoryId?: string;
  correlationId?: string;
  idempotencyKey?: string;
}

export function request<T>(path: string, options: UniApp.RequestOptions & { context?: RequestContext }): Promise<T> {
  const context = options.context || {};
  return new Promise((resolve, reject) => {
    uni.request({
      ...options,
      url: `${baseUrl}${path}`,
      header: {
        'Content-Type': 'application/json',
        'X-Correlation-Id': context.correlationId || createRequestId('corr'),
        ...(context.factoryId ? { 'X-Factory-Id': context.factoryId } : {}),
        ...(context.idempotencyKey ? { 'X-Idempotency-Key': context.idempotencyKey } : {}),
        ...(context.accessToken ? { Authorization: `Bearer ${context.accessToken}` } : {}),
        ...(options.header || {}),
      },
      success: (response) => {
        if (response.statusCode >= 200 && response.statusCode < 300) resolve(response.data as T);
        else reject(new Error(`HTTP ${response.statusCode}`));
      },
      fail: (error) => reject(new Error(error.errMsg || '网络请求失败')),
    });
  });
}
