import { calculatePopupPosition, type PopupPosition } from "./popup-position";

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
}: UsePopupPositionOptions): PopupPosition | null {
  if (!selectionRect) {
    return null;
  }

  return calculatePopupPosition(
    selectionRect,
    { popupWidth, popupHeight, margin },
    { width: window.innerWidth, height: window.innerHeight }
  );
}
