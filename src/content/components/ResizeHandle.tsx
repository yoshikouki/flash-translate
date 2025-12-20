interface ResizeHandleProps {
  onMouseDown: (e: React.MouseEvent) => void;
  isResizing: boolean;
}

export function ResizeHandle({ onMouseDown, isResizing }: ResizeHandleProps) {
  return (
    <div
      className="absolute top-0 right-0 h-full w-2 cursor-ew-resize group"
      style={{
        cursor: "ew-resize",
      }}
      onMouseDown={onMouseDown}
    >
      <div
        className="absolute top-1/2 right-0 -translate-y-1/2 h-8 w-1 rounded-full transition-colors"
        style={{
          backgroundColor: isResizing ? "#3b82f6" : "#d1d5db",
          opacity: isResizing ? 1 : 0.6,
        }}
      />
    </div>
  );
}
