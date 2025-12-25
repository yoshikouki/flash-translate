import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { SUPPORTED_LANGUAGES } from "@/shared/constants/languages";
import { getMessage } from "@/shared/utils/i18n";
import {
  checkAllPairsToTarget,
  type LanguagePairStatus,
  translatorManager,
} from "@/shared/utils/translator";
import { StatusIndicator } from "./status-indicator";

interface SourceLanguageChipsProps {
  targetLanguage: string;
  sourceLanguage: string;
  pairs: LanguagePairStatus[];
  isLoading: boolean;
  onPairsChange: (pairs: LanguagePairStatus[]) => void;
  onSourceLanguageChange: (lang: string) => void;
}

export function SourceLanguageChips({
  targetLanguage,
  sourceLanguage,
  pairs,
  isLoading,
  onPairsChange,
  onSourceLanguageChange,
}: SourceLanguageChipsProps) {
  const [downloadingPairs, setDownloadingPairs] = useState<Set<string>>(
    new Set()
  );
  const [downloadErrors, setDownloadErrors] = useState<Set<string>>(new Set());
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState<"left" | "right">(
    "left"
  );
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const availablePairs = pairs.filter((p) => p.status === "available");
  const downloadablePairs = pairs.filter((p) => p.status === "after-download");

  // Calculate dropdown position to avoid overflow
  useEffect(() => {
    if (isDropdownOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      // If right edge would overflow, align to right
      if (rect.left + 128 > viewportWidth - 16) {
        setDropdownPosition("right");
      } else {
        setDropdownPosition("left");
      }
    }
  }, [isDropdownOpen]);

  const getLanguageCode = (code: string) => {
    return code.toUpperCase();
  };

  const getLanguageName = (code: string) => {
    return SUPPORTED_LANGUAGES.find((l) => l.code === code)?.nativeName || code;
  };

  const handleDownload = async (sourceLang: string) => {
    const pairKey = `${sourceLang}-${targetLanguage}`;
    // Clear any previous error for this pair
    setDownloadErrors((prev) => {
      const next = new Set(prev);
      next.delete(pairKey);
      return next;
    });
    setDownloadingPairs((prev) => new Set(prev).add(pairKey));
    setIsDropdownOpen(false);

    try {
      await translatorManager.getTranslator(sourceLang, targetLanguage);
      const sourceCodes = SUPPORTED_LANGUAGES.map((l) => l.code);
      const statuses = await checkAllPairsToTarget(targetLanguage, sourceCodes);
      onPairsChange(statuses);
    } catch (error) {
      console.error("Download failed:", error);
      setDownloadErrors((prev) => new Set(prev).add(pairKey));
      // Auto-clear error after 5 seconds
      setTimeout(() => {
        setDownloadErrors((prev) => {
          const next = new Set(prev);
          next.delete(pairKey);
          return next;
        });
      }, 5000);
    } finally {
      setDownloadingPairs((prev) => {
        const next = new Set(prev);
        next.delete(pairKey);
        return next;
      });
    }
  };

  const getStatus = (sourceLang: string) => {
    const pairKey = `${sourceLang}-${targetLanguage}`;
    if (downloadErrors.has(pairKey)) {
      return "error" as const;
    }
    if (downloadingPairs.has(pairKey)) {
      return "downloading" as const;
    }
    return pairs.find((p) => p.sourceLanguage === sourceLang)?.status;
  };

  if (isLoading) {
    return (
      <div className="px-3 py-2.5">
        <div className="flex items-center gap-2">
          <span className="text-gray-500 text-xs">
            {getMessage("popup_source_label")}
          </span>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 animate-spin rounded-full border-2 border-gray-200 border-t-blue-500" />
            <span className="text-gray-400 text-xs">
              {getMessage("popup_source_loading")}
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="px-3 py-2.5">
      <div className="flex items-center gap-2">
        <span className="shrink-0 text-gray-500 text-xs">
          {getMessage("popup_source_label")}
        </span>
        <div className="flex flex-1 flex-wrap gap-1.5">
          {availablePairs.map((pair) => {
            const isSelected = pair.sourceLanguage === sourceLanguage;
            return (
              <button
                className={cn(
                  "inline-flex items-center gap-1 rounded px-2 py-1 text-xs transition-all duration-150",
                  isSelected
                    ? "bg-blue-500 text-white shadow-sm"
                    : "border border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
                )}
                key={pair.sourceLanguage}
                onClick={() => onSourceLanguageChange(pair.sourceLanguage)}
                title={getLanguageName(pair.sourceLanguage)}
                type="button"
              >
                <span>{getLanguageCode(pair.sourceLanguage)}</span>
                <StatusIndicator
                  status={getStatus(pair.sourceLanguage) || "available"}
                />
              </button>
            );
          })}

          {/* Add button with dropdown */}
          <div className="relative">
            <button
              className={cn(
                "inline-flex h-7 w-7 items-center justify-center rounded border border-dashed transition-all duration-150",
                downloadablePairs.length > 0
                  ? "border-blue-400 text-blue-500 hover:bg-blue-50"
                  : "cursor-not-allowed border-gray-300 text-gray-400"
              )}
              disabled={downloadablePairs.length === 0}
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              ref={buttonRef}
              title={
                downloadablePairs.length > 0
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

            {isDropdownOpen && downloadablePairs.length > 0 && (
              <>
                {/* biome-ignore lint/a11y/noNoninteractiveElementInteractions: Backdrop click to close */}
                {/* biome-ignore lint/a11y/noStaticElementInteractions: Backdrop overlay */}
                {/* biome-ignore lint/a11y/useKeyWithClickEvents: Keyboard handled by Escape key */}
                <div
                  className="fixed inset-0"
                  onClick={() => setIsDropdownOpen(false)}
                />
                <div
                  className={cn(
                    "absolute top-full z-10 mt-1 max-h-48 min-w-32 overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-lg",
                    "fade-in-0 slide-in-from-top-2 animate-in duration-150",
                    dropdownPosition === "left" ? "left-0" : "right-0"
                  )}
                  ref={dropdownRef}
                >
                  {downloadablePairs.map((pair) => (
                    <button
                      className="flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-sm transition-colors hover:bg-gray-50"
                      key={pair.sourceLanguage}
                      onClick={() => handleDownload(pair.sourceLanguage)}
                      type="button"
                    >
                      <span>{getLanguageName(pair.sourceLanguage)}</span>
                      <StatusIndicator status="after-download" />
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
