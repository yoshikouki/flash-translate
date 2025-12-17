import { SUPPORTED_LANGUAGES } from "@/shared/constants/languages";

interface TargetLanguageSelectorProps {
  targetLanguage: string;
  onChangeTargetLanguage: (code: string) => void;
}

export function TargetLanguageSelector({
  targetLanguage,
  onChangeTargetLanguage,
}: TargetLanguageSelectorProps) {
  return (
    <div className="px-3 py-2 border-b border-gray-200 bg-gray-50">
      <label className="flex items-center gap-2">
        <span className="text-xs text-gray-500 font-medium">翻訳先:</span>
        <select
          value={targetLanguage}
          onChange={(e) => onChangeTargetLanguage(e.target.value)}
          className="flex-1 text-sm bg-white border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          {SUPPORTED_LANGUAGES.map((lang) => (
            <option key={lang.code} value={lang.code}>
              {lang.nativeName}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}
