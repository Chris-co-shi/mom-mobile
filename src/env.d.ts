/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_MOM_API_BASE_URL?: string;
  readonly VITE_MOM_IAM_ISSUER?: string;
  readonly VITE_MOM_MOBILE_REDIRECT_URI?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
