import type { TranslationAvailabilityStatus } from "@/shared/utils/translator";
import { cn } from "@/lib/utils";

// Extend status type to include downloading state (UI-only state)
type StatusIndicatorStatus = TranslationAvailabilityStatus | "downloading";

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
      <span
        className={cn(baseClass, "bg-green-500")}
        title="Downloaded"
      />
    );
  }

  if (status === "after-download") {
    return (
      <button
        type="button"
        onClick={onClick}
        disabled={!isClickable}
        className={cn(
          baseClass,
          "border-2 border-blue-500 bg-transparent",
          isClickable && "cursor-pointer hover:bg-blue-100"
        )}
        title={showDownloadHint ? "Click to download" : "Available for download"}
      />
    );
  }

  if (status === "downloading") {
    return (
      <span
        className={cn(baseClass, "border-2 border-blue-500 border-t-transparent animate-spin")}
        title="Downloading..."
      />
    );
  }

  // unavailable or unsupported
  return (
    <span
      className={cn(baseClass, "bg-gray-300")}
      title="Unavailable"
    />
  );
}
