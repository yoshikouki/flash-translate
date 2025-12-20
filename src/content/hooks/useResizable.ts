import { useCallback, useEffect, useRef, useState } from "react";

interface UseResizableOptions {
  initialWidth: number;
  minWidth?: number;
  maxWidth?: number;
  onResizeEnd?: (width: number) => void;
}

interface UseResizableReturn {
  width: number;
  isResizing: boolean;
  offsetX: number;
  handleLeftMouseDown: (e: React.MouseEvent) => void;
  handleRightMouseDown: (e: React.MouseEvent) => void;
}

export function useResizable({
  initialWidth,
  minWidth = 280,
  maxWidth = 600,
  onResizeEnd,
}: UseResizableOptions): UseResizableReturn {
  const [width, setWidth] = useState(initialWidth);
  const [offsetX, setOffsetX] = useState(0);
  const [isResizing, setIsResizing] = useState(false);

  // Refs to store values at drag start
  const dragStartRef = useRef({
    mouseX: 0,
    width: 0,
    offsetX: 0,
    side: "right" as "left" | "right",
  });

  // Update width when initialWidth changes (e.g., from settings)
  useEffect(() => {
    setWidth(initialWidth);
  }, [initialWidth]);

  // Clamp width when maxWidth changes (e.g., window resize)
  useEffect(() => {
    setWidth((prev) => Math.min(prev, maxWidth));
  }, [maxWidth]);

  const handleLeftMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      dragStartRef.current = {
        mouseX: e.clientX,
        width: width,
        offsetX: offsetX,
        side: "left",
      };
      setIsResizing(true);
    },
    [width, offsetX]
  );

  const handleRightMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      dragStartRef.current = {
        mouseX: e.clientX,
        width: width,
        offsetX: offsetX,
        side: "right",
      };
      setIsResizing(true);
    },
    [width, offsetX]
  );

  useEffect(() => {
    if (!isResizing) return;

    const handleMouseMove = (e: MouseEvent) => {
      const { mouseX, width: startWidth, offsetX: startOffsetX, side } = dragStartRef.current;
      const deltaX = e.clientX - mouseX;

      if (side === "left") {
        // Left handle: drag left to increase width, right edge stays fixed
        // deltaX < 0 means mouse moved left = increase width
        const newWidth = Math.min(maxWidth, Math.max(minWidth, startWidth - deltaX));
        const widthChange = newWidth - startWidth;
        setWidth(newWidth);
        // Move popup left by the width increase to keep right edge fixed
        setOffsetX(startOffsetX - widthChange);
      } else {
        // Right handle: drag right to increase width, left edge stays fixed
        const newWidth = Math.min(maxWidth, Math.max(minWidth, startWidth + deltaX));
        setWidth(newWidth);
        // No offset change needed - left edge stays fixed
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      onResizeEnd?.(width);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isResizing, minWidth, maxWidth, onResizeEnd, width]);

  return {
    width,
    isResizing,
    offsetX,
    handleLeftMouseDown,
    handleRightMouseDown,
  };
}
