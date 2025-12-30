// Pure functions for text selection logic
// These are extracted from useTextSelection hook for testability

export const MAX_SELECTION_LENGTH = 5000;

interface RectLike {
  width: number;
  height: number;
}

export interface SelectionInfo {
  text: string;
  html: string;
  rect: DOMRect;
}

/**
 * Validates and normalizes selected text.
 * Returns trimmed text if valid, null otherwise.
 */
export function getValidSelectionText(
  text: string | undefined | null
): string | null {
  if (!text) {
    return null;
  }
  const trimmed = text.trim();
  if (trimmed.length === 0 || trimmed.length >= MAX_SELECTION_LENGTH) {
    return null;
  }
  return trimmed;
}

/**
 * Validates if the selection rectangle has valid dimensions
 */
export function isValidRect<T extends RectLike>(
  rect: T | undefined | null
): rect is T {
  if (!rect) {
    return false;
  }
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
  return eventPath.some((el) => el instanceof HTMLElement && el.id === hostId);
}

/**
 * Converts a DocumentFragment to an HTML string
 * Used to extract HTML from a selection range
 */
export function documentFragmentToHtml(fragment: DocumentFragment): string {
  const tempDiv = document.createElement("div");
  tempDiv.appendChild(fragment.cloneNode(true));
  return tempDiv.innerHTML;
}

/**
 * Validates HTML string
 * Returns trimmed HTML if valid, null otherwise
 */
export function getValidSelectionHtml(
  html: string | undefined | null
): string | null {
  if (!html) {
    return null;
  }
  const trimmed = html.trim();
  if (trimmed.length === 0) {
    return null;
  }
  return trimmed;
}
