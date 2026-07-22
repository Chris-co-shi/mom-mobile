export class AuthRuntimeError extends Error {
  constructor(public readonly code: string, message: string) {
    super(message);
    this.name = 'AuthRuntimeError';
  }
}

export class HttpStatusError extends Error {
  constructor(public readonly status: number, public readonly body: unknown) {
    super(`HTTP ${status}`);
    this.name = 'HttpStatusError';
  }
}
