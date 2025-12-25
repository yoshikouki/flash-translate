import { GripHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";

interface DragHandleProps {
  onMouseDown: (e: React.MouseEvent) => void;
  isDragging: boolean;
}

export function DragHandle({ onMouseDown, isDragging }: DragHandleProps) {
  return (
    // biome-ignore lint/a11y/noNoninteractiveElementInteractions: Drag handle requires mouse interaction
    // biome-ignore lint/a11y/noStaticElementInteractions: Custom drag handle component
    <div
      className="absolute top-0 right-0 left-0 z-10 flex h-4 cursor-move items-center justify-center"
      onMouseDown={onMouseDown}
    >
      <GripHorizontal
        className={cn(
          "transition-[color,opacity] duration-150",
          isDragging ? "text-blue-500 opacity-100" : "text-gray-400 opacity-70"
        )}
        size={16}
      />
    </div>
  );
}
