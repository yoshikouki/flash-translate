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
    <div className="popup-wrapper">
      <header className="popup-header">
        <h1 className="popup-title">Flash Translate</h1>
      </header>

      <div className="language-selector">
        <select
          value={sourceLanguage}
          onChange={(e) => handleSourceLanguageChange(e.target.value)}
          className="language-select"
        >
          {SUPPORTED_LANGUAGES.map((lang) => (
            <option key={lang.code} value={lang.code}>
              {lang.nativeName}
            </option>
          ))}
        </select>

        <button
          onClick={swapLanguages}
          className="swap-button"
          aria-label="Swap languages"
          type="button"
        >
          ⇄
        </button>

        <select
          value={targetLanguage}
          onChange={(e) => handleTargetLanguageChange(e.target.value)}
          className="language-select"
        >
          {SUPPORTED_LANGUAGES.map((lang) => (
            <option key={lang.code} value={lang.code}>
              {lang.nativeName}
            </option>
          ))}
        </select>
      </div>

      <div className="translation-area">
        <textarea
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Enter text to translate... (⌘/Ctrl + Enter to translate)"
          className="input-textarea"
          rows={4}
        />

        <button
          onClick={handleTranslate}
          disabled={isLoading || !inputText.trim()}
          className="translate-button"
          type="button"
        >
          {isLoading ? "Translating..." : "Translate"}
        </button>

        {error && <div className="error-message">{error}</div>}

        <div className="output-area">
          {translatedText || (
            <span className="placeholder">Translation will appear here</span>
          )}
        </div>
      </div>

      <footer className="popup-footer">
        <span className="footer-hint">
          Select text on any page to translate instantly
        </span>
      </footer>
    </div>
  );
}
