// Pure functions for URL parsing and validation
// These are extracted from useCurrentTabUrl hook for testability

/**
 * List of internal browser URL prefixes that should be excluded
 */
export const INTERNAL_URL_PREFIXES = [
  "chrome",
  "chrome-extension",
  "edge",
  "about",
  "moz-extension",
  "file",
] as const;

/**
 * Extract origin from a URL string
 * Returns null if URL is invalid
 */
export function parseUrlToOrigin(url: string): string | null {
  if (!url) return null;

  try {
    return new URL(url).origin;
  } catch {
    return null;
  }
}

/**
 * Check if a URL or origin is an internal browser URL
 * Internal URLs include chrome://, edge://, about:, etc.
 */
export function isInternalBrowserUrl(urlOrOrigin: string): boolean {
  if (!urlOrOrigin) return false;

  const lowerUrl = urlOrOrigin.toLowerCase();
  return INTERNAL_URL_PREFIXES.some((prefix) => lowerUrl.startsWith(prefix));
}

/**
 * Get the valid origin from a URL, excluding internal browser URLs
 * Returns null if URL is invalid or is an internal browser URL
 */
export function getValidOrigin(url: string): string | null {
  // Check if URL itself is an internal browser URL first
  if (isInternalBrowserUrl(url)) return null;

  const origin = parseUrlToOrigin(url);
  if (!origin) return null;

  // Some browser URLs return "null" as origin string
  if (origin === "null") return null;

  return origin;
}
