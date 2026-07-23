/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_MOM_API_BASE_URL?: string;
  readonly VITE_MOM_GATEWAY_BASE_URL?: string;
  readonly VITE_MOM_IAM_ISSUER?: string;
  readonly VITE_MOM_AUTHORIZATION_ENDPOINT?: string;
  readonly VITE_MOM_TOKEN_ENDPOINT?: string;
  readonly VITE_MOM_JWKS_URI?: string;
  readonly VITE_MOM_MOBILE_REDIRECT_URI?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
