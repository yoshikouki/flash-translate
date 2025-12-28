import { GripVertical } from "lucide-react";
import { cn } from "@/lib/utils";
import { getMessage } from "@/shared/utils/i18n";

interface ResizeHandleProps {
  onMouseDown: (e: React.MouseEvent) => void;
  onKeyDown?: (e: React.KeyboardEvent) => void;
  isResizing: boolean;
  side: "left" | "right";
  /** Current width percentage (0-100) for aria-valuenow */
  widthPercent?: number;
}

export function ResizeHandle({
  onMouseDown,
  onKeyDown,
  isResizing,
  side,
  widthPercent = 50,
}: ResizeHandleProps) {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Forward arrow keys and Escape to parent for keyboard resizing
    if (e.key === "ArrowLeft" || e.key === "ArrowRight" || e.key === "Escape") {
      e.preventDefault();
      onKeyDown?.(e);
    }
  };

  return (
    // biome-ignore lint/a11y/useSemanticElements: <hr> is not appropriate for resize handle
    <div
      aria-label={
        side === "left"
          ? getMessage("content_resizeHandleLeft")
          : getMessage("content_resizeHandleRight")
      }
      aria-orientation="vertical"
      aria-valuemax={100}
      aria-valuemin={0}
      aria-valuenow={Math.round(widthPercent)}
      className="absolute top-0 z-10 flex h-full w-4 cursor-ew-resize items-center justify-center focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
      onKeyDown={handleKeyDown}
      onMouseDown={onMouseDown}
      role="separator"
      style={{ [side]: 0 }}
      tabIndex={0}
    >
      <GripVertical
        className={cn(
          "transition-[color,opacity] duration-150",
          isResizing ? "text-blue-500 opacity-100" : "text-gray-400 opacity-70"
        )}
        size={16}
      />
    </div>
  );
}
