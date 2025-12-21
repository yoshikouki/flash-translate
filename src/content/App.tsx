import { useState, useEffect } from "react";
import { useTextSelection } from "./hooks/useTextSelection";
import { TranslationCard } from "./components/TranslationCard";
import {
  getSettings,
  subscribeToSettings,
  shouldSkipTranslation,
  getPageLanguage,
  isUrlExcluded,
  type ExclusionPattern,
} from "@/shared/storage/settings";

function getCurrentUrl(): string {
  return window.location.origin + window.location.pathname;
}

export default function App() {
  const { selection, isVisible, dismissPopup, clearSelection } = useTextSelection();
  const [targetLanguage, setTargetLanguage] = useState("ja");
  const [skipSameLanguage, setSkipSameLanguage] = useState(true);
  const [exclusionPatterns, setExclusionPatterns] = useState<ExclusionPattern[]>([]);

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

  if (!selection || !isVisible) {
    return null;
  }

  // Skip translation if page language matches target language
  const pageLanguage = getPageLanguage();
  if (shouldSkipTranslation(targetLanguage, skipSameLanguage, pageLanguage)) {
    return null;
  }

  return (
    <TranslationCard
      selection={selection}
      onClose={dismissPopup}
      onExcludeSite={clearSelection}
    />
  );
}
