interface Position {
  x: number;
  y: number;
  placement: "bottom" | "top";
  maxHeight: number;
}

interface UsePopupPositionOptions {
  selectionRect: DOMRect | null;
  popupWidth?: number;
  popupHeight?: number;
  margin?: number;
}

export function usePopupPosition({
  selectionRect,
  popupWidth = 320,
  popupHeight = 150,
  margin = 8,
}: UsePopupPositionOptions): Position | null {
  if (!selectionRect) return null;

  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;

  // Calculate horizontal position (centered on selection)
  let x = selectionRect.left + selectionRect.width / 2 - popupWidth / 2;

  // Clamp to viewport bounds
  if (x < margin) {
    x = margin;
  } else if (x + popupWidth > viewportWidth - margin) {
    x = viewportWidth - popupWidth - margin;
  }

  // Calculate vertical position
  let y: number;
  let placement: "bottom" | "top";
  let maxHeight: number;

  // Calculate available space below and above the selection
  const spaceBelow = viewportHeight - selectionRect.bottom - margin * 2;
  const spaceAbove = selectionRect.top - margin * 2;

  // Prefer showing below the selection
  if (selectionRect.bottom + margin + popupHeight <= viewportHeight) {
    y = selectionRect.bottom + margin;
    placement = "bottom";
    maxHeight = spaceBelow;
  } else if (selectionRect.top - margin - popupHeight >= 0) {
    // Show above if not enough space below
    y = selectionRect.top - margin - popupHeight;
    placement = "top";
    maxHeight = spaceAbove;
  } else {
    // Fallback: show below anyway, limit height to available space
    y = selectionRect.bottom + margin;
    placement = "bottom";
    maxHeight = spaceBelow;
  }

  // Ensure minimum height
  maxHeight = Math.max(maxHeight, 100);

  return { x, y, placement, maxHeight };
}
