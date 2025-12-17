import { useState, useEffect, useCallback } from "react";
import {
  getSettings,
  saveSettings,
  subscribeToSettings,
} from "@/shared/storage/settings";
import { SUPPORTED_LANGUAGES } from "@/shared/constants/languages";
import {
  translatorManager,
  checkAllPairsToTarget,
  type LanguagePairStatus,
  type TranslationAvailabilityStatus,
} from "@/shared/utils/translator";

export default function App() {
  const [targetLanguage, setTargetLanguage] = useState("ja");
  const [pairs, setPairs] = useState<LanguagePairStatus[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [downloadingPairs, setDownloadingPairs] = useState<Set<string>>(
    new Set()
  );

  const loadPairStatuses = useCallback(async (target: string) => {
    setIsLoading(true);
    const sourceCodes = SUPPORTED_LANGUAGES.map((l) => l.code);
    const statuses = await checkAllPairsToTarget(target, sourceCodes);
    setPairs(statuses);
    setIsLoading(false);
  }, []);

  // Load settings and pair statuses
  useEffect(() => {
    const init = async () => {
      const settings = await getSettings();
      setTargetLanguage(settings.targetLanguage);
      await loadPairStatuses(settings.targetLanguage);
    };

    init();

    const unsubscribe = subscribeToSettings((settings) => {
      setTargetLanguage(settings.targetLanguage);
    });

    return unsubscribe;
  }, [loadPairStatuses]);

  const handleTargetLanguageChange = async (lang: string) => {
    setTargetLanguage(lang);
    await saveSettings({ targetLanguage: lang });
    await loadPairStatuses(lang);
  };

  const handleDownload = async (sourceLanguage: string) => {
    const pairKey = `${sourceLanguage}-${targetLanguage}`;
    setDownloadingPairs((prev) => new Set(prev).add(pairKey));

    try {
      // Creating a translator triggers the download
      await translatorManager.getTranslator(sourceLanguage, targetLanguage);
      // Refresh the status
      await loadPairStatuses(targetLanguage);
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

  const getLanguageName = (code: string) => {
    return (
      SUPPORTED_LANGUAGES.find((l) => l.code === code)?.nativeName || code
    );
  };

  const getStatusDisplay = (
    status: TranslationAvailabilityStatus,
    sourceLanguage: string
  ) => {
    const pairKey = `${sourceLanguage}-${targetLanguage}`;
    const isDownloading = downloadingPairs.has(pairKey);

    if (isDownloading) {
      return (
        <span className="text-blue-600 text-xs flex items-center gap-1">
          <span className="inline-block w-3 h-3 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
          Downloading
        </span>
      );
    }

    switch (status) {
      case "available":
        return <span className="text-green-600 text-xs">● Ready</span>;
      case "after-download":
        return (
          <button
            onClick={() => handleDownload(sourceLanguage)}
            className="text-blue-600 hover:text-blue-800 text-xs underline cursor-pointer"
            type="button"
          >
            ○ Download
          </button>
        );
      case "unavailable":
        return <span className="text-gray-400 text-xs">— Unavailable</span>;
      case "unsupported":
        return <span className="text-gray-400 text-xs">— Unsupported</span>;
      default:
        return null;
    }
  };

  return (
    <div className="w-72 p-3 bg-white">
      <div className="flex items-center gap-2 mb-3">
        <label className="text-sm text-gray-600 whitespace-nowrap">
          Translate to:
        </label>
        <select
          value={targetLanguage}
          onChange={(e) => handleTargetLanguageChange(e.target.value)}
          className="flex-1 px-2 py-1.5 border border-gray-300 rounded text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-pointer"
        >
          {SUPPORTED_LANGUAGES.map((lang) => (
            <option key={lang.code} value={lang.code}>
              {lang.nativeName}
            </option>
          ))}
        </select>
      </div>

      <div className="border-t border-gray-200 pt-2">
        {isLoading ? (
          <div className="text-center text-gray-400 text-sm py-4">
            Checking models...
          </div>
        ) : (
          <ul className="space-y-1">
            {pairs.map((pair) => (
              <li
                key={pair.sourceLanguage}
                className="flex items-center justify-between py-1 px-1 hover:bg-gray-50 rounded"
              >
                <span className="text-sm text-gray-700">
                  {getLanguageName(pair.sourceLanguage)}
                </span>
                {getStatusDisplay(pair.status, pair.sourceLanguage)}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
