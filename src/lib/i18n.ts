/* ══════════════════════════════════════════════════════════
   i18n — Language helpers for Bouteille
   ══════════════════════════════════════════════════════════ */

export const SUPPORTED_LANGUAGES = ['en', 'fr', 'nl'] as const
export type Language = (typeof SUPPORTED_LANGUAGES)[number]
export const DEFAULT_LANGUAGE: Language = 'en'

export const LANGUAGE_LABELS: Record<Language, string> = {
  en: 'EN',
  fr: 'FR',
  nl: 'NL',
}

/**
 * Validates and returns a supported language code, falling back to default
 */
export function validateLanguage(lang: string | undefined): Language {
  if (lang && SUPPORTED_LANGUAGES.includes(lang as Language)) {
    return lang as Language
  }
  return DEFAULT_LANGUAGE
}

/**
 * Internationalized array item — supports both v4 (_key) and v5 (language) formats
 */
interface I18nItem {
  _key: string
  language?: string
  value: string
}

/**
 * Extracts a translated value from a Sanity internationalized array field.
 * Supports both v4 format (_key = lang) and v5 format (language = lang).
 * Falls back: requested lang → 'en' → first available → empty string
 */
export function getLocalizedValue(
  field: Array<I18nItem> | undefined | null,
  lang: Language
): string {
  if (!field || !Array.isArray(field) || field.length === 0) return ''

  // Try exact match (v5 `language` field first, then v4 `_key` fallback)
  const exact = field.find((item) => (item.language || item._key) === lang)
  if (exact?.value) return exact.value

  // Fallback to English
  const en = field.find((item) => (item.language || item._key) === 'en')
  if (en?.value) return en.value

  // Fallback to first available
  return field[0]?.value || ''
}

/**
 * Shorthand for components — creates a t() function bound to a language
 */
export function createTranslator(lang: Language) {
  return function t(
    field: Array<I18nItem> | undefined | null
  ): string {
    return getLocalizedValue(field, lang)
  }
}
