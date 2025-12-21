import { useState, useRef } from "react";
import { Pencil, X } from "lucide-react";
import type { ExclusionPattern } from "@/shared/storage/settings";
import { cn } from "@/lib/utils";

interface ExclusionPatternItemProps {
  pattern: ExclusionPattern;
  onPatternChange: (updated: ExclusionPattern) => void;
  onDelete: () => void;
}

export function ExclusionPatternItem({
  pattern,
  onPatternChange,
  onDelete,
}: ExclusionPatternItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const editInputRef = useRef<HTMLInputElement>(null);

  const handleToggle = () => {
    onPatternChange({ ...pattern, enabled: !pattern.enabled });
  };

  const handleSaveEdit = () => {
    const newPatternValue = editInputRef.current?.value.trim();
    if (!newPatternValue) return;

    onPatternChange({ ...pattern, pattern: newPatternValue });
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
  };

  const formatUrl = (url: string) => {
    try {
      const parsed = new URL(url);
      return parsed.hostname + (parsed.pathname !== "/" ? parsed.pathname : "");
    } catch {
      return url;
    }
  };

  if (isEditing) {
    return (
      <div className="flex items-center gap-1.5">
        <input
          ref={editInputRef}
          type="text"
          defaultValue={pattern.pattern}
          className="flex-1 text-sm bg-white border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
          autoFocus
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSaveEdit();
            if (e.key === "Escape") handleCancelEdit();
          }}
        />
        <button
          onClick={handleSaveEdit}
          className="text-xs text-blue-600 hover:text-blue-800 px-1.5"
          type="button"
        >
          OK
        </button>
        <button
          onClick={handleCancelEdit}
          className="text-xs text-gray-500 hover:text-gray-700 px-1.5"
          type="button"
        >
          x
        </button>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex items-center gap-2 px-2 py-1.5 rounded",
        pattern.enabled ? "bg-gray-100" : "bg-gray-50"
      )}
    >
      <input
        type="checkbox"
        checked={pattern.enabled}
        onChange={handleToggle}
        className="w-3.5 h-3.5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
      />
      <span
        className={cn(
          "flex-1 text-xs truncate",
          pattern.enabled ? "text-gray-700" : "text-gray-400"
        )}
        title={pattern.pattern}
      >
        {formatUrl(pattern.pattern)}
      </span>
      <button
        onClick={() => setIsEditing(true)}
        className="text-gray-400 hover:text-blue-600 p-0.5"
        type="button"
        title="Edit"
      >
        <Pencil size={12} />
      </button>
      <button
        onClick={onDelete}
        className="text-gray-400 hover:text-red-600 p-0.5"
        type="button"
        title="Delete"
      >
        <X size={12} />
      </button>
    </div>
  );
}
