import { SUPPORTED_LANGUAGES } from "@/shared/constants/languages";
import type { TranslationAvailabilityStatus } from "@/shared/utils/translator";
import { StatusIndicator } from "./StatusIndicator";

interface TargetLanguageSelectorProps {
  targetLanguage: string;
  downloadStatus?: TranslationAvailabilityStatus;
  onChangeTargetLanguage: (code: string) => void;
}

export function TargetLanguageSelector({
  targetLanguage,
  downloadStatus,
  onChangeTargetLanguage,
}: TargetLanguageSelectorProps) {
  return (
    <div className="px-3 py-2.5 border-b border-gray-200 bg-gray-50">
      <div className="flex items-center gap-2">
        <span className="text-xs text-gray-500 shrink-0">翻訳先</span>
        <select
          value={targetLanguage}
          onChange={(e) => onChangeTargetLanguage(e.target.value)}
          className="flex-1 text-sm bg-white border border-gray-300 rounded px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          {SUPPORTED_LANGUAGES.map((lang) => (
            <option key={lang.code} value={lang.code}>
              {lang.nativeName}
            </option>
          ))}
        </select>
        {downloadStatus && (
          <StatusIndicator status={downloadStatus} size="md" />
        )}
      </div>
    </div>
  );
}
