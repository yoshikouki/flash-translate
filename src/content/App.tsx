import { useState, useEffect } from "react";
import { useTextSelection } from "./hooks/useTextSelection";
import { TranslationPopup } from "./components/TranslationPopup";
import {
  DEFAULT_SOURCE_LANGUAGE,
  DEFAULT_TARGET_LANGUAGE,
} from "@/shared/constants/languages";
import {
  getSettings,
  subscribeToSettings,
} from "@/shared/storage/settings";

export default function App() {
  const { selection, clearSelection } = useTextSelection();
  const [sourceLanguage, setSourceLanguage] = useState(DEFAULT_SOURCE_LANGUAGE);
  const [targetLanguage, setTargetLanguage] = useState(DEFAULT_TARGET_LANGUAGE);

  // Load and subscribe to settings
  useEffect(() => {
    const loadSettings = async () => {
      const settings = await getSettings();
      setSourceLanguage(settings.sourceLanguage);
      setTargetLanguage(settings.targetLanguage);
    };

    loadSettings();

    const unsubscribe = subscribeToSettings((settings) => {
      setSourceLanguage(settings.sourceLanguage);
      setTargetLanguage(settings.targetLanguage);
    });

    return unsubscribe;
  }, []);

  if (!selection) {
    return null;
  }

  return (
    <TranslationPopup
      selection={selection}
      sourceLanguage={sourceLanguage}
      targetLanguage={targetLanguage}
      onClose={clearSelection}
    />
  );
}
