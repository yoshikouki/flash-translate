import { useEffect, useRef, useState } from "react";
import {
  getValidSelectionText,
  isClickInsideShadowHost,
  isNodeInContentEditable,
  isValidRect,
  type SelectionInfo,
  shouldShowPopupForSelection,
} from "./text-selection";

export type { SelectionInfo } from "./text-selection";

const SELECTION_DELAY_MS = 10;
const HOST_ID = "flash-translate-root";

export function useTextSelection() {
  const [selection, setSelection] = useState<SelectionInfo | null>(null);
  const [isVisible, setIsVisible] = useState(true);
  const lastSelectionTextRef = useRef<string | null>(null);

  const handleMouseUp = () => {
    // Delay to ensure selection is complete
    setTimeout(() => {
      const windowSelection = window.getSelection();

      // Skip translation for contenteditable elements (text inputs, editors, etc.)
      if (isNodeInContentEditable(windowSelection?.anchorNode ?? null)) {
        return;
      }

      const rawText = windowSelection?.toString();

      // Validate and normalize (trim) in pure function
      const validText = getValidSelectionText(rawText);
      if (!validText) {
        return;
      }

      let rect: DOMRect;
      try {
        const range = windowSelection?.getRangeAt(0);
        const rangeRect = range?.getBoundingClientRect();
        if (!isValidRect(rangeRect)) {
          return;
        }
        rect = rangeRect;
      } catch {
        // Fallback to body rect if range fails
        rect = document.body.getBoundingClientRect();
      }

      if (
        shouldShowPopupForSelection(validText, lastSelectionTextRef.current)
      ) {
        setIsVisible(true);
      }
      lastSelectionTextRef.current = validText;
      setSelection({ text: validText, rect });
    }, SELECTION_DELAY_MS);
  };

  const handleMouseDown = (event: MouseEvent) => {
    const target = event.target as HTMLElement;
    const shadowHost = document.getElementById(HOST_ID);

    // Close popup when clicking outside our UI
    if (shadowHost && !shadowHost.contains(target)) {
      const path = event.composedPath();
      if (!isClickInsideShadowHost(path, HOST_ID)) {
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

  // biome-ignore lint/correctness/useExhaustiveDependencies: React Compiler handles function memoization
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
