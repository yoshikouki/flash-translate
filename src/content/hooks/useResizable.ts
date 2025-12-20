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
  const [isResizing, setIsResizing] = useState(false);
  const startXRef = useRef(0);
  const startWidthRef = useRef(0);
  const directionRef = useRef<"left" | "right">("right");

  // Update width when initialWidth changes (e.g., from settings)
  useEffect(() => {
    setWidth(initialWidth);
  }, [initialWidth]);

  const handleLeftMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsResizing(true);
    startXRef.current = e.clientX;
    startWidthRef.current = width;
    directionRef.current = "left";
  }, [width]);

  const handleRightMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsResizing(true);
    startXRef.current = e.clientX;
    startWidthRef.current = width;
    directionRef.current = "right";
  }, [width]);

  useEffect(() => {
    if (!isResizing) return;

    const handleMouseMove = (e: MouseEvent) => {
      const deltaX = e.clientX - startXRef.current;
      // Left side: invert delta (drag left = increase width)
      const adjustedDelta = directionRef.current === "left" ? -deltaX : deltaX;
      const newWidth = Math.min(
        maxWidth,
        Math.max(minWidth, startWidthRef.current + adjustedDelta)
      );
      setWidth(newWidth);
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
    handleLeftMouseDown,
    handleRightMouseDown,
  };
}
