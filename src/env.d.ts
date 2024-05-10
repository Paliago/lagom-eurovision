/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_REFLECT_URL: string;
  VITE_BASELIME_API_KEY: string;
  // more env variables...
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
