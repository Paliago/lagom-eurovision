/// <reference types="vite/client" />
  interface ImportMetaEnv {
    readonly VITE_REFLECT_URL: string
  }
  interface ImportMeta {
    readonly env: ImportMetaEnv
  }