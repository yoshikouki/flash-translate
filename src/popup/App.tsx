import { useState, useEffect } from "react";
import {
  getSettings,
  saveSettings,
  subscribeToSettings,
} from "@/shared/storage/settings";
import { SUPPORTED_LANGUAGES } from "@/shared/constants/languages";
import { translatorManager } from "@/shared/utils/translator";

export default function App() {
  const [inputText, setInputText] = useState("");
  const [translatedText, setTranslatedText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sourceLanguage, setSourceLanguage] = useState("en");
  const [targetLanguage, setTargetLanguage] = useState("ja");

  // Load settings
  useEffect(() => {
    const loadSettings = async () => {
      const settings = await getSettings();
      setSourceLanguage(settings.sourceLanguage);
      setTargetLanguage(settings.targetLanguage);
    };

    loadSettings();

    const unsubscribe = subscribeToSettings((settings) => {
      setSourceLanguage(settings.sourceLanguage);
      setTargetLanguage(settings.targetLanguage);
    });

    return unsubscribe;
  }, []);

  // Save settings when language changes
  const handleSourceLanguageChange = async (lang: string) => {
    setSourceLanguage(lang);
    await saveSettings({ sourceLanguage: lang });
    setTranslatedText("");
  };

  const handleTargetLanguageChange = async (lang: string) => {
    setTargetLanguage(lang);
    await saveSettings({ targetLanguage: lang });
    setTranslatedText("");
  };

  const handleTranslate = async () => {
    if (!inputText.trim()) return;

    setIsLoading(true);
    setTranslatedText("");
    setError(null);

    try {
      const availability = await translatorManager.checkAvailability(
        sourceLanguage,
        targetLanguage
      );

      if (availability === "unsupported") {
        setError(
          "Translator API is not available. Please use Chrome 138+ with the API enabled."
        );
        return;
      }

      if (availability === "unavailable") {
        setError(
          `Translation from ${sourceLanguage} to ${targetLanguage} is not available.`
        );
        return;
      }

      // Use streaming for better UX
      let result = "";
      for await (const chunk of translatorManager.translateStreaming(
        inputText,
        sourceLanguage,
        targetLanguage
      )) {
        result = chunk;
        setTranslatedText(result);
      }
    } catch (err) {
      console.error("Translation error:", err);
      setError(err instanceof Error ? err.message : "Unknown error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const swapLanguages = async () => {
    const newSource = targetLanguage;
    const newTarget = sourceLanguage;
    setSourceLanguage(newSource);
    setTargetLanguage(newTarget);
    await saveSettings({
      sourceLanguage: newSource,
      targetLanguage: newTarget,
    });
    setInputText(translatedText);
    setTranslatedText(inputText);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      handleTranslate();
    }
  };

  return (
    <div className="w-80 p-4 bg-white">
      <header className="mb-4 pb-2 border-b border-gray-200">
        <h1 className="text-lg font-bold text-gray-800 m-0">Flash Translate</h1>
      </header>

      <div className="flex items-center gap-2 mb-4">
        <select
          value={sourceLanguage}
          onChange={(e) => handleSourceLanguageChange(e.target.value)}
          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-pointer"
        >
          {SUPPORTED_LANGUAGES.map((lang) => (
            <option key={lang.code} value={lang.code}>
              {lang.nativeName}
            </option>
          ))}
        </select>

        <button
          onClick={swapLanguages}
          className="px-3 py-2 bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded-lg cursor-pointer text-lg transition-colors"
          aria-label="Swap languages"
          type="button"
        >
          ⇄
        </button>

        <select
          value={targetLanguage}
          onChange={(e) => handleTargetLanguageChange(e.target.value)}
          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-pointer"
        >
          {SUPPORTED_LANGUAGES.map((lang) => (
            <option key={lang.code} value={lang.code}>
              {lang.nativeName}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-3">
        <textarea
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Enter text to translate... (⌘/Ctrl + Enter to translate)"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          rows={4}
        />

        <button
          onClick={handleTranslate}
          disabled={isLoading || !inputText.trim()}
          className="w-full py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-medium rounded-lg cursor-pointer transition-colors"
          type="button"
        >
          {isLoading ? "Translating..." : "Translate"}
        </button>

        {error && (
          <div className="text-red-600 text-sm bg-red-50 px-3 py-2 rounded-lg">
            {error}
          </div>
        )}

        <div className="min-h-20 p-3 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-800">
          {translatedText || (
            <span className="text-gray-400 italic">
              Translation will appear here
            </span>
          )}
        </div>
      </div>

      <footer className="mt-4 pt-3 border-t border-gray-200">
        <span className="text-xs text-gray-500">
          Select text on any page to translate instantly
        </span>
      </footer>
    </div>
  );
}
