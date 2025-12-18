import { SUPPORTED_LANGUAGES } from "@/shared/constants/languages";

interface LanguageSelectorProps {
  sourceLanguage: string;
  targetLanguage: string;
  onSourceChange: (lang: string) => void;
  onTargetChange: (lang: string) => void;
  onSwap: () => void;
}

export function LanguageSelector({
  sourceLanguage,
  targetLanguage,
  onSourceChange,
  onTargetChange,
  onSwap,
}: LanguageSelectorProps) {
  return (
    <div className="flex items-center gap-1">
      <select
        value={sourceLanguage}
        onChange={(e) => onSourceChange(e.target.value)}
        className="text-xs text-blue-700 font-medium bg-transparent border-none cursor-pointer focus:outline-none hover:text-blue-900 pr-1"
      >
        {SUPPORTED_LANGUAGES.map((lang) => (
          <option key={lang.code} value={lang.code}>
            {lang.code.toUpperCase()}
          </option>
        ))}
      </select>
      <button
        onClick={onSwap}
        className="text-blue-400 hover:text-blue-600 text-xs cursor-pointer bg-transparent border-none px-1"
        type="button"
        aria-label="Swap languages"
      >
        ⇄
      </button>
      <select
        value={targetLanguage}
        onChange={(e) => onTargetChange(e.target.value)}
        className="text-xs text-blue-700 font-medium bg-transparent border-none cursor-pointer focus:outline-none hover:text-blue-900 pr-1"
      >
        {SUPPORTED_LANGUAGES.map((lang) => (
          <option key={lang.code} value={lang.code}>
            {lang.code.toUpperCase()}
          </option>
        ))}
      </select>
    </div>
  );
}
