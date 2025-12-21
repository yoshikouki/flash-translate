import { useState, useRef, useEffect } from "react";
import { SUPPORTED_LANGUAGES } from "@/shared/constants/languages";
import {
  translatorManager,
  checkAllPairsToTarget,
  type LanguagePairStatus,
} from "@/shared/utils/translator";
import { StatusIndicator } from "./StatusIndicator";
import { cn } from "@/lib/utils";

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
    return (
      SUPPORTED_LANGUAGES.find((l) => l.code === code)?.nativeName || code
    );
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
          <span className="text-xs text-gray-500">Source</span>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 border-2 border-gray-200 border-t-blue-500 rounded-full animate-spin" />
            <span className="text-xs text-gray-400">Loading languages...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="px-3 py-2.5">
      <div className="flex items-center gap-2">
        <span className="text-xs text-gray-500 shrink-0">Source</span>
        <div className="flex flex-wrap gap-1.5 flex-1">
          {availablePairs.map((pair) => {
            const isSelected = pair.sourceLanguage === sourceLanguage;
            return (
              <button
                key={pair.sourceLanguage}
                type="button"
                onClick={() => onSourceLanguageChange(pair.sourceLanguage)}
                className={cn(
                  "inline-flex items-center gap-1 px-2 py-1 rounded text-xs transition-all duration-150",
                  isSelected
                    ? "bg-blue-500 text-white shadow-sm"
                    : "bg-white border border-gray-200 text-gray-700 hover:bg-gray-50"
                )}
                title={getLanguageName(pair.sourceLanguage)}
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
              ref={buttonRef}
              type="button"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              disabled={downloadablePairs.length === 0}
              className={cn(
                "inline-flex items-center justify-center w-7 h-7 rounded border border-dashed transition-all duration-150",
                downloadablePairs.length > 0
                  ? "border-blue-400 text-blue-500 hover:bg-blue-50"
                  : "border-gray-300 text-gray-400 cursor-not-allowed"
              )}
              title={
                downloadablePairs.length > 0
                  ? `${downloadablePairs.length} language(s) available`
                  : "No languages available"
              }
            >
              +
            </button>

            {isDropdownOpen && downloadablePairs.length > 0 && (
              <>
                <div
                  className="fixed inset-0"
                  onClick={() => setIsDropdownOpen(false)}
                />
                <div
                  ref={dropdownRef}
                  className={cn(
                    "absolute top-full mt-1 z-10 bg-white border border-gray-200 rounded-lg shadow-lg min-w-32 max-h-48 overflow-y-auto",
                    "animate-in fade-in-0 slide-in-from-top-2 duration-150",
                    dropdownPosition === "left" ? "left-0" : "right-0"
                  )}
                >
                  {downloadablePairs.map((pair) => (
                    <button
                      key={pair.sourceLanguage}
                      type="button"
                      onClick={() => handleDownload(pair.sourceLanguage)}
                      className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center justify-between gap-2 transition-colors"
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
