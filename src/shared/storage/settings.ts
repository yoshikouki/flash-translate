export interface ExclusionPattern {
  id: string;
  pattern: string; // origin + path prefix (e.g., "https://example.com/admin")
  enabled: boolean;
}

export interface TranslationSettings {
  sourceLanguage: string;
  targetLanguage: string;
  enableStreaming: boolean;
  popupPosition: "auto" | "top" | "bottom";
  exclusionPatterns: ExclusionPattern[];
}

const STORAGE_KEY = "flash-translate-settings";

const DEFAULT_SETTINGS: TranslationSettings = {
  sourceLanguage: "en",
  targetLanguage: "ja",
  enableStreaming: true,
  popupPosition: "auto",
  exclusionPatterns: [],
};

// Helper to check if a URL matches any enabled exclusion pattern
export function isUrlExcluded(
  url: string,
  patterns: ExclusionPattern[]
): boolean {
  return patterns.some((p) => p.enabled && url.startsWith(p.pattern));
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
  } catch {
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
  } catch {
    // Silently fail if context is invalid
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
  } catch {
    return () => {};
  }
}

export { STORAGE_KEY, DEFAULT_SETTINGS };
