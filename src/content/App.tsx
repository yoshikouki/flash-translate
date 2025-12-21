import { useState, useEffect } from "react";
import { useTextSelection } from "./hooks/useTextSelection";
import { TranslationCard } from "./components/TranslationCard";
import {
  getSettings,
  subscribeToSettings,
  shouldSkipTranslation,
  getPageLanguage,
} from "@/shared/storage/settings";

export default function App() {
  const { selection, clearSelection } = useTextSelection();
  const [targetLanguage, setTargetLanguage] = useState("ja");
  const [skipSameLanguage, setSkipSameLanguage] = useState(true);

  useEffect(() => {
    const loadSettings = async () => {
      const settings = await getSettings();
      setTargetLanguage(settings.targetLanguage);
      setSkipSameLanguage(settings.skipSameLanguage);
    };

    loadSettings();

    const unsubscribe = subscribeToSettings((settings) => {
      setTargetLanguage(settings.targetLanguage);
      setSkipSameLanguage(settings.skipSameLanguage);
    });

    return unsubscribe;
  }, []);

  if (!selection) {
    return null;
  }

  // Skip translation if page language matches target language
  const pageLanguage = getPageLanguage();
  if (shouldSkipTranslation(targetLanguage, skipSameLanguage, pageLanguage)) {
    return null;
  }

  return <TranslationCard selection={selection} onClose={clearSelection} />;
}
