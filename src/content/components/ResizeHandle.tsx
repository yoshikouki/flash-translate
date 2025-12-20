import { GripVertical } from "lucide-react";

interface ResizeHandleProps {
  onMouseDown: (e: React.MouseEvent) => void;
  isResizing: boolean;
  side: "left" | "right";
}

export function ResizeHandle({ onMouseDown, isResizing, side }: ResizeHandleProps) {
  return (
    <div
      onMouseDown={onMouseDown}
      style={{
        position: "absolute",
        top: 0,
        [side]: -6,
        width: 16,
        height: "100%",
        cursor: "ew-resize",
        zIndex: 10,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <GripVertical
        size={16}
        style={{
          color: isResizing ? "#3b82f6" : "#9ca3af",
          opacity: isResizing ? 1 : 0.7,
          transition: "color 0.15s, opacity 0.15s",
        }}
      />
    </div>
  );
}
