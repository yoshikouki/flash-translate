import { useState, useEffect, useCallback } from "react";

interface SelectionInfo {
  text: string;
  rect: DOMRect;
}

export default function App() {
  const [selection, setSelection] = useState<SelectionInfo | null>(null);

  const handleMouseUp = useCallback(() => {
    setTimeout(() => {
      const windowSelection = window.getSelection();
      const selectedText = windowSelection?.toString().trim();

      if (selectedText && selectedText.length > 0) {
        const range = windowSelection?.getRangeAt(0);
        const rect = range?.getBoundingClientRect();

        if (rect) {
          setSelection({
            text: selectedText,
            rect,
          });
        }
      }
    }, 10);
  }, []);

  const handleMouseDown = useCallback(
    (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      // Check if click is outside our popup
      if (!target.closest("#flash-translate-root")) {
        setSelection(null);
      }
    },
    []
  );

  useEffect(() => {
    document.addEventListener("mouseup", handleMouseUp);
    document.addEventListener("mousedown", handleMouseDown);

    return () => {
      document.removeEventListener("mouseup", handleMouseUp);
      document.removeEventListener("mousedown", handleMouseDown);
    };
  }, [handleMouseUp, handleMouseDown]);

  if (!selection) {
    return null;
  }

  const { text, rect } = selection;
  const popupStyle: React.CSSProperties = {
    position: "fixed",
    left: `${rect.left + rect.width / 2}px`,
    top: `${rect.bottom + 8}px`,
    transform: "translateX(-50%)",
    zIndex: 2147483647,
  };

  return (
    <div style={popupStyle} className="popup-container">
      <div className="popup-content">
        <div className="popup-header">
          <span className="popup-title">Flash Translate</span>
          <button
            className="popup-close"
            onClick={() => setSelection(null)}
            aria-label="Close"
          >
            ×
          </button>
        </div>
        <div className="popup-original">
          <span className="label">Original:</span>
          <span className="text">{text}</span>
        </div>
        <div className="popup-translation">
          <span className="label">Translation:</span>
          <span className="text placeholder">Loading...</span>
        </div>
      </div>
    </div>
  );
}
