import { useState } from "react";
import { SUPPORTED_LANGUAGES } from "@/shared/constants/languages";
import {
  translatorManager,
  checkAllPairsToTarget,
  type LanguagePairStatus,
} from "@/shared/utils/translator";
import { StatusIndicator } from "./StatusIndicator";

interface SourceLanguageChipsProps {
  targetLanguage: string;
  pairs: LanguagePairStatus[];
  isLoading: boolean;
  onPairsChange: (pairs: LanguagePairStatus[]) => void;
}

export function SourceLanguageChips({
  targetLanguage,
  pairs,
  isLoading,
  onPairsChange,
}: SourceLanguageChipsProps) {
  const [downloadingPairs, setDownloadingPairs] = useState<Set<string>>(
    new Set()
  );
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const availablePairs = pairs.filter((p) => p.status === "available");
  const downloadablePairs = pairs.filter((p) => p.status === "after-download");

  const getLanguageCode = (code: string) => {
    return code.toUpperCase();
  };

  const getLanguageName = (code: string) => {
    return SUPPORTED_LANGUAGES.find((l) => l.code === code)?.nativeName || code;
  };

  const handleDownload = async (sourceLanguage: string) => {
    const pairKey = `${sourceLanguage}-${targetLanguage}`;
    setDownloadingPairs((prev) => new Set(prev).add(pairKey));
    setIsDropdownOpen(false);

    try {
      await translatorManager.getTranslator(sourceLanguage, targetLanguage);
      const sourceCodes = SUPPORTED_LANGUAGES.map((l) => l.code);
      const statuses = await checkAllPairsToTarget(targetLanguage, sourceCodes);
      onPairsChange(statuses);
    } catch (error) {
      console.error("Download failed:", error);
    } finally {
      setDownloadingPairs((prev) => {
        const next = new Set(prev);
        next.delete(pairKey);
        return next;
      });
    }
  };

  const getStatus = (sourceLanguage: string) => {
    const pairKey = `${sourceLanguage}-${targetLanguage}`;
    if (downloadingPairs.has(pairKey)) {
      return "downloading" as const;
    }
    return pairs.find((p) => p.sourceLanguage === sourceLanguage)?.status;
  };

  if (isLoading) {
    return (
      <div className="px-3 py-3 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500">翻訳元</span>
          <span className="text-xs text-gray-400">読み込み中...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="px-3 py-2.5 border-b border-gray-200">
      <div className="flex items-center gap-2">
        <span className="text-xs text-gray-500 shrink-0">翻訳元</span>
        <div className="flex flex-wrap gap-1.5 flex-1">
          {availablePairs.map((pair) => (
            <div
              key={pair.sourceLanguage}
              className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 rounded text-xs text-gray-700"
              title={getLanguageName(pair.sourceLanguage)}
            >
              <span>{getLanguageCode(pair.sourceLanguage)}</span>
              <StatusIndicator
                status={getStatus(pair.sourceLanguage) || "available"}
              />
            </div>
          ))}

          {/* Add button with dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              disabled={downloadablePairs.length === 0}
              className={`inline-flex items-center justify-center w-7 h-7 rounded border border-dashed ${
                downloadablePairs.length > 0
                  ? "border-blue-400 text-blue-500 hover:bg-blue-50"
                  : "border-gray-300 text-gray-400 cursor-not-allowed"
              }`}
              title={
                downloadablePairs.length > 0
                  ? `${downloadablePairs.length}言語追加可能`
                  : "追加可能な言語なし"
              }
            >
              +
            </button>

            {isDropdownOpen && downloadablePairs.length > 0 && (
              <>
                <div
                  className="fixed inset-0"
                  onClick={() => setIsDropdownOpen(false)}
                />
                <div className="absolute left-0 top-full mt-1 z-10 bg-white border border-gray-200 rounded shadow-lg min-w-32 max-h-48 overflow-y-auto">
                  {downloadablePairs.map((pair) => (
                    <button
                      key={pair.sourceLanguage}
                      type="button"
                      onClick={() => handleDownload(pair.sourceLanguage)}
                      className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center justify-between gap-2"
                    >
                      <span>{getLanguageName(pair.sourceLanguage)}</span>
                      <StatusIndicator status="after-download" />
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
