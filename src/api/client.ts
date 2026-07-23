import { createRequestId } from '@/idempotency';
import type { MobileAuthRuntime } from '@/auth';

const baseUrl = (import.meta.env.VITE_MOM_GATEWAY_BASE_URL
  ?? import.meta.env.VITE_MOM_API_BASE_URL
  ?? 'http://127.0.0.1:20000').replace(/\/$/, '');
let authRuntime: MobileAuthRuntime | null = null;

export interface RequestContext {
  correlationId?: string;
  idempotencyKey?: string;
}

export interface BusinessRequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  data?: unknown;
  header?: Record<string, string>;
  context?: RequestContext;
}

export function configureAuthenticatedClient(runtime: MobileAuthRuntime): void {
  authRuntime = runtime;
}

export async function request<T>(path: string, options: BusinessRequestOptions = {}): Promise<T> {
  if (!authRuntime) throw new Error('Mobile Auth Runtime 尚未配置');
  if (/^https?:\/\//u.test(path)) throw new Error('业务请求只能使用 Gateway-relative path');
  const context = options.context || {};
  const response = await authRuntime.request<T>({
    url: `${baseUrl}${path}`,
    method: options.method ?? 'GET',
    headers: {
      'Content-Type': 'application/json',
      'X-Correlation-Id': context.correlationId || createRequestId('corr'),
      ...(context.idempotencyKey ? { 'Idempotency-Key': context.idempotencyKey } : {}),
      ...(options.header || {}),
    },
    ...(options.data === undefined ? {} : { body: JSON.stringify(options.data) }),
  });
  return response.body;
}
