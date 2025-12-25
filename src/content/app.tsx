import { useEffect, useState } from "react";
import {
  type ExclusionPattern,
  getPageLanguage,
  getSettings,
  isUrlExcluded,
  shouldSkipTranslation,
  subscribeToSettings,
} from "@/shared/storage/settings";
import { TranslationCard } from "./components/translation-card";
import { useTextSelection } from "./hooks/use-text-selection";

function getCurrentUrl(): string {
  return window.location.origin + window.location.pathname;
}

export default function App() {
  const { selection, isVisible, dismissPopup, clearSelection } =
    useTextSelection();
  const [targetLanguage, setTargetLanguage] = useState("ja");
  const [skipSameLanguage, setSkipSameLanguage] = useState(true);
  const [exclusionPatterns, setExclusionPatterns] = useState<
    ExclusionPattern[]
  >([]);

  useEffect(() => {
    const loadSettings = async () => {
      const settings = await getSettings();
      setTargetLanguage(settings.targetLanguage);
      setSkipSameLanguage(settings.skipSameLanguage);
      setExclusionPatterns(settings.exclusionPatterns);
    };

    loadSettings();

    const unsubscribe = subscribeToSettings((settings) => {
      setTargetLanguage(settings.targetLanguage);
      setSkipSameLanguage(settings.skipSameLanguage);
      setExclusionPatterns(settings.exclusionPatterns);
    });

    return unsubscribe;
  }, []);

  // Check if current URL is excluded
  if (isUrlExcluded(getCurrentUrl(), exclusionPatterns)) {
    return null;
  }

  if (!(selection && isVisible)) {
    return null;
  }

  // Skip translation if page language matches target language
  const pageLanguage = getPageLanguage();
  if (shouldSkipTranslation(targetLanguage, skipSameLanguage, pageLanguage)) {
    return null;
  }

  return (
    <TranslationCard
      onClose={dismissPopup}
      onExcludeSite={clearSelection}
      selection={selection}
    />
  );
}
