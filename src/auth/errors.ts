export class AuthRuntimeError extends Error {
  constructor(public readonly code: string, message: string) {
    super(message);
    this.name = 'AuthRuntimeError';
  }
}

export class HttpStatusError extends Error {
  readonly code: string;
  readonly correlationId?: string;
  readonly retryAfter?: string;

  constructor(
    public readonly status: number,
    public readonly body: unknown,
    headers: Record<string, string> = {},
  ) {
    const payload = body && typeof body === 'object' ? body as Record<string, unknown> : {};
    const message = typeof payload.message === 'string' && payload.message.trim()
      ? payload.message
      : defaultHttpMessage(status);
    super(message);
    this.name = 'HttpStatusError';
    this.code = typeof payload.code === 'string' && payload.code.trim()
      ? payload.code
      : `http_${status}`;
    this.correlationId = headers['x-correlation-id']
      ?? (typeof payload.correlationId === 'string' ? payload.correlationId : undefined);
    this.retryAfter = headers['retry-after'];
  }
}

function defaultHttpMessage(status: number): string {
  if (status === 401) return '认证已失效或 Session 已撤销';
  if (status === 403) return '当前用户没有执行该操作的权限';
  if (status === 404) return '对象不存在或当前主体不可访问';
  if (status === 409) return '业务状态已变化，需要重新读取';
  if (status === 429) return '请求过于频繁，请按 Retry-After 稍后重试';
  if (status >= 500) return 'MOM 服务暂时不可用';
  return 'MOM API 请求失败';
}
