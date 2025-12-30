import { useEffect, useState } from "react";
import { htmlToMarkdown } from "@/lib/html-to-markdown";
import {
  DEFAULT_SOURCE_LANGUAGE,
  DEFAULT_TARGET_LANGUAGE,
} from "@/shared/constants/languages";
import {
  getSettings,
  saveSettings,
  subscribeToSettings,
} from "@/shared/storage/settings";
import { calculateMaxPopupWidth } from "../components/translation-card-utils";
import type { SelectionInfo } from "./use-text-selection";
import { useTranslator } from "./use-translator";

interface UseTranslationCardStateOptions {
  selection: SelectionInfo;
}

interface UseTranslationCardStateReturn {
  // Language settings
  sourceLanguage: string;
  targetLanguage: string;
  handleSourceChange: (lang: string) => Promise<void>;
  handleTargetChange: (lang: string) => Promise<void>;
  handleSwap: () => Promise<void>;
  // Translation state
  result: string;
  isLoading: boolean;
  error: Error | null;
  availability: ReturnType<typeof useTranslator>["availability"];
  // Layout
  maxPopupWidth: number;
}

export function useTranslationCardState({
  selection,
}: UseTranslationCardStateOptions): UseTranslationCardStateReturn {
  const [sourceLanguage, setSourceLanguage] = useState(DEFAULT_SOURCE_LANGUAGE);
  const [targetLanguage, setTargetLanguage] = useState(DEFAULT_TARGET_LANGUAGE);
  const [maxPopupWidth, setMaxPopupWidth] = useState(() =>
    calculateMaxPopupWidth(window.innerWidth)
  );

  const { result, isLoading, error, translate, availability } = useTranslator({
    sourceLanguage,
    targetLanguage,
  });

  // Load initial settings and subscribe to changes
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

  // Update max width on window resize with debounce
  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>;
    const handleResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        setMaxPopupWidth(calculateMaxPopupWidth(window.innerWidth));
      }, 100);
    };
    window.addEventListener("resize", handleResize);
    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  // Translate when selection or language changes
  // biome-ignore lint/correctness/useExhaustiveDependencies: translate is intentionally excluded to avoid infinite loops (it captures sourceLanguage/targetLanguage)
  useEffect(() => {
    const translateWithMarkdown = async () => {
      if (!selection.text) {
        return;
      }

      // Convert HTML to Markdown for better translation context
      const textToTranslate = selection.html
        ? await htmlToMarkdown(selection.html)
        : selection.text;

      translate(textToTranslate);
    };

    translateWithMarkdown();
  }, [selection.text, selection.html, sourceLanguage, targetLanguage]);

  const handleSourceChange = async (lang: string) => {
    setSourceLanguage(lang);
    await saveSettings({ sourceLanguage: lang });
  };

  const handleTargetChange = async (lang: string) => {
    setTargetLanguage(lang);
    await saveSettings({ targetLanguage: lang });
  };

  const handleSwap = async () => {
    const newSource = targetLanguage;
    const newTarget = sourceLanguage;
    setSourceLanguage(newSource);
    setTargetLanguage(newTarget);
    await saveSettings({
      sourceLanguage: newSource,
      targetLanguage: newTarget,
    });
  };

  return {
    sourceLanguage,
    targetLanguage,
    handleSourceChange,
    handleTargetChange,
    handleSwap,
    result,
    isLoading,
    error,
    availability,
    maxPopupWidth,
  };
}
