import { useState, useEffect, useRef } from "react";
import {
  getSettings,
  saveSettings,
} from "@/shared/storage/settings";
import { SUPPORTED_LANGUAGES } from "@/shared/constants/languages";
import {
  translatorManager,
  checkAllPairsToTarget,
  type LanguagePairStatus,
  type TranslationAvailabilityStatus,
} from "@/shared/utils/translator";

export default function App() {
  const [openTarget, setOpenTarget] = useState<string | null>(null);
  const [pairs, setPairs] = useState<LanguagePairStatus[]>([]);
  const [isLoadingPairs, setIsLoadingPairs] = useState(false);
  const [downloadingPairs, setDownloadingPairs] = useState<Set<string>>(
    new Set()
  );
  const detailsRefs = useRef<Map<string, HTMLDetailsElement>>(new Map());

  // Load initial target language from settings
  useEffect(() => {
    const init = async () => {
      const settings = await getSettings();
      setOpenTarget(settings.targetLanguage);
    };
    init();
  }, []);

  // Load pairs when open target changes
  useEffect(() => {
    if (!openTarget) {
      setPairs([]);
      return;
    }

    const loadPairs = async () => {
      setIsLoadingPairs(true);
      const sourceCodes = SUPPORTED_LANGUAGES.map((l) => l.code);
      const statuses = await checkAllPairsToTarget(openTarget, sourceCodes);
      setPairs(statuses);
      setIsLoadingPairs(false);
    };
    loadPairs();
  }, [openTarget]);

  const handleToggle = async (targetCode: string, isOpen: boolean) => {
    if (isOpen) {
      // Close other details
      detailsRefs.current.forEach((el, code) => {
        if (code !== targetCode && el.open) {
          el.open = false;
        }
      });
      setOpenTarget(targetCode);
      await saveSettings({ targetLanguage: targetCode });
    } else {
      setOpenTarget(null);
    }
  };

  const handleDownload = async (sourceLanguage: string) => {
    if (!openTarget) return;

    const pairKey = `${sourceLanguage}-${openTarget}`;
    setDownloadingPairs((prev) => new Set(prev).add(pairKey));

    try {
      await translatorManager.getTranslator(sourceLanguage, openTarget);
      const sourceCodes = SUPPORTED_LANGUAGES.map((l) => l.code);
      const statuses = await checkAllPairsToTarget(openTarget, sourceCodes);
      setPairs(statuses);
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
    return SUPPORTED_LANGUAGES.find((l) => l.code === code)?.nativeName || code;
  };

  const getStatusDisplay = (
    status: TranslationAvailabilityStatus,
    sourceLanguage: string
  ) => {
    if (!openTarget) return null;

    const pairKey = `${sourceLanguage}-${openTarget}`;
    const isDownloading = downloadingPairs.has(pairKey);

    if (isDownloading) {
      return (
        <span className="text-blue-600 text-xs">
          <span className="inline-block w-3 h-3 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </span>
      );
    }

    switch (status) {
      case "available":
        return <span className="text-green-600 text-xs">●</span>;
      case "after-download":
        return (
          <button
            onClick={() => handleDownload(sourceLanguage)}
            className="text-gray-400 hover:text-blue-600 text-xs cursor-pointer"
            type="button"
            title="Download model"
          >
            ○
          </button>
        );
      case "unavailable":
      case "unsupported":
        return <span className="text-gray-300 text-xs">—</span>;
      default:
        return null;
    }
  };

  return (
    <div className="w-64 bg-white max-h-96 overflow-y-auto">
      {SUPPORTED_LANGUAGES.map((lang) => (
        <details
          key={lang.code}
          ref={(el) => {
            if (el) detailsRefs.current.set(lang.code, el);
          }}
          open={openTarget === lang.code}
          onToggle={(e) =>
            handleToggle(lang.code, (e.target as HTMLDetailsElement).open)
          }
          className="border-b border-gray-100 last:border-b-0"
        >
          <summary className="px-3 py-2 text-sm text-gray-700 cursor-pointer hover:bg-gray-50 list-none flex items-center gap-2">
            <span className="text-gray-400 text-xs">
              {openTarget === lang.code ? "▼" : "▶"}
            </span>
            {lang.nativeName}
          </summary>

          <div className="bg-gray-50">
            {isLoadingPairs ? (
              <div className="px-3 py-2 text-xs text-gray-400 text-center">
                Loading...
              </div>
            ) : (
              <ul>
                {pairs.map((pair) => (
                  <li
                    key={pair.sourceLanguage}
                    className="flex items-center justify-between px-3 py-1.5 pl-9 hover:bg-gray-100"
                  >
                    <span className="text-xs text-gray-600">
                      {getLanguageName(pair.sourceLanguage)}
                    </span>
                    {getStatusDisplay(pair.status, pair.sourceLanguage)}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </details>
      ))}
    </div>
  );
}
