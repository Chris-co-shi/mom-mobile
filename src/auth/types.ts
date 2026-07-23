export const MOBILE_CLIENT_ID = 'mom-mobile-pda' as const;

export type AuthRuntimeStatus =
  | 'ANONYMOUS'
  | 'AUTHORIZING'
  | 'RESTORING'
  | 'AUTHENTICATED'
  | 'REAUTHENTICATION_REQUIRED';

export interface OAuthTokenResponse {
  access_token: string;
  refresh_token: string;
  id_token?: string;
  token_type: string;
  expires_in: number;
}

export interface MobileAccessContextResponse {
  userId: string;
  username: string;
  displayName: string;
  userType: string;
  clientId: string;
  sid: string;
  mobileAccessEnabled: boolean;
  roles: string[];
  permissions: string[];
  factoryIds: string[];
  partyType: string | null;
  partyId: string | null;
  currentFactoryId: string | null;
}

export interface MobileAccessContext extends MobileAccessContextResponse {
  userType: 'INTERNAL';
  clientId: typeof MOBILE_CLIENT_ID;
}

export interface AuthRuntimeSnapshot {
  status: AuthRuntimeStatus;
  context: MobileAccessContext | null;
  currentFactoryId: string | null;
}

export interface AuthRuntimeConfig {
  issuer: string;
  authorizationEndpoint: string;
  tokenEndpoint: string;
  jwksUri: string;
  gatewayBaseUrl: string;
  redirectUri: string;
  scope?: string;
  transactionTtlMs?: number;
}

export interface AuthorizationTransaction {
  state: string;
  nonce: string;
  codeVerifier: string;
  clientId: typeof MOBILE_CLIENT_ID;
  redirectUri: string;
  returnRoute: string | null;
  createdAt: number;
  expiresAt: number;
}
