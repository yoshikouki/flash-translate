import { useState, useEffect, useCallback } from "react";

const MAX_SELECTION_LENGTH = 5000;
const SELECTION_DELAY_MS = 10;

export interface SelectionInfo {
  text: string;
  rect: DOMRect;
}

export function useTextSelection() {
  const [selection, setSelection] = useState<SelectionInfo | null>(null);

  const handleMouseUp = useCallback(() => {
    // Delay to ensure selection is complete
    setTimeout(() => {
      const windowSelection = window.getSelection();
      const selectedText = windowSelection?.toString().trim();

      if (selectedText && selectedText.length > 0 && selectedText.length < MAX_SELECTION_LENGTH) {
        try {
          const range = windowSelection?.getRangeAt(0);
          const rect = range?.getBoundingClientRect();

          if (rect && rect.width > 0 && rect.height > 0) {
            setSelection({
              text: selectedText,
              rect,
            });
          }
        } catch {
          // getRangeAt can throw if there's no selection
        }
      }
    }, SELECTION_DELAY_MS);
  }, []);

  const handleMouseDown = useCallback(
    (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      // Close popup when clicking outside
      const shadowHost = document.getElementById("flash-translate-root");
      if (shadowHost && !shadowHost.contains(target)) {
        // Check if the click is inside our shadow DOM
        const path = event.composedPath();
        const isInsideOurUI = path.some(
          (el) => el instanceof HTMLElement && el.id === "flash-translate-root"
        );
        if (!isInsideOurUI) {
          setSelection(null);
        }
      }
    },
    []
  );

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (event.key === "Escape") {
      setSelection(null);
    }
  }, []);

  const clearSelection = useCallback(() => {
    setSelection(null);
  }, []);

  useEffect(() => {
    document.addEventListener("mouseup", handleMouseUp);
    document.addEventListener("mousedown", handleMouseDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mouseup", handleMouseUp);
      document.removeEventListener("mousedown", handleMouseDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleMouseUp, handleMouseDown, handleKeyDown]);

  return { selection, clearSelection };
}
