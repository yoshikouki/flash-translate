import type { TranslatorAvailability } from "@/shared/utils/translator";

interface TranslationContentProps {
  availability: TranslatorAvailability;
  sourceLanguage: string;
  targetLanguage: string;
  isLoading: boolean;
  result: string | null;
  error: Error | null;
}

export function TranslationContent({
  availability,
  sourceLanguage,
  targetLanguage,
  isLoading,
  result,
  error,
}: TranslationContentProps) {
  if (availability === "unsupported") {
    return (
      <div className="text-red-600 text-sm bg-red-50 px-3 py-2 rounded-lg">
        Translator API is not supported in this browser. Please use Chrome 138+
        with the API enabled.
      </div>
    );
  }

  if (availability === "unavailable") {
    return (
      <div className="text-red-600 text-sm bg-red-50 px-3 py-2 rounded-lg">
        Translation from {sourceLanguage} to {targetLanguage} is not available.
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-600 text-sm bg-red-50 px-3 py-2 rounded-lg">
        {error.message}
      </div>
    );
  }

  if (isLoading && !result) {
    return (
      <div className="flex items-center gap-3">
        <div className="w-5 h-5 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
        <span className="text-gray-500 text-sm">
          {availability === "after-download"
            ? "Downloading translation model..."
            : "Translating..."}
        </span>
      </div>
    );
  }

  return (
    <div className="text-gray-800 text-base leading-relaxed whitespace-pre-wrap break-words">
      {result || (
        <span className="text-gray-400 italic">Translation...</span>
      )}
    </div>
  );
}
