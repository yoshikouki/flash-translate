/**
 * Type-safe wrapper for chrome.i18n.getMessage
 * Returns the localized message or the key if not found (dev fallback)
 */
export function getMessage(
  key: string,
  substitutions?: string | string[]
): string {
  const message = chrome.i18n.getMessage(key, substitutions);

  // In development, return the key if message is empty
  // This helps identify missing translations
  if (!message) {
    if (import.meta.env.DEV) {
      console.warn(`[i18n] Missing translation for key: ${key}`);
    }
    return key;
  }

  return message;
}

/**
 * Get current UI language
 */
export function getUILanguage(): string {
  return chrome.i18n.getUILanguage();
}

/**
 * Check if current locale matches a specific language
 */
export function isLocale(locale: string): boolean {
  const uiLang = getUILanguage();
  return uiLang.startsWith(locale);
}
