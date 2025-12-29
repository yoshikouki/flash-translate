import { useEffect, useRef, useState } from "react";
import {
  type TranslationAvailabilityStatus,
  translatorManager,
} from "@/shared/utils/translator";
import { isValidTranslationText } from "@/shared/utils/translator-utils";
import { executeStreamingTranslation } from "./translator-executor";

interface UseTranslatorOptions {
  sourceLanguage: string;
  targetLanguage: string;
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

  const translate = async (text: string) => {
    if (!isValidTranslationText(text)) {
      return;
    }

    // Cancel previous translation if still running
    abortControllerRef.current?.abort();
    abortControllerRef.current = new AbortController();

    setState((prev) => ({
      ...prev,
      result: "",
      isLoading: true,
      error: null,
    }));

    const options = {
      text,
      sourceLanguage,
      targetLanguage,
      signal: abortControllerRef.current.signal,
    };

    const executionResult = await executeStreamingTranslation(
      options,
      translatorManager,
      {
        onChunk: (result) => setState((prev) => ({ ...prev, result })),
      }
    );

    // Clean up the controller reference after execution completes
    abortControllerRef.current = null;

    // Handle aborted translation (new translation started)
    if (executionResult.type === "aborted") {
      return;
    }

    // Update state based on result
    if (executionResult.type === "error") {
      setState((prev) => ({
        ...prev,
        result: "",
        isLoading: false,
        error: executionResult.error,
      }));
    } else {
      setState((prev) => ({
        ...prev,
        result: executionResult.result,
        isLoading: false,
        error: null,
      }));
    }
  };

  const reset = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
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
