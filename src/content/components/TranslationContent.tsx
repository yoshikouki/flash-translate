import type { TranslationAvailabilityStatus } from "@/shared/utils/translator";

interface TranslationContentProps {
  availability: TranslationAvailabilityStatus;
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
      <div className="rounded-lg bg-red-50 px-3 py-2 text-red-600 text-sm">
        Translator API is not supported in this browser. Please use Chrome 138+
        with the API enabled.
      </div>
    );
  }

  if (availability === "unavailable") {
    return (
      <div className="rounded-lg bg-red-50 px-3 py-2 text-red-600 text-sm">
        Translation from {sourceLanguage} to {targetLanguage} is not available.
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg bg-red-50 px-3 py-2 text-red-600 text-sm">
        {error.message}
      </div>
    );
  }

  if (isLoading && !result) {
    return (
      <div className="flex items-center gap-3">
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-blue-200 border-t-blue-600" />
        <span className="text-gray-500 text-sm">
          {availability === "after-download"
            ? "Downloading translation model..."
            : "Translating..."}
        </span>
      </div>
    );
  }

  return (
    <div className="whitespace-pre-wrap break-words text-base text-gray-800 leading-relaxed">
      {result || <span className="text-gray-400 italic">Translation...</span>}
    </div>
  );
}
