// Pure functions for text selection logic
// These are extracted from useTextSelection hook for testability

export const MAX_SELECTION_LENGTH = 5000;

export interface RectLike {
  width: number;
  height: number;
}

export interface SelectionInfo {
  text: string;
  rect: DOMRect;
}

/**
 * Validates if the selected text is within acceptable bounds
 */
export function isValidSelectionText(text: string | undefined | null): text is string {
  if (!text) return false;
  const trimmed = text.trim();
  return trimmed.length > 0 && trimmed.length < MAX_SELECTION_LENGTH;
}

/**
 * Validates if the selection rectangle has valid dimensions
 */
export function isValidRect<T extends RectLike>(rect: T | undefined | null): rect is T {
  if (!rect) return false;
  return rect.width > 0 && rect.height > 0;
}

/**
 * Determines if the popup should be shown for a new selection
 * Returns true if the text is different from the last selection
 */
export function shouldShowPopupForSelection(
  currentText: string,
  lastText: string | null
): boolean {
  return currentText !== lastText;
}

/**
 * Checks if a click event originated from inside the shadow DOM host
 */
export function isClickInsideShadowHost(
  eventPath: EventTarget[],
  hostId: string
): boolean {
  return eventPath.some(
    (el) => el instanceof HTMLElement && el.id === hostId
  );
}
