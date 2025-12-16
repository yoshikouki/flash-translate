import { useEffect } from "react";
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

  const style: React.CSSProperties = {
    position: "fixed",
    left: `${position.x}px`,
    top: `${position.y}px`,
    zIndex: 2147483647,
  };

  const renderContent = () => {
    if (availability === "unsupported") {
      return (
        <div className="error-message">
          Translator API is not supported in this browser. Please use Chrome
          138+ with the API enabled.
        </div>
      );
    }

    if (availability === "unavailable") {
      return (
        <div className="error-message">
          Translation from {sourceLanguage} to {targetLanguage} is not
          available.
        </div>
      );
    }

    if (error) {
      return <div className="error-message">{error.message}</div>;
    }

    if (isLoading && !result) {
      return (
        <div className="loading-container">
          <div className="loading-spinner" />
          <span className="loading-text">
            {availability === "after-download"
              ? "Downloading translation model..."
              : "Translating..."}
          </span>
        </div>
      );
    }

    return (
      <div className="translation-result">
        {result || <span className="placeholder">Translation...</span>}
      </div>
    );
  };

  return (
    <div style={style} className="popup-container">
      <div className="popup-content">
        <div className="popup-header">
          <span className="popup-title">
            {sourceLanguage.toUpperCase()} → {targetLanguage.toUpperCase()}
          </span>
          <button
            className="popup-close"
            onClick={onClose}
            aria-label="Close"
            type="button"
          >
            ×
          </button>
        </div>

        <div className="popup-translation">{renderContent()}</div>
      </div>
    </div>
  );
}
