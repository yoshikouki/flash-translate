import { LanguageSelector } from "./LanguageSelector";
import { ExcludeConfirmation } from "./ExcludeConfirmation";

interface PopupHeaderProps {
  sourceLanguage: string;
  targetLanguage: string;
  onSourceChange: (lang: string) => void;
  onTargetChange: (lang: string) => void;
  onSwap: () => void;
  copied: boolean;
  hasResult: boolean;
  onCopy: () => void;
  excludeConfirm: boolean;
  onExcludeSite: () => void;
  onCancelExclude: () => void;
  onOpenSettings: () => void;
  onClose: () => void;
}

export function PopupHeader({
  sourceLanguage,
  targetLanguage,
  onSourceChange,
  onTargetChange,
  onSwap,
  copied,
  hasResult,
  onCopy,
  excludeConfirm,
  onExcludeSite,
  onCancelExclude,
  onOpenSettings,
  onClose,
}: PopupHeaderProps) {
  return (
    <div className="flex items-center justify-between px-3 py-2 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-100">
      {excludeConfirm ? (
        <ExcludeConfirmation
          onConfirm={onExcludeSite}
          onCancel={onCancelExclude}
        />
      ) : (
        <>
          <LanguageSelector
            sourceLanguage={sourceLanguage}
            targetLanguage={targetLanguage}
            onSourceChange={onSourceChange}
            onTargetChange={onTargetChange}
            onSwap={onSwap}
          />
          <div className="flex items-center gap-1">
            <button
              className="text-gray-400 hover:text-blue-600 text-sm leading-none cursor-pointer bg-transparent border-none transition-colors p-1 disabled:opacity-30 disabled:cursor-not-allowed"
              onClick={onCopy}
              disabled={!hasResult}
              aria-label="Copy translation"
              type="button"
            >
              {copied ? "✓" : "⧉"}
            </button>
            <button
              className="text-sm leading-none cursor-pointer border-none transition-colors p-1 bg-transparent text-gray-400 hover:text-red-500"
              onClick={onExcludeSite}
              aria-label="Exclude this site"
              title="このサイトを除外"
              type="button"
            >
              ⊘
            </button>
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
        </>
      )}
    </div>
  );
}
