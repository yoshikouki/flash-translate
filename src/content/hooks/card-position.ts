// Pure functions for card position calculation

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

interface ViewportDimensions {
  width: number;
  height: number;
}

interface CardPositionOptions {
  cardWidth: number;
  cardHeight: number;
  margin: number;
}

interface CardPosition {
  x: number;
  y: number;
}

/**
 * Calculate horizontal position, centered on selection and clamped to viewport
 */
function calculateHorizontalPosition(
  selectionRect: RectLike,
  cardWidth: number,
  viewportWidth: number,
  margin: number
): number {
  // Center card on selection
  const x = selectionRect.left + selectionRect.width / 2 - cardWidth / 2;

  // Clamp to viewport bounds
  if (x < margin) {
    return margin;
  }
  if (x + cardWidth > viewportWidth - margin) {
    return viewportWidth - cardWidth - margin;
  }
  return x;
}

/**
 * Calculate vertical position: below the selection when the card fits there,
 * otherwise above it, and below it again when it fits neither side
 */
function calculateVerticalPosition(
  selectionRect: RectLike,
  cardHeight: number,
  viewportHeight: number,
  margin: number
): number {
  const below = selectionRect.bottom + margin;
  if (below + cardHeight <= viewportHeight) {
    return below;
  }

  const above = selectionRect.top - margin - cardHeight;
  if (above >= 0) {
    return above;
  }

  return below;
}

export function calculateCardPosition(
  selectionRect: RectLike,
  options: CardPositionOptions,
  viewport: ViewportDimensions
): CardPosition {
  const { cardWidth, cardHeight, margin } = options;

  return {
    x: calculateHorizontalPosition(
      selectionRect,
      cardWidth,
      viewport.width,
      margin
    ),
    y: calculateVerticalPosition(
      selectionRect,
      cardHeight,
      viewport.height,
      margin
    ),
  };
}
