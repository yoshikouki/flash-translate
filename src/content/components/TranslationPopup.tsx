import { useEffect, useState } from "react";
import { useTranslator } from "../hooks/useTranslator";
import { usePopupPosition } from "../hooks/usePopupPosition";
import type { SelectionInfo } from "../hooks/useTextSelection";
import { SUPPORTED_LANGUAGES } from "@/shared/constants/languages";
import {
  saveSettings,
  getSettings,
  generatePatternId,
} from "@/shared/storage/settings";

interface TranslationPopupProps {
  selection: SelectionInfo;
  sourceLanguage: string;
  targetLanguage: string;
  onClose: () => void;
}

export function TranslationPopup({
  selection,
  sourceLanguage: initialSource,
  targetLanguage: initialTarget,
  onClose,
}: TranslationPopupProps) {
  const [sourceLanguage, setSourceLanguage] = useState(initialSource);
  const [targetLanguage, setTargetLanguage] = useState(initialTarget);

  const { result, isLoading, error, translate, availability } = useTranslator({
    sourceLanguage,
    targetLanguage,
    streaming: true,
  });

  const [copied, setCopied] = useState(false);
  const [excludeConfirm, setExcludeConfirm] = useState(false);

  const handleExcludeSite = async () => {
    if (!excludeConfirm) {
      setExcludeConfirm(true);
      // Auto-reset after 3 seconds
      setTimeout(() => setExcludeConfirm(false), 3000);
      return;
    }

    // Second click - actually exclude the site
    const currentOrigin = window.location.origin;
    const settings = await getSettings();
    const newPattern = {
      id: generatePatternId(),
      pattern: currentOrigin,
      enabled: true,
    };
    await saveSettings({
      exclusionPatterns: [newPattern, ...settings.exclusionPatterns],
    });
    onClose();
  };

  const handleCopy = async () => {
    if (!result) return;
    try {
      await navigator.clipboard.writeText(result);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const handleOpenSettings = () => {
    const settingsUrl = chrome.runtime.getURL("src/popup/index.html");
    window.open(settingsUrl, "_blank");
  };

  const handleSourceChange = async (lang: string) => {
    setSourceLanguage(lang);
    await saveSettings({ sourceLanguage: lang });
  };

  const handleTargetChange = async (lang: string) => {
    setTargetLanguage(lang);
    await saveSettings({ targetLanguage: lang });
  };

  const handleSwap = async () => {
    const newSource = targetLanguage;
    const newTarget = sourceLanguage;
    setSourceLanguage(newSource);
    setTargetLanguage(newTarget);
    await saveSettings({
      sourceLanguage: newSource,
      targetLanguage: newTarget,
    });
  };

  const position = usePopupPosition({
    selectionRect: selection.rect,
    popupWidth: 320,
    popupHeight: 180,
  });

  // Translate when selection or language changes
  // Note: translate is intentionally excluded from deps to avoid infinite loops
  // (React Compiler handles memoization, but useEffect deps need explicit values)
  useEffect(() => {
    if (selection.text) {
      translate(selection.text);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selection.text, sourceLanguage, targetLanguage]);

  // Sync with props when they change (from settings)
  useEffect(() => {
    setSourceLanguage(initialSource);
  }, [initialSource]);

  useEffect(() => {
    setTargetLanguage(initialTarget);
  }, [initialTarget]);

  if (!position) return null;

  const headerHeight = 40;
  const contentPadding = 24;
  const maxContentHeight = Math.max(
    position.maxHeight - headerHeight - contentPadding,
    64
  );

  const style: React.CSSProperties = {
    position: "fixed",
    left: `${position.x}px`,
    top: `${position.y}px`,
    zIndex: 2147483647,
  };

  const renderContent = () => {
    if (availability === "unsupported") {
      return (
        <div className="text-red-600 text-sm bg-red-50 px-3 py-2 rounded-lg">
          Translator API is not supported in this browser. Please use Chrome
          138+ with the API enabled.
        </div>
      );
    }

    if (availability === "unavailable") {
      return (
        <div className="text-red-600 text-sm bg-red-50 px-3 py-2 rounded-lg">
          Translation from {sourceLanguage} to {targetLanguage} is not
          available.
        </div>
      );
    }

    if (error) {
      return (
        <div className="text-red-600 text-sm bg-red-50 px-3 py-2 rounded-lg">
          {error.message}
        </div>
      );
    }

    if (isLoading && !result) {
      return (
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
          <span className="text-gray-500 text-sm">
            {availability === "after-download"
              ? "Downloading translation model..."
              : "Translating..."}
          </span>
        </div>
      );
    }

    return (
      <div className="text-gray-800 text-base leading-relaxed whitespace-pre-wrap break-words">
        {result || (
          <span className="text-gray-400 italic">Translation...</span>
        )}
      </div>
    );
  };

  return (
    <div
      style={style}
      className="font-sans text-sm leading-normal text-gray-800"
    >
      <div className="bg-white rounded-xl border border-solid border-gray-200 shadow-2xl min-w-80 max-w-md">
        <div className="flex items-center justify-between px-3 py-2 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-100">
          {excludeConfirm ? (
            <>
              <span className="text-xs text-gray-600">このサイトで無効にする？</span>
              <div className="flex items-center gap-2">
                <button
                  className="text-xs px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition-colors cursor-pointer border-none"
                  onClick={handleExcludeSite}
                  type="button"
                >
                  無効にする
                </button>
                <button
                  className="text-gray-400 hover:text-gray-600 text-lg leading-none cursor-pointer bg-transparent border-none transition-colors p-1"
                  onClick={() => setExcludeConfirm(false)}
                  aria-label="Cancel"
                  type="button"
                >
                  ×
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center gap-1">
                <select
                  value={sourceLanguage}
                  onChange={(e) => handleSourceChange(e.target.value)}
                  className="text-xs text-blue-700 font-medium bg-transparent border-none cursor-pointer focus:outline-none hover:text-blue-900 pr-1"
                >
                  {SUPPORTED_LANGUAGES.map((lang) => (
                    <option key={lang.code} value={lang.code}>
                      {lang.code.toUpperCase()}
                    </option>
                  ))}
                </select>
                <button
                  onClick={handleSwap}
                  className="text-blue-400 hover:text-blue-600 text-xs cursor-pointer bg-transparent border-none px-1"
                  type="button"
                  aria-label="Swap languages"
                >
                  ⇄
                </button>
                <select
                  value={targetLanguage}
                  onChange={(e) => handleTargetChange(e.target.value)}
                  className="text-xs text-blue-700 font-medium bg-transparent border-none cursor-pointer focus:outline-none hover:text-blue-900 pr-1"
                >
                  {SUPPORTED_LANGUAGES.map((lang) => (
                    <option key={lang.code} value={lang.code}>
                      {lang.code.toUpperCase()}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex items-center gap-1">
                <button
                  className="text-gray-400 hover:text-blue-600 text-sm leading-none cursor-pointer bg-transparent border-none transition-colors p-1 disabled:opacity-30 disabled:cursor-not-allowed"
                  onClick={handleCopy}
                  disabled={!result}
                  aria-label="Copy translation"
                  type="button"
                >
                  {copied ? "✓" : "⧉"}
                </button>
                <button
                  className="text-sm leading-none cursor-pointer border-none transition-colors p-1 bg-transparent text-gray-400 hover:text-red-500"
                  onClick={handleExcludeSite}
                  aria-label="Exclude this site"
                  title="このサイトを除外"
                  type="button"
                >
                  ⊘
                </button>
                <button
                  className="text-gray-400 hover:text-blue-600 text-sm leading-none cursor-pointer bg-transparent border-none transition-colors p-1"
                  onClick={handleOpenSettings}
                  aria-label="Open settings"
                  type="button"
                >
                  ⚙
                </button>
                <button
                  className="text-gray-400 hover:text-gray-600 text-xl leading-none cursor-pointer bg-transparent border-none transition-colors p-1 -mr-1"
                  onClick={onClose}
                  aria-label="Close"
                  type="button"
                >
                  ×
                </button>
              </div>
            </>
          )}
        </div>

        <div
          className="px-4 py-3 min-h-16"
          style={{
            maxHeight: `${maxContentHeight}px`,
            overflowY: "auto",
          }}
        >
          {renderContent()}
        </div>
      </div>
    </div>
  );
}
