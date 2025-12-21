export interface ExclusionPattern {
  id: string;
  pattern: string; // origin + path prefix (e.g., "https://example.com/admin")
  enabled: boolean;
}

interface TranslationSettings {
  sourceLanguage: string;
  targetLanguage: string;
  exclusionPatterns: ExclusionPattern[];
  skipSameLanguage: boolean;
}

const STORAGE_KEY = "flash-translate-settings";

const DEFAULT_SETTINGS: TranslationSettings = {
  sourceLanguage: "en",
  targetLanguage: "ja",
  exclusionPatterns: [],
  skipSameLanguage: true,
};

// Helper to check if a URL matches any enabled exclusion pattern
export function isUrlExcluded(
  url: string,
  patterns: ExclusionPattern[]
): boolean {
  return patterns.some((p) => p.enabled && url.startsWith(p.pattern));
}

// Pure function: Normalize language code (e.g., "ja-JP" -> "ja", "zh-CN" -> "zh")
export function normalizeLanguageCode(lang: string): string {
  return lang.split(/[-_]/)[0].toLowerCase();
}

// Pure function: Check if languages match (both normalized for comparison)
export function isLanguageMatch(
  pageLanguage: string | null,
  targetLanguage: string
): boolean {
  if (!pageLanguage) return false;
  return (
    normalizeLanguageCode(pageLanguage) === normalizeLanguageCode(targetLanguage)
  );
}

// DOM accessor: Get the page's language from the HTML lang attribute
export function getPageLanguage(): string | null {
  const lang = document.documentElement.lang;
  return lang || null;
}

// Pure function: Determine if translation should be skipped
export function shouldSkipTranslation(
  targetLanguage: string,
  skipSameLanguage: boolean,
  pageLanguage: string | null
): boolean {
  if (!skipSameLanguage) return false;
  return isLanguageMatch(pageLanguage, targetLanguage);
}

// Generate a unique ID for exclusion patterns
export function generatePatternId(): string {
  return `pattern_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

// Check if extension context is still valid
function isContextValid(): boolean {
  try {
    return !!chrome.runtime?.id;
  } catch {
    return false;
  }
}

export async function getSettings(): Promise<TranslationSettings> {
  if (!isContextValid()) {
    return DEFAULT_SETTINGS;
  }

  try {
    const result = await chrome.storage.sync.get([STORAGE_KEY]);
    const settings = result[STORAGE_KEY] as
      | Partial<TranslationSettings>
      | undefined;
    return { ...DEFAULT_SETTINGS, ...settings };
  } catch (error) {
    if (import.meta.env.DEV) {
      console.error("[Flash Translate] Failed to get settings:", error);
    }
    return DEFAULT_SETTINGS;
  }
}

export async function saveSettings(
  settings: Partial<TranslationSettings>
): Promise<void> {
  if (!isContextValid()) {
    return;
  }

  try {
    const current = await getSettings();
    const updated = { ...current, ...settings };
    await chrome.storage.sync.set({ [STORAGE_KEY]: updated });
  } catch (error) {
    if (import.meta.env.DEV) {
      console.error("[Flash Translate] Failed to save settings:", error);
    }
  }
}

export function subscribeToSettings(
  callback: (settings: TranslationSettings) => void
): () => void {
  if (!isContextValid()) {
    return () => {};
  }

  const listener = (
    changes: { [key: string]: chrome.storage.StorageChange },
    areaName: string
  ) => {
    if (!isContextValid()) return;
    if (areaName === "sync" && changes[STORAGE_KEY]) {
      callback(changes[STORAGE_KEY].newValue as TranslationSettings);
    }
  };

  try {
    chrome.storage.onChanged.addListener(listener);
    return () => {
      if (isContextValid()) {
        chrome.storage.onChanged.removeListener(listener);
      }
    };
  } catch (error) {
    if (import.meta.env.DEV) {
      console.error("[Flash Translate] Failed to subscribe to settings:", error);
    }
    return () => {};
  }
}

