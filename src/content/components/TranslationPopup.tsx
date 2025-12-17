import { useEffect, useState, useCallback } from "react";
import { useTranslator } from "../hooks/useTranslator";
import { usePopupPosition } from "../hooks/usePopupPosition";
import type { SelectionInfo } from "../hooks/useTextSelection";

interface TranslationPopupProps {
  selection: SelectionInfo;
  sourceLanguage: string;
  targetLanguage: string;
  onClose: () => void;
}

export function TranslationPopup({
  selection,
  sourceLanguage,
  targetLanguage,
  onClose,
}: TranslationPopupProps) {
  const { result, isLoading, error, translate, availability } = useTranslator({
    sourceLanguage,
    targetLanguage,
    streaming: true,
  });

  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    if (!result) return;
    try {
      await navigator.clipboard.writeText(result);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  }, [result]);

  const position = usePopupPosition({
    selectionRect: selection.rect,
    popupWidth: 320,
    popupHeight: 180,
  });

  // Translate when selection changes
  useEffect(() => {
    if (selection.text) {
      translate(selection.text);
    }
  }, [selection.text, translate]);

  if (!position) return null;

  // Header height (~36px) + padding (12px top + 12px bottom)
  const headerHeight = 36;
  const contentPadding = 24;
  const maxContentHeight = Math.max(position.maxHeight - headerHeight - contentPadding, 64);

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
      <div className="bg-white rounded-xl border border-gray-200 shadow-2xl min-w-80 max-w-md">
        <div className="flex items-center justify-between px-4 py-2 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-100">
          <span className="font-semibold text-blue-700 text-xs tracking-wide">
            {sourceLanguage.toUpperCase()} → {targetLanguage.toUpperCase()}
          </span>
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
              className="text-gray-400 hover:text-gray-600 text-xl leading-none cursor-pointer bg-transparent border-none transition-colors p-1 -mr-1"
              onClick={onClose}
              aria-label="Close"
              type="button"
            >
              ×
            </button>
          </div>
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
