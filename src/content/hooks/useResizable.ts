import { useEffect, useRef, useState } from "react";
import { calculateLeftResize, calculateRightResize } from "./resizable";

interface UseResizableOptions {
  initialWidth: number;
  minWidth?: number;
  maxWidth?: number;
  edgeMargin?: number;
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
  edgeMargin = 8,
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
    popupLeft: 0,
    popupRight: 0,
  });

  // Update width when initialWidth changes (e.g., from settings)
  useEffect(() => {
    setWidth(initialWidth);
  }, [initialWidth]);

  // Clamp width when maxWidth changes (e.g., window resize)
  useEffect(() => {
    setWidth((prev) => Math.min(prev, maxWidth));
  }, [maxWidth]);

  const getPopupRect = (e: React.MouseEvent) => {
    // Navigate up to find the popup container (the one with position: fixed)
    let element = e.currentTarget.parentElement;
    while (element && getComputedStyle(element).position !== "fixed") {
      element = element.parentElement;
    }
    if (element) {
      const rect = element.getBoundingClientRect();
      return { left: rect.left, right: rect.right };
    }
    return { left: 0, right: window.innerWidth };
  };

  const handleLeftMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const popupRect = getPopupRect(e);
    dragStartRef.current = {
      mouseX: e.clientX,
      width: width,
      offsetX: offsetX,
      side: "left",
      popupLeft: popupRect.left,
      popupRight: popupRect.right,
    };
    setIsResizing(true);
  };

  const handleRightMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const popupRect = getPopupRect(e);
    dragStartRef.current = {
      mouseX: e.clientX,
      width: width,
      offsetX: offsetX,
      side: "right",
      popupLeft: popupRect.left,
      popupRight: popupRect.right,
    };
    setIsResizing(true);
  };

  useEffect(() => {
    if (!isResizing) return;

    const handleMouseMove = (e: MouseEvent) => {
      const { mouseX, width: startWidth, offsetX: startOffsetX, side, popupLeft, popupRight } = dragStartRef.current;
      const deltaX = e.clientX - mouseX;
      const constraints = { minWidth, maxWidth, edgeMargin };

      if (side === "left") {
        const { newWidth, newOffsetX } = calculateLeftResize({
          deltaX,
          startWidth,
          startOffsetX,
          popupLeft,
          constraints,
        });
        setWidth(newWidth);
        setOffsetX(newOffsetX);
      } else {
        const { newWidth } = calculateRightResize({
          deltaX,
          startWidth,
          popupRight,
          viewportWidth: window.innerWidth,
          constraints,
        });
        setWidth(newWidth);
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
  }, [isResizing, minWidth, maxWidth, edgeMargin, onResizeEnd, width]);

  return {
    width,
    isResizing,
    offsetX,
    handleLeftMouseDown,
    handleRightMouseDown,
  };
}
