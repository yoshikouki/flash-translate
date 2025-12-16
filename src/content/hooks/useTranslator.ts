import { useState, useCallback, useEffect, useRef } from "react";
import { translatorManager } from "@/shared/utils/translator";
import type { TranslationAvailabilityStatus } from "@/shared/types/translator";

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

  const translate = useCallback(
    async (text: string) => {
      if (!text.trim()) return;

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
          setState({ result, isLoading: false, error: null, availability: state.availability });
        }
      } catch (error) {
        if (error instanceof Error && error.name === "AbortError") {
          return;
        }
        setState((prev) => ({
          ...prev,
          result: "",
          isLoading: false,
          error: error instanceof Error ? error : new Error("Unknown error"),
        }));
      }
    },
    [sourceLanguage, targetLanguage, streaming, state.availability]
  );

  const reset = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setState((prev) => ({
      ...prev,
      result: "",
      isLoading: false,
      error: null,
    }));
  }, []);

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
