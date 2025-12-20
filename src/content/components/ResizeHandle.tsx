interface ResizeHandleProps {
  onMouseDown: (e: React.MouseEvent) => void;
  isResizing: boolean;
  side: "left" | "right";
}

export function ResizeHandle({ onMouseDown, isResizing, side }: ResizeHandleProps) {
  const isLeft = side === "left";

  return (
    <div
      onMouseDown={onMouseDown}
      style={{
        position: "absolute",
        top: 0,
        [side]: -4,
        width: 12,
        height: "100%",
        cursor: "ew-resize",
        zIndex: 10,
      }}
    >
      <div
        style={{
          position: "absolute",
          top: "50%",
          [isLeft ? "left" : "right"]: 4,
          transform: "translateY(-50%)",
          width: 4,
          height: 32,
          borderRadius: 4,
          backgroundColor: isResizing ? "#3b82f6" : "#d1d5db",
          opacity: isResizing ? 1 : 0.5,
          transition: "background-color 0.15s, opacity 0.15s",
        }}
      />
    </div>
  );
}
