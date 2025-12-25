import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { SUPPORTED_LANGUAGES } from "@/shared/constants/languages";
import {
  type TranslationAvailabilityStatus,
  translatorManager,
} from "@/shared/utils/translator";
import { StatusIndicator } from "./StatusIndicator";

interface TargetLanguageStatus {
  code: string;
  status: TranslationAvailabilityStatus;
}

interface TargetLanguageChipsProps {
  targetLanguage: string;
  onChangeTargetLanguage: (code: string) => void;
}

export function TargetLanguageChips({
  targetLanguage,
  onChangeTargetLanguage,
}: TargetLanguageChipsProps) {
  const [statuses, setStatuses] = useState<TargetLanguageStatus[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Check availability for all target languages
  useEffect(() => {
    const checkAllTargets = async () => {
      setIsLoading(true);
      const results = await Promise.all(
        SUPPORTED_LANGUAGES.map(async (lang) => {
          // Check if English → target is available (as a representative pair)
          const sourceToCheck = lang.code === "en" ? "ja" : "en";
          const status = await translatorManager.checkAvailability(
            sourceToCheck,
            lang.code
          );
          return { code: lang.code, status };
        })
      );
      setStatuses(results);
      setIsLoading(false);
    };
    checkAllTargets();
  }, []);

  const getLanguageCode = (code: string) => {
    return code.toUpperCase();
  };

  const getLanguageName = (code: string) => {
    return SUPPORTED_LANGUAGES.find((l) => l.code === code)?.nativeName || code;
  };

  const getStatus = (code: string): TranslationAvailabilityStatus => {
    return statuses.find((s) => s.code === code)?.status || "unavailable";
  };

  if (isLoading) {
    return (
      <div className="px-3 py-2.5">
        <div className="flex items-center gap-2">
          <span className="text-gray-500 text-xs">Target</span>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 animate-spin rounded-full border-2 border-gray-200 border-t-blue-500" />
            <span className="text-gray-400 text-xs">Loading languages...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="px-3 py-2.5">
      <div className="flex items-start gap-2">
        <span className="shrink-0 pt-1.5 text-gray-500 text-xs">Target</span>
        <div className="flex flex-1 flex-wrap gap-1.5">
          {SUPPORTED_LANGUAGES.map((lang) => {
            const isSelected = lang.code === targetLanguage;
            const status = getStatus(lang.code);

            return (
              <button
                className={cn(
                  "inline-flex items-center gap-1 rounded px-2 py-1 text-xs transition-all duration-150",
                  isSelected
                    ? "bg-blue-500 text-white shadow-sm"
                    : "border border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
                )}
                key={lang.code}
                onClick={() => onChangeTargetLanguage(lang.code)}
                title={getLanguageName(lang.code)}
                type="button"
              >
                <span>{getLanguageCode(lang.code)}</span>
                <StatusIndicator size="sm" status={status} />
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
