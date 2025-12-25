import { cn } from "@/lib/utils";
import type { TranslationAvailabilityStatus } from "@/shared/utils/translator";

// Extend status type to include UI-only states
type StatusIndicatorStatus =
  | TranslationAvailabilityStatus
  | "downloading"
  | "error";

interface StatusIndicatorProps {
  status: StatusIndicatorStatus;
  size?: "sm" | "md";
  onClick?: () => void;
  showDownloadHint?: boolean;
}

export function StatusIndicator({
  status,
  size = "sm",
  onClick,
  showDownloadHint = false,
}: StatusIndicatorProps) {
  const sizeClass = size === "sm" ? "w-2 h-2" : "w-3 h-3";
  const isClickable = onClick && status === "after-download";

  const baseClass = cn("inline-block rounded-full", sizeClass);

  if (status === "available") {
    return (
      <span className={cn(baseClass, "bg-green-500")} title="Downloaded" />
    );
  }

  if (status === "after-download") {
    return (
      <button
        className={cn(
          baseClass,
          "border-2 border-blue-500 bg-transparent",
          isClickable && "cursor-pointer hover:bg-blue-100"
        )}
        disabled={!isClickable}
        onClick={onClick}
        title={
          showDownloadHint ? "Click to download" : "Available for download"
        }
        type="button"
      />
    );
  }

  if (status === "downloading") {
    return (
      <span
        className={cn(
          baseClass,
          "animate-spin border-2 border-blue-500 border-t-transparent"
        )}
        title="Downloading..."
      />
    );
  }

  if (status === "error") {
    return (
      <span
        className={cn(baseClass, "bg-red-500")}
        title="Download failed - click to retry"
      />
    );
  }

  // unavailable or unsupported
  return <span className={cn(baseClass, "bg-gray-300")} title="Unavailable" />;
}
