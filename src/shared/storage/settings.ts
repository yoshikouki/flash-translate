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

export async function getSettings(): Promise<TranslationSettings> {
  try {
    const result = await chrome.storage.sync.get([STORAGE_KEY]);
    const settings = result[STORAGE_KEY] as Partial<TranslationSettings> | undefined;
    return { ...DEFAULT_SETTINGS, ...settings };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export async function saveSettings(
  settings: Partial<TranslationSettings>
): Promise<void> {
  const current = await getSettings();
  const updated = { ...current, ...settings };

  await chrome.storage.sync.set({ [STORAGE_KEY]: updated });
}

export function subscribeToSettings(
  callback: (settings: TranslationSettings) => void
): () => void {
  const listener = (
    changes: { [key: string]: chrome.storage.StorageChange },
    areaName: string
  ) => {
    if (areaName === "sync" && changes[STORAGE_KEY]) {
      callback(changes[STORAGE_KEY].newValue as TranslationSettings);
    }
  };

  chrome.storage.onChanged.addListener(listener);
  return () => chrome.storage.onChanged.removeListener(listener);
}

export { STORAGE_KEY, DEFAULT_SETTINGS };
