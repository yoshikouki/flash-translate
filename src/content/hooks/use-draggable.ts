import { useEffect, useRef, useState } from "react";

interface UseDraggableOptions {
  onDragEnd?: (offset: { x: number; y: number }) => void;
}

interface UseDraggableReturn {
  offset: { x: number; y: number };
  isDragging: boolean;
  handleMouseDown: (e: React.MouseEvent) => void;
  resetOffset: () => void;
}

export function useDraggable({
  onDragEnd,
}: UseDraggableOptions = {}): UseDraggableReturn {
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const startMouseRef = useRef({ x: 0, y: 0 });
  const startOffsetRef = useRef({ x: 0, y: 0 });
  // Track current offset for mouseup handler without causing effect re-runs
  const currentOffsetRef = useRef(offset);
  currentOffsetRef.current = offset;

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
    startMouseRef.current = { x: e.clientX, y: e.clientY };
    startOffsetRef.current = offset;
  };

  const resetOffset = () => {
    setOffset({ x: 0, y: 0 });
  };

  useEffect(() => {
    if (!isDragging) {
      return;
    }

    const handleMouseMove = (e: MouseEvent) => {
      const deltaX = e.clientX - startMouseRef.current.x;
      const deltaY = e.clientY - startMouseRef.current.y;
      setOffset({
        x: startOffsetRef.current.x + deltaX,
        y: startOffsetRef.current.y + deltaY,
      });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      // Use ref to get latest offset without dependency
      onDragEnd?.(currentOffsetRef.current);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, onDragEnd]);

  return {
    offset,
    isDragging,
    handleMouseDown,
    resetOffset,
  };
}
