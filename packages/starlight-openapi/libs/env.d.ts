interface ImportMetaEnv {
  readonly BASE_URL: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

/**
 * Extend Starlight's i18n types with starlight-openapi translations.
 * This provides type-safe access to translation keys via `Astro.locals.t()`.
 *
 * Users can extend these translations in their own `src/content/i18n/{locale}.json` files.
 * @see https://starlight.astro.build/reference/plugins/#typing-plugin-translations
 */
declare namespace StarlightApp {
  type UIStrings = typeof import('./i18n').UIStrings.en
  interface I18n extends UIStrings {}
}
