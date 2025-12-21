import { useState, useEffect } from "react";
import { SUPPORTED_LANGUAGES } from "@/shared/constants/languages";
import {
  translatorManager,
  type TranslationAvailabilityStatus,
} from "@/shared/utils/translator";
import { StatusIndicator } from "./StatusIndicator";
import { cn } from "@/lib/utils";

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
      <div className="px-3 py-2.5 bg-gray-50">
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500">Target</span>
          <span className="text-xs text-gray-400">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="px-3 py-2.5 bg-gray-50">
      <div className="flex items-start gap-2">
        <span className="text-xs text-gray-500 shrink-0 pt-1.5">Target</span>
        <div className="flex flex-wrap gap-1.5 flex-1">
          {SUPPORTED_LANGUAGES.map((lang) => {
            const isSelected = lang.code === targetLanguage;
            const status = getStatus(lang.code);

            return (
              <button
                key={lang.code}
                type="button"
                onClick={() => onChangeTargetLanguage(lang.code)}
                className={cn(
                  "inline-flex items-center gap-1 px-2 py-1 rounded text-xs transition-colors",
                  isSelected
                    ? "bg-blue-500 text-white"
                    : "bg-white border border-gray-200 text-gray-700 hover:bg-gray-100"
                )}
                title={getLanguageName(lang.code)}
              >
                <span>{getLanguageCode(lang.code)}</span>
                <StatusIndicator
                  status={status}
                  size="sm"
                />
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
