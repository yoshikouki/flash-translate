export interface TranslationSettings {
  sourceLanguage: string;
  targetLanguage: string;
  enableStreaming: boolean;
  popupPosition: "auto" | "top" | "bottom";
}

const STORAGE_KEY = "flash-translate-settings";

const DEFAULT_SETTINGS: TranslationSettings = {
  sourceLanguage: "en",
  targetLanguage: "ja",
  enableStreaming: true,
  popupPosition: "auto",
};

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
