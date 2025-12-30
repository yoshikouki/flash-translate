import { Settings, X } from "lucide-react";
import { getMessage } from "@/shared/utils/i18n";
import { ExcludeSiteButton } from "./exclude-site-button";
import { LanguageSelector } from "./language-selector";

interface TranslationCardHeaderProps {
  sourceLanguage: string;
  targetLanguage: string;
  onSourceChange: (lang: string) => void;
  onTargetChange: (lang: string) => void;
  onSwap: () => void;
  onOpenSettings: () => void;
  onClose: () => void;
  onExcludeSite: () => void;
}

export function TranslationCardHeader({
  sourceLanguage,
  targetLanguage,
  onSourceChange,
  onTargetChange,
  onSwap,
  onOpenSettings,
  onClose,
  onExcludeSite,
}: TranslationCardHeaderProps) {
  return (
    <div
      className="relative flex items-stretch justify-between rounded-t-xl border-b border-none px-3 py-1"
      style={{ minHeight: "48px" }}
    >
      <LanguageSelector
        onSourceChange={onSourceChange}
        onSwap={onSwap}
        onTargetChange={onTargetChange}
        sourceLanguage={sourceLanguage}
        targetLanguage={targetLanguage}
      />
      <div className="flex items-stretch gap-1">
        <ExcludeSiteButton onExcluded={onExcludeSite} />
        <button
          aria-label={getMessage("content_openSettings")}
          className="flex cursor-pointer items-center rounded border-none bg-transparent p-1 text-gray-400 transition-colors hover:bg-blue-50 hover:text-blue-600"
          onClick={onOpenSettings}
          type="button"
        >
          <Settings size={14} />
        </button>
        <button
          aria-label={getMessage("content_close")}
          className="-mr-1 flex cursor-pointer items-center rounded border-none bg-transparent p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
          onClick={onClose}
          type="button"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
}
