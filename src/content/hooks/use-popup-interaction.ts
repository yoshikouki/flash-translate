import {
  calculatePopupWidth,
  MIN_POPUP_WIDTH,
} from "../components/translation-card-utils";
import { calculatePopupPosition, type PopupPosition } from "./popup-position";
import { useDraggable } from "./use-draggable";
import { useResizable } from "./use-resizable";

interface UsePopupInteractionOptions {
  selectionRect: DOMRect;
  maxPopupWidth: number;
  popupHeight?: number;
  margin?: number;
}

interface UsePopupInteractionReturn {
  // Position
  position: PopupPosition | null;
  finalLeft: number;
  finalTop: number;
  // Size
  width: number;
  // Interaction state
  isResizing: boolean;
  isDragging: boolean;
  // Handlers
  handleLeftMouseDown: (e: React.MouseEvent) => void;
  handleRightMouseDown: (e: React.MouseEvent) => void;
  handleDragMouseDown: (e: React.MouseEvent) => void;
}

export function usePopupInteraction({
  selectionRect,
  maxPopupWidth,
  popupHeight = 180,
  margin = 8,
}: UsePopupInteractionOptions): UsePopupInteractionReturn {
  // Calculate popup width based on selection width (clamped to min/max)
  const selectionBasedWidth = calculatePopupWidth(
    selectionRect.width,
    maxPopupWidth
  );

  // Resizable behavior
  const {
    width,
    isResizing,
    offsetX: resizeOffsetX,
    handleLeftMouseDown,
    handleRightMouseDown,
  } = useResizable({
    initialWidth: selectionBasedWidth,
    minWidth: MIN_POPUP_WIDTH,
    maxWidth: maxPopupWidth,
  });

  // Draggable behavior
  const {
    offset,
    isDragging,
    handleMouseDown: handleDragMouseDown,
  } = useDraggable();

  // Calculate popup position directly using pure function
  const position = calculatePopupPosition(
    selectionRect,
    { popupWidth: selectionBasedWidth, popupHeight, margin },
    { width: window.innerWidth, height: window.innerHeight }
  );

  // Calculate final position including drag and resize offsets
  const finalLeft = position.x + offset.x + resizeOffsetX;
  const finalTop = position.y + offset.y;

  return {
    position,
    finalLeft,
    finalTop,
    width,
    isResizing,
    isDragging,
    handleLeftMouseDown,
    handleRightMouseDown,
    handleDragMouseDown,
  };
}
