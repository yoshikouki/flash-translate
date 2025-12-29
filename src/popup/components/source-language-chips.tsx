import { SUPPORTED_LANGUAGES } from "@/shared/constants/languages";
import { getMessage } from "@/shared/utils/i18n";
import { createPrefixedLogger } from "@/shared/utils/logger";
import {
  checkAllPairsToTarget,
  type LanguagePairStatus,
  translatorManager,
} from "@/shared/utils/translator";
import { useDownloadState } from "../hooks/use-download-state";
import { LanguageChip } from "./language-chip";
import { LanguageDownloadDropdown } from "./language-download-dropdown";

const log = createPrefixedLogger("SourceLanguageChips");

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
  const { getStatus, startDownload, finishDownload, clearDownloadError } =
    useDownloadState();

  const availablePairs = pairs.filter((p) => p.status === "available");
  const downloadablePairs = pairs.filter((p) => p.status === "after-download");

  const handleDownload = async (sourceLang: string) => {
    startDownload(sourceLang, targetLanguage);

    try {
      await translatorManager.getTranslator(sourceLang, targetLanguage);
      const sourceCodes = SUPPORTED_LANGUAGES.map((l) => l.code);
      const statuses = await checkAllPairsToTarget(targetLanguage, sourceCodes);
      onPairsChange(statuses);
      finishDownload(sourceLang, targetLanguage, false);
    } catch (error) {
      log.error("Download failed:", error);
      finishDownload(sourceLang, targetLanguage, true);
      // Auto-clear error after 5 seconds
      setTimeout(() => {
        clearDownloadError(sourceLang, targetLanguage);
      }, 5000);
    }
  };

  if (isLoading) {
    return (
      <div className="px-3 py-2.5">
        <div className="flex items-center gap-2">
          <span className="text-gray-500 text-xs">
            {getMessage("popup_source_label")}
          </span>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 animate-spin rounded-full border-2 border-gray-200 border-t-blue-500" />
            <span className="text-gray-400 text-xs">
              {getMessage("popup_source_loading")}
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="px-3 py-2.5">
      <div className="flex items-center gap-2">
        <span className="shrink-0 text-gray-500 text-xs">
          {getMessage("popup_source_label")}
        </span>
        <div className="flex flex-1 flex-wrap gap-1.5">
          {availablePairs.map((pair) => (
            <LanguageChip
              isSelected={pair.sourceLanguage === sourceLanguage}
              key={pair.sourceLanguage}
              languageCode={pair.sourceLanguage}
              onClick={() => onSourceLanguageChange(pair.sourceLanguage)}
              status={getStatus(pair.sourceLanguage, targetLanguage, pairs)}
            />
          ))}
          <LanguageDownloadDropdown
            downloadablePairs={downloadablePairs}
            onDownload={handleDownload}
          />
        </div>
      </div>
    </div>
  );
}
