import { useEffect, useState } from "react";
import { SUPPORTED_LANGUAGES } from "@/shared/constants/languages";
import { getSettings, saveSettings } from "@/shared/storage/settings";
import {
  checkAllPairsToTarget,
  type LanguagePairStatus,
} from "@/shared/utils/translator";
import { SourceLanguageChips } from "./SourceLanguageChips";
import { TargetLanguageChips } from "./TargetLanguageChips";

export function LanguageSettings() {
  const [sourceLanguage, setSourceLanguage] = useState<string>("en");
  const [targetLanguage, setTargetLanguage] = useState<string>("ja");
  const [pairs, setPairs] = useState<LanguagePairStatus[]>([]);
  const [isLoadingPairs, setIsLoadingPairs] = useState(false);

  // Load initial settings
  useEffect(() => {
    const init = async () => {
      const settings = await getSettings();
      setSourceLanguage(settings.sourceLanguage);
      setTargetLanguage(settings.targetLanguage);
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

  const handleSourceLanguageChange = async (code: string) => {
    setSourceLanguage(code);
    await saveSettings({ sourceLanguage: code });
  };

  const handleTargetLanguageChange = async (code: string) => {
    setTargetLanguage(code);
    await saveSettings({ targetLanguage: code });
  };

  return (
    <>
      <TargetLanguageChips
        onChangeTargetLanguage={handleTargetLanguageChange}
        targetLanguage={targetLanguage}
      />
      <SourceLanguageChips
        isLoading={isLoadingPairs}
        onPairsChange={setPairs}
        onSourceLanguageChange={handleSourceLanguageChange}
        pairs={pairs}
        sourceLanguage={sourceLanguage}
        targetLanguage={targetLanguage}
      />
    </>
  );
}
