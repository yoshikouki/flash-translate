import { GripVertical } from "lucide-react";
import { cn } from "@/lib/utils";
import { getMessage } from "@/shared/utils/i18n";

interface ResizeHandleProps {
  onMouseDown: (e: React.MouseEvent) => void;
  isResizing: boolean;
  side: "left" | "right";
}

export function ResizeHandle({
  onMouseDown,
  isResizing,
  side,
}: ResizeHandleProps) {
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
      aria-valuenow={50}
      className="absolute top-0 z-10 flex h-full w-4 cursor-ew-resize items-center justify-center"
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
