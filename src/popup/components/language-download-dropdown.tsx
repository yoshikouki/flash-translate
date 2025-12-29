import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { getLanguageNativeName } from "@/shared/constants/languages";
import { getMessage } from "@/shared/utils/i18n";
import type { LanguagePairStatus } from "@/shared/utils/translator";
import {
  calculateDropdownPosition,
  type DropdownPosition,
} from "../hooks/dropdown-position";
import { StatusIndicator } from "./status-indicator";

export interface LanguageDownloadDropdownProps {
  downloadablePairs: LanguagePairStatus[];
  onDownload: (sourceLanguage: string) => void;
}

export function LanguageDownloadDropdown({
  downloadablePairs,
  onDownload,
}: LanguageDownloadDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState<DropdownPosition>("left");
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Calculate dropdown position to avoid overflow
  useEffect(() => {
    if (isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setPosition(calculateDropdownPosition(rect, window.innerWidth));
    }
  }, [isOpen]);

  const handleDownloadClick = (sourceLanguage: string) => {
    onDownload(sourceLanguage);
    setIsOpen(false);
  };

  const hasDownloadableLanguages = downloadablePairs.length > 0;

  return (
    <div className="relative">
      <button
        className={cn(
          "inline-flex h-7 w-7 items-center justify-center rounded border border-dashed transition-all duration-150",
          hasDownloadableLanguages
            ? "border-blue-400 text-blue-500 hover:bg-blue-50"
            : "cursor-not-allowed border-gray-300 text-gray-400"
        )}
        disabled={!hasDownloadableLanguages}
        onClick={() => setIsOpen(!isOpen)}
        ref={buttonRef}
        title={
          hasDownloadableLanguages
            ? getMessage(
                "popup_source_languagesAvailable",
                String(downloadablePairs.length)
              )
            : getMessage("popup_source_noLanguages")
        }
        type="button"
      >
        +
      </button>

      {isOpen && hasDownloadableLanguages && (
        <>
          {/* biome-ignore lint/a11y/noNoninteractiveElementInteractions: Backdrop click to close */}
          {/* biome-ignore lint/a11y/noStaticElementInteractions: Backdrop overlay */}
          {/* biome-ignore lint/a11y/useKeyWithClickEvents: Keyboard handled by Escape key */}
          <div className="fixed inset-0" onClick={() => setIsOpen(false)} />
          <div
            className={cn(
              "absolute top-full z-10 mt-1 max-h-48 min-w-32 overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-lg",
              "fade-in-0 slide-in-from-top-2 animate-in duration-150",
              position === "left" ? "left-0" : "right-0"
            )}
          >
            {downloadablePairs.map((pair) => (
              <button
                className="flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-sm transition-colors hover:bg-gray-50"
                key={pair.sourceLanguage}
                onClick={() => handleDownloadClick(pair.sourceLanguage)}
                type="button"
              >
                <span>{getLanguageNativeName(pair.sourceLanguage)}</span>
                <StatusIndicator status="after-download" />
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
