/**
 * Pure functions for calculating dropdown position.
 * Uses interface types for testability without DOM dependencies.
 */

export type DropdownPosition = "left" | "right";

/**
 * Rect-like interface for testability without DOMRect dependency
 */
export interface RectLike {
  left: number;
}

const DROPDOWN_MIN_WIDTH = 128;
const VIEWPORT_PADDING = 16;

/**
 * Calculates optimal dropdown position to avoid viewport overflow.
 * Returns "right" if dropdown would overflow right edge, otherwise "left".
 */
export function calculateDropdownPosition(
  buttonRect: RectLike,
  viewportWidth: number
): DropdownPosition {
  const rightEdge = buttonRect.left + DROPDOWN_MIN_WIDTH;
  const maxAllowedRight = viewportWidth - VIEWPORT_PADDING;

  if (rightEdge > maxAllowedRight) {
    return "right";
  }
  return "left";
}
