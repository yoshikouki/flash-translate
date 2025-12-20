import { GripHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";

interface DragHandleProps {
  onMouseDown: (e: React.MouseEvent) => void;
  isDragging: boolean;
}

export function DragHandle({ onMouseDown, isDragging }: DragHandleProps) {
  return (
    <div
      onMouseDown={onMouseDown}
      className="absolute top-0 left-0 right-0 h-4 cursor-move z-10 flex items-center justify-center"
    >
      <GripHorizontal
        size={16}
        className={cn(
          "transition-[color,opacity] duration-150",
          isDragging ? "text-blue-500 opacity-100" : "text-gray-400 opacity-70"
        )}
      />
    </div>
  );
}
