import { useEffect, useRef, useState } from "react";
import {
  type TranslationAvailabilityStatus,
  translatorManager,
} from "@/shared/utils/translator";
import {
  isAbortError,
  isValidTranslationText,
  toError,
} from "@/shared/utils/translator-utils";

interface UseTranslatorOptions {
  sourceLanguage: string;
  targetLanguage: string;
  streaming?: boolean;
}

interface TranslatorState {
  result: string;
  isLoading: boolean;
  error: Error | null;
  availability: TranslationAvailabilityStatus;
}

export function useTranslator({
  sourceLanguage,
  targetLanguage,
  streaming = true,
}: UseTranslatorOptions) {
  const [state, setState] = useState<TranslatorState>({
    result: "",
    isLoading: false,
    error: null,
    availability: "available",
  });

  const abortControllerRef = useRef<AbortController | null>(null);

  // Check availability when language changes
  useEffect(() => {
    const checkAvailability = async () => {
      const availability = await translatorManager.checkAvailability(
        sourceLanguage,
        targetLanguage
      );
      setState((prev) => ({ ...prev, availability }));
    };

    checkAvailability();
  }, [sourceLanguage, targetLanguage]);

  // biome-ignore lint/complexity/noExcessiveCognitiveComplexity: Translation logic requires handling multiple states
  const translate = async (text: string) => {
    if (!isValidTranslationText(text)) {
      return;
    }

    // Cancel previous translation if still running
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    setState((prev) => ({
      ...prev,
      result: "",
      isLoading: true,
      error: null,
    }));

    try {
      if (streaming) {
        // Streaming translation
        let result = "";
        for await (const chunk of translatorManager.translateStreaming(
          text,
          sourceLanguage,
          targetLanguage
        )) {
          // Check if aborted
          if (abortControllerRef.current?.signal.aborted) {
            return;
          }
          result = chunk; // API returns cumulative result
          setState((prev) => ({ ...prev, result }));
        }
        setState((prev) => ({ ...prev, isLoading: false }));
      } else {
        // Non-streaming translation
        const result = await translatorManager.translate(
          text,
          sourceLanguage,
          targetLanguage
        );
        setState((prev) => ({
          ...prev,
          result,
          isLoading: false,
          error: null,
        }));
      }
    } catch (error) {
      if (isAbortError(error)) {
        return;
      }
      setState((prev) => ({
        ...prev,
        result: "",
        isLoading: false,
        error: toError(error),
      }));
    }
  };

  const reset = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setState((prev) => ({
      ...prev,
      result: "",
      isLoading: false,
      error: null,
    }));
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return { ...state, translate, reset };
}
