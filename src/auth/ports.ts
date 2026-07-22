import type { AuthorizationTransaction } from './types';

export interface HttpRequest {
  url: string;
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  headers?: Record<string, string>;
  body?: string;
}

export interface HttpResponse<T = unknown> {
  status: number;
  headers: Record<string, string>;
  body: T;
}

export interface HttpTransport {
  request<T>(request: HttpRequest): Promise<HttpResponse<T>>;
}

export interface SystemBrowser {
  open(url: string): Promise<void>;
}

export interface AuthorizationTransactionStore {
  load(): Promise<AuthorizationTransaction | null>;
  save(transaction: AuthorizationTransaction): Promise<void>;
  clear(): Promise<void>;
}

export interface IdTokenValidationInput {
  idToken: string;
  issuer: string;
  audience: string;
  nonce: string;
  nowEpochSeconds: number;
}

export interface IdTokenValidator {
  validate(input: IdTokenValidationInput): Promise<void>;
}
