import { Settings, X } from "lucide-react";
import { LanguageSelector } from "./LanguageSelector";
import { ExcludeSiteButton } from "./ExcludeSiteButton";

interface CardHeaderProps {
  sourceLanguage: string;
  targetLanguage: string;
  onSourceChange: (lang: string) => void;
  onTargetChange: (lang: string) => void;
  onSwap: () => void;
  onOpenSettings: () => void;
  onClose: () => void;
  onExcludeSite: () => void;
}

export function CardHeader({
  sourceLanguage,
  targetLanguage,
  onSourceChange,
  onTargetChange,
  onSwap,
  onOpenSettings,
  onClose,
  onExcludeSite,
}: CardHeaderProps) {
  return (
    <div className="relative flex items-stretch justify-between px-3 py-1 border-b border-none rounded-t-xl" style={{ minHeight: '48px' }}>
      <LanguageSelector
        sourceLanguage={sourceLanguage}
        targetLanguage={targetLanguage}
        onSourceChange={onSourceChange}
        onTargetChange={onTargetChange}
        onSwap={onSwap}
      />
      <div className="flex items-stretch gap-1">
        <ExcludeSiteButton onExcluded={onExcludeSite} />
        <button
          className="flex items-center text-gray-400 hover:text-blue-600 hover:bg-blue-50 cursor-pointer bg-transparent border-none transition-colors p-1 rounded"
          onClick={onOpenSettings}
          aria-label="Open settings"
          type="button"
        >
          <Settings size={14} />
        </button>
        <button
          className="flex items-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 cursor-pointer bg-transparent border-none transition-colors p-1 -mr-1 rounded"
          onClick={onClose}
          aria-label="Close"
          type="button"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
}
