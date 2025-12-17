import { useState, useRef } from "react";
import { SUPPORTED_LANGUAGES } from "@/shared/constants/languages";
import {
  translatorManager,
  checkAllPairsToTarget,
  type LanguagePairStatus,
  type TranslationAvailabilityStatus,
} from "@/shared/utils/translator";

interface SourceLanguageListProps {
  targetLanguage: string;
  pairs: LanguagePairStatus[];
  isLoadingPairs: boolean;
  onPairsChange: (pairs: LanguagePairStatus[]) => void;
}

export function SourceLanguageList({
  targetLanguage,
  pairs,
  isLoadingPairs,
  onPairsChange,
}: SourceLanguageListProps) {
  const [downloadingPairs, setDownloadingPairs] = useState<Set<string>>(
    new Set()
  );
  const [isAddingLanguage, setIsAddingLanguage] = useState(false);
  const selectRef = useRef<HTMLSelectElement>(null);

  const availablePairs = pairs.filter((p) => p.status === "available");
  const downloadablePairs = pairs.filter((p) => p.status === "after-download");

  const getLanguageName = (code: string) => {
    return (
      SUPPORTED_LANGUAGES.find((l) => l.code === code)?.nativeName || code
    );
  };

  const handleDownload = async (sourceLanguage: string) => {
    const pairKey = `${sourceLanguage}-${targetLanguage}`;
    setDownloadingPairs((prev) => new Set(prev).add(pairKey));

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

  const handleAddLanguage = async () => {
    const sourceLanguage = selectRef.current?.value;
    if (!sourceLanguage) return;

    setIsAddingLanguage(false);
    await handleDownload(sourceLanguage);
  };

  const getStatusIcon = (
    status: TranslationAvailabilityStatus,
    sourceLanguage: string
  ) => {
    const pairKey = `${sourceLanguage}-${targetLanguage}`;
    const isDownloading = downloadingPairs.has(pairKey);

    if (isDownloading) {
      return (
        <span className="text-blue-600 text-xs">
          <span className="inline-block w-3 h-3 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </span>
      );
    }

    if (status === "available") {
      return <span className="text-green-600 text-xs">●</span>;
    }

    return null;
  };

  if (isLoadingPairs) {
    return (
      <div className="px-3 py-4 text-xs text-gray-400 text-center">
        Loading...
      </div>
    );
  }

  return (
    <div className="bg-white">
      <div className="px-3 py-2 border-b border-gray-100">
        <span className="text-xs text-gray-500 font-medium">翻訳元言語:</span>
      </div>

      {availablePairs.length === 0 ? (
        <div className="px-3 py-3 text-xs text-gray-400 text-center">
          ダウンロード済みの言語がありません
        </div>
      ) : (
        <ul>
          {availablePairs.map((pair) => (
            <li
              key={pair.sourceLanguage}
              className="flex items-center justify-between px-3 py-2 hover:bg-gray-50 border-b border-gray-50 last:border-b-0"
            >
              <span className="text-sm text-gray-700">
                {getLanguageName(pair.sourceLanguage)}
              </span>
              {getStatusIcon(pair.status, pair.sourceLanguage)}
            </li>
          ))}
        </ul>
      )}

      {/* Add source language section */}
      <div className="border-t border-gray-200 bg-gray-50">
        {isAddingLanguage ? (
          <div className="px-3 py-2 flex items-center gap-2">
            <select
              ref={selectRef}
              className="flex-1 text-sm bg-white border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
              defaultValue=""
            >
              <option value="" disabled>
                言語を選択...
              </option>
              {downloadablePairs.map((pair) => (
                <option key={pair.sourceLanguage} value={pair.sourceLanguage}>
                  {getLanguageName(pair.sourceLanguage)}
                </option>
              ))}
            </select>
            <button
              onClick={handleAddLanguage}
              className="px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
              type="button"
            >
              追加
            </button>
            <button
              onClick={() => setIsAddingLanguage(false)}
              className="px-2 py-1 text-xs text-gray-500 hover:text-gray-700"
              type="button"
            >
              キャンセル
            </button>
          </div>
        ) : (
          <button
            onClick={() => setIsAddingLanguage(true)}
            className="w-full px-3 py-2 text-sm text-blue-600 hover:bg-gray-100 text-left flex items-center gap-1"
            type="button"
            disabled={downloadablePairs.length === 0}
          >
            <span className="text-lg leading-none">+</span>
            <span>翻訳元を追加</span>
            {downloadablePairs.length > 0 && (
              <span className="text-xs text-gray-400 ml-auto">
                ({downloadablePairs.length}言語)
              </span>
            )}
          </button>
        )}
      </div>
    </div>
  );
}
