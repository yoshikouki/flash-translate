import { GripHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import { getMessage } from "@/shared/utils/i18n";

interface DragHandleProps {
  onMouseDown: (e: React.MouseEvent) => void;
  isDragging: boolean;
}

export function DragHandle({ onMouseDown, isDragging }: DragHandleProps) {
  return (
    // biome-ignore lint/a11y/useSemanticElements: <button> would change default styles and behavior
    <div
      aria-label={getMessage("content_movePopup")}
      className="absolute top-0 right-0 left-0 z-10 flex h-4 cursor-move items-center justify-center"
      onMouseDown={onMouseDown}
      role="button"
      tabIndex={0}
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
