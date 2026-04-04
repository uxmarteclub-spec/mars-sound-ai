/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string;
  readonly VITE_SUPABASE_ANON_KEY: string;
  /** URL pública completa da imagem do banner de login (Storage ou CDN). */
  readonly VITE_AUTH_BANNER_URL?: string;
  /**
   * Caminho no Storage público: `bucket/arquivo`, ex. `img-site/hero-login.webp`.
   * Montado como `{VITE_SUPABASE_URL}/storage/v1/object/public/{caminho}`.
   */
  readonly VITE_AUTH_BANNER_STORAGE_PATH?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
