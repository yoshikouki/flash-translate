import { useState, useEffect, useRef } from "react";

const MAX_SELECTION_LENGTH = 5000;
const SELECTION_DELAY_MS = 10;

export interface SelectionInfo {
  text: string;
  rect: DOMRect;
}

export function useTextSelection() {
  const [selection, setSelection] = useState<SelectionInfo | null>(null);
  const [isVisible, setIsVisible] = useState(true);
  const lastSelectionTextRef = useRef<string | null>(null);

  const handleMouseUp = () => {
    // Delay to ensure selection is complete
    setTimeout(() => {
      const windowSelection = window.getSelection();
      const selectedText = windowSelection?.toString().trim();

      if (selectedText && selectedText.length > 0 && selectedText.length < MAX_SELECTION_LENGTH) {
        try {
          const range = windowSelection?.getRangeAt(0);
          const rect = range?.getBoundingClientRect();

          if (rect && rect.width > 0 && rect.height > 0) {
            // Show popup for new selections
            if (selectedText !== lastSelectionTextRef.current) {
              setIsVisible(true);
            }
            lastSelectionTextRef.current = selectedText;
            setSelection({
              text: selectedText,
              rect,
            });
          }
        } catch {
          if (selectedText !== lastSelectionTextRef.current) {
            setIsVisible(true);
          }
          lastSelectionTextRef.current = selectedText;
          setSelection({
              text: selectedText,
              rect: document.body.getBoundingClientRect(),
            });
        }
      }
    }, SELECTION_DELAY_MS);
  };

  const handleMouseDown = (event: MouseEvent) => {
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
        lastSelectionTextRef.current = null;
      }
    }
  };

  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === "Escape") {
      // Escape key hides popup but keeps text selection
      setIsVisible(false);
    }
  };

  // Dismiss popup without clearing text selection
  const dismissPopup = () => {
    setIsVisible(false);
  };

  // Clear selection completely (used when excluding sites)
  const clearSelection = () => {
    setSelection(null);
    setIsVisible(false);
    lastSelectionTextRef.current = null;
    // Also clear the browser's text selection to prevent re-triggering
    window.getSelection()?.removeAllRanges();
  };

  useEffect(() => {
    document.addEventListener("mouseup", handleMouseUp);
    document.addEventListener("mousedown", handleMouseDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mouseup", handleMouseUp);
      document.removeEventListener("mousedown", handleMouseDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return { selection, isVisible, dismissPopup, clearSelection };
}
