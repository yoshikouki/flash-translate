import { useEffect, useState } from "react";
import { SUPPORTED_LANGUAGES } from "@/shared/constants/languages";
import { useSettings } from "@/shared/hooks/use-settings";
import { saveSettings } from "@/shared/storage/settings";
import { selectLanguageSettings } from "@/shared/storage/settings-selectors";
import {
  checkAllPairsToTarget,
  type LanguagePairStatus,
} from "@/shared/utils/translator";
import { SourceLanguageChips } from "./source-language-chips";
import { TargetLanguageChips } from "./target-language-chips";

export function LanguageSettings() {
  const [initialSettings, isLoading] = useSettings(selectLanguageSettings, {
    subscribe: false,
  });

  const [sourceLanguage, setSourceLanguage] = useState<string>("en");
  const [targetLanguage, setTargetLanguage] = useState<string>("ja");
  const [pairs, setPairs] = useState<LanguagePairStatus[]>([]);
  const [isLoadingPairs, setIsLoadingPairs] = useState(false);

  // Apply initial settings when loaded
  useEffect(() => {
    if (initialSettings) {
      setSourceLanguage(initialSettings.sourceLanguage);
      setTargetLanguage(initialSettings.targetLanguage);
    }
  }, [initialSettings]);

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

  if (isLoading) {
    return null;
  }

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
