import { useState } from "react";

export default function App() {
  const [inputText, setInputText] = useState("");
  const [translatedText, setTranslatedText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sourceLanguage, setSourceLanguage] = useState("en");
  const [targetLanguage, setTargetLanguage] = useState("ja");

  const handleTranslate = async () => {
    if (!inputText.trim()) return;

    setIsLoading(true);
    setTranslatedText("");

    try {
      // Check if Translator API is available
      if (!("Translator" in window)) {
        setTranslatedText("Translator API is not available in this browser.");
        return;
      }

      // @ts-expect-error Translator API types
      const translator = await window.Translator.create({
        sourceLanguage,
        targetLanguage,
      });

      const result = await translator.translate(inputText);
      setTranslatedText(result);
      translator.destroy();
    } catch (error) {
      console.error("Translation error:", error);
      setTranslatedText(
        `Error: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    } finally {
      setIsLoading(false);
    }
  };

  const swapLanguages = () => {
    setSourceLanguage(targetLanguage);
    setTargetLanguage(sourceLanguage);
    setInputText(translatedText);
    setTranslatedText(inputText);
  };

  return (
    <div className="popup-wrapper">
      <header className="popup-header">
        <h1 className="popup-title">Flash Translate</h1>
      </header>

      <div className="language-selector">
        <select
          value={sourceLanguage}
          onChange={(e) => setSourceLanguage(e.target.value)}
          className="language-select"
        >
          <option value="en">English</option>
          <option value="ja">Japanese</option>
          <option value="zh">Chinese</option>
          <option value="ko">Korean</option>
          <option value="es">Spanish</option>
          <option value="fr">French</option>
          <option value="de">German</option>
        </select>

        <button
          onClick={swapLanguages}
          className="swap-button"
          aria-label="Swap languages"
        >
          ⇄
        </button>

        <select
          value={targetLanguage}
          onChange={(e) => setTargetLanguage(e.target.value)}
          className="language-select"
        >
          <option value="ja">Japanese</option>
          <option value="en">English</option>
          <option value="zh">Chinese</option>
          <option value="ko">Korean</option>
          <option value="es">Spanish</option>
          <option value="fr">French</option>
          <option value="de">German</option>
        </select>
      </div>

      <div className="translation-area">
        <textarea
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Enter text to translate..."
          className="input-textarea"
          rows={4}
        />

        <button
          onClick={handleTranslate}
          disabled={isLoading || !inputText.trim()}
          className="translate-button"
        >
          {isLoading ? "Translating..." : "Translate"}
        </button>

        <div className="output-area">
          {translatedText || (
            <span className="placeholder">Translation will appear here</span>
          )}
        </div>
      </div>
    </div>
  );
}
