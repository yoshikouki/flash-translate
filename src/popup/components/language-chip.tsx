import { cn } from "@/lib/utils";
import {
  getLanguageNativeName,
  getLanguageUpperCode,
} from "@/shared/constants/languages";
import type { DownloadStatus } from "../hooks/download-state";
import { StatusIndicator } from "./status-indicator";

export interface LanguageChipProps {
  languageCode: string;
  isSelected: boolean;
  status: DownloadStatus;
  onClick: () => void;
}

export function LanguageChip({
  languageCode,
  isSelected,
  status,
  onClick,
}: LanguageChipProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center gap-1 rounded px-2 py-1 text-xs transition-all duration-150",
        isSelected
          ? "bg-blue-500 text-white shadow-sm"
          : "border border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
      )}
      onClick={onClick}
      title={getLanguageNativeName(languageCode)}
      type="button"
    >
      <span>{getLanguageUpperCode(languageCode)}</span>
      <StatusIndicator status={status} />
    </button>
  );
}
