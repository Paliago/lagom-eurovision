/// <reference types="vite/client" />
  interface ImportMetaEnv {
    readonly VITE_REFLECT_URL: string
  readonly VITE_BASELIME_API_KEY: string
  }
  interface ImportMeta {
    readonly env: ImportMetaEnv
  }