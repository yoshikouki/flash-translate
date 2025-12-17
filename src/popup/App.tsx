import { useState, useEffect } from "react";
import {
  getSettings,
  saveSettings,
  type ExclusionPattern,
} from "@/shared/storage/settings";
import { SUPPORTED_LANGUAGES } from "@/shared/constants/languages";
import {
  checkAllPairsToTarget,
  translatorManager,
  type LanguagePairStatus,
  type TranslationAvailabilityStatus,
} from "@/shared/utils/translator";
import { TargetLanguageSelector } from "./components/TargetLanguageSelector";
import { SourceLanguageChips } from "./components/SourceLanguageChips";
import { ExclusionSettings } from "./components/ExclusionSettings";
import { useCurrentTabUrl } from "./hooks/useCurrentTabUrl";

export default function App() {
  const [targetLanguage, setTargetLanguage] = useState<string>("ja");
  const [targetDownloadStatus, setTargetDownloadStatus] =
    useState<TranslationAvailabilityStatus>("available");
  const [pairs, setPairs] = useState<LanguagePairStatus[]>([]);
  const [isLoadingPairs, setIsLoadingPairs] = useState(false);
  const [exclusionPatterns, setExclusionPatterns] = useState<
    ExclusionPattern[]
  >([]);

  const currentTabUrl = useCurrentTabUrl();

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

  // Check target language download status
  useEffect(() => {
    const checkTargetStatus = async () => {
      // Check if we can translate from English to target
      const status = await translatorManager.checkAvailability(
        "en",
        targetLanguage
      );
      setTargetDownloadStatus(status);
    };
    checkTargetStatus();
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
        downloadStatus={targetDownloadStatus}
        onChangeTargetLanguage={handleTargetLanguageChange}
      />

      {/* Source language chips */}
      <SourceLanguageChips
        targetLanguage={targetLanguage}
        pairs={pairs}
        isLoading={isLoadingPairs}
        onPairsChange={setPairs}
      />

      {/* Exclusion settings */}
      <ExclusionSettings
        patterns={exclusionPatterns}
        currentTabUrl={currentTabUrl}
        onPatternsChange={handleExclusionPatternsChange}
      />
    </div>
  );
}
