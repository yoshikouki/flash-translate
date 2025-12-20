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
      className="absolute top-0 w-4 h-full cursor-ew-resize z-10 flex items-center justify-center"
      style={{ [side]: -6 }}
    >
      <GripVertical
        size={16}
        className={`transition-[color,opacity] duration-150 ${
          isResizing ? "text-blue-500 opacity-100" : "text-gray-400 opacity-70"
        }`}
      />
    </div>
  );
}
