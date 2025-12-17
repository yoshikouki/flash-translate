import { useState, useEffect } from "react";
import {
  getSettings,
  saveSettings,
  type ExclusionPattern,
} from "@/shared/storage/settings";
import { SUPPORTED_LANGUAGES } from "@/shared/constants/languages";
import {
  checkAllPairsToTarget,
  type LanguagePairStatus,
} from "@/shared/utils/translator";
import { TargetLanguageSelector } from "./components/TargetLanguageSelector";
import { SourceLanguageList } from "./components/SourceLanguageList";
import { ExclusionSettings } from "./components/ExclusionSettings";

type TabType = "languages" | "exclusions";

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>("languages");
  const [targetLanguage, setTargetLanguage] = useState<string>("ja");
  const [pairs, setPairs] = useState<LanguagePairStatus[]>([]);
  const [isLoadingPairs, setIsLoadingPairs] = useState(false);
  const [exclusionPatterns, setExclusionPatterns] = useState<
    ExclusionPattern[]
  >([]);

  // Load initial settings
  useEffect(() => {
    const init = async () => {
      const settings = await getSettings();
      setTargetLanguage(settings.targetLanguage);
      setExclusionPatterns(settings.exclusionPatterns || []);
    };
    init();
  }, []);

  // Load pairs when target language changes
  useEffect(() => {
    const loadPairs = async () => {
      setIsLoadingPairs(true);
      const sourceCodes = SUPPORTED_LANGUAGES.map((l) => l.code);
      const statuses = await checkAllPairsToTarget(targetLanguage, sourceCodes);
      setPairs(statuses);
      setIsLoadingPairs(false);
    };
    loadPairs();
  }, [targetLanguage]);

  const handleTargetLanguageChange = async (code: string) => {
    setTargetLanguage(code);
    await saveSettings({ targetLanguage: code });
  };

  const handleExclusionPatternsChange = async (
    patterns: ExclusionPattern[]
  ) => {
    setExclusionPatterns(patterns);
    await saveSettings({ exclusionPatterns: patterns });
  };

  return (
    <div className="w-72 bg-white max-h-[400px] overflow-y-auto">
      {/* Target language selector */}
      <TargetLanguageSelector
        targetLanguage={targetLanguage}
        onChangeTargetLanguage={handleTargetLanguageChange}
      />

      {/* Tab navigation */}
      <div className="flex border-b border-gray-200">
        <button
          onClick={() => setActiveTab("languages")}
          className={`flex-1 px-3 py-2 text-xs font-medium ${
            activeTab === "languages"
              ? "text-blue-600 border-b-2 border-blue-600"
              : "text-gray-500 hover:text-gray-700"
          }`}
          type="button"
        >
          翻訳元言語
        </button>
        <button
          onClick={() => setActiveTab("exclusions")}
          className={`flex-1 px-3 py-2 text-xs font-medium ${
            activeTab === "exclusions"
              ? "text-blue-600 border-b-2 border-blue-600"
              : "text-gray-500 hover:text-gray-700"
          }`}
          type="button"
        >
          除外設定
        </button>
      </div>

      {/* Tab content */}
      {activeTab === "languages" ? (
        <SourceLanguageList
          targetLanguage={targetLanguage}
          pairs={pairs}
          isLoadingPairs={isLoadingPairs}
          onPairsChange={setPairs}
        />
      ) : (
        <ExclusionSettings
          patterns={exclusionPatterns}
          onPatternsChange={handleExclusionPatternsChange}
        />
      )}
    </div>
  );
}
