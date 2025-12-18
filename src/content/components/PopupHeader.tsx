import { LanguageSelector } from "./LanguageSelector";
import { CopyButton } from "./CopyButton";
import { ExcludeSiteButton } from "./ExcludeSiteButton";

interface PopupHeaderProps {
  sourceLanguage: string;
  targetLanguage: string;
  onSourceChange: (lang: string) => void;
  onTargetChange: (lang: string) => void;
  onSwap: () => void;
  result: string | null;
  onOpenSettings: () => void;
  onClose: () => void;
}

export function PopupHeader({
  sourceLanguage,
  targetLanguage,
  onSourceChange,
  onTargetChange,
  onSwap,
  result,
  onOpenSettings,
  onClose,
}: PopupHeaderProps) {
  return (
    <div className="relative flex items-center justify-between px-3 py-2 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-100 rounded-t-xl">
      <LanguageSelector
        sourceLanguage={sourceLanguage}
        targetLanguage={targetLanguage}
        onSourceChange={onSourceChange}
        onTargetChange={onTargetChange}
        onSwap={onSwap}
      />
      <div className="flex items-center gap-1">
        <CopyButton text={result} />
        <ExcludeSiteButton onExcluded={onClose} />
        <button
          className="text-gray-400 hover:text-blue-600 text-sm leading-none cursor-pointer bg-transparent border-none transition-colors p-1"
          onClick={onOpenSettings}
          aria-label="Open settings"
          type="button"
        >
          ⚙
        </button>
        <button
          className="text-gray-400 hover:text-gray-600 text-xl leading-none cursor-pointer bg-transparent border-none transition-colors p-1 -mr-1"
          onClick={onClose}
          aria-label="Close"
          type="button"
        >
          ×
        </button>
      </div>
    </div>
  );
}
