// Pure functions for popup position calculation
// Used by usePopupInteraction hook

/**
 * Minimum popup height constraint
 */
export const MIN_POPUP_HEIGHT = 100;

/**
 * Interface for rectangle-like objects (avoids DOMRect dependency for testability)
 */
export interface RectLike {
  left: number;
  right: number;
  top: number;
  bottom: number;
  width: number;
  height: number;
}

/**
 * Viewport dimensions for position calculations
 */
export interface ViewportDimensions {
  width: number;
  height: number;
}

/**
 * Options for popup position calculation
 */
export interface PopupPositionOptions {
  popupWidth: number;
  popupHeight: number;
  margin: number;
}

/**
 * Result of popup position calculation
 */
export interface PopupPosition {
  x: number;
  y: number;
  placement: "bottom" | "top";
  maxHeight: number;
}

/**
 * Calculate horizontal position, centered on selection and clamped to viewport
 */
export function calculateHorizontalPosition(
  selectionRect: RectLike,
  popupWidth: number,
  viewportWidth: number,
  margin: number
): number {
  // Center popup on selection
  let x = selectionRect.left + selectionRect.width / 2 - popupWidth / 2;

  // Clamp to viewport bounds
  if (x < margin) {
    x = margin;
  } else if (x + popupWidth > viewportWidth - margin) {
    x = viewportWidth - popupWidth - margin;
  }

  return x;
}

/**
 * Calculate vertical position with placement decision
 */
export function calculateVerticalPosition(
  selectionRect: RectLike,
  popupHeight: number,
  viewportHeight: number,
  margin: number
): { y: number; placement: "bottom" | "top"; maxHeight: number } {
  // Calculate available space below and above the selection
  const spaceBelow = viewportHeight - selectionRect.bottom - margin * 2;
  const spaceAbove = selectionRect.top - margin * 2;

  // Prefer showing below the selection
  if (selectionRect.bottom + margin + popupHeight <= viewportHeight) {
    return {
      y: selectionRect.bottom + margin,
      placement: "bottom",
      maxHeight: Math.max(spaceBelow, MIN_POPUP_HEIGHT),
    };
  }

  // Show above if not enough space below
  if (selectionRect.top - margin - popupHeight >= 0) {
    return {
      y: selectionRect.top - margin - popupHeight,
      placement: "top",
      maxHeight: Math.max(spaceAbove, MIN_POPUP_HEIGHT),
    };
  }

  // Fallback: show below anyway, limit height to available space
  return {
    y: selectionRect.bottom + margin,
    placement: "bottom",
    maxHeight: Math.max(spaceBelow, MIN_POPUP_HEIGHT),
  };
}

/**
 * Main function combining horizontal and vertical calculations
 */
export function calculatePopupPosition(
  selectionRect: RectLike,
  options: PopupPositionOptions,
  viewport: ViewportDimensions
): PopupPosition {
  const { popupWidth, popupHeight, margin } = options;

  const x = calculateHorizontalPosition(
    selectionRect,
    popupWidth,
    viewport.width,
    margin
  );

  const { y, placement, maxHeight } = calculateVerticalPosition(
    selectionRect,
    popupHeight,
    viewport.height,
    margin
  );

  return { x, y, placement, maxHeight };
}
