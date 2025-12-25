// Using official @types/dom-chromium-ai types

import {
  buildStreamingResult,
  type ChromeAvailability,
  createNotAvailableError,
  createUnavailabilityError,
  createUnsupportedError,
  filterSourceLanguages,
  isEmptyParagraph,
  isSameLanguagePair,
  mapAvailabilityStatus,
  splitTextIntoParagraphs,
} from "./translatorUtils";

interface CachedTranslator {
  translator: Translator;
  sourceLanguage: string;
  targetLanguage: string;
}

// Our internal availability status (maps from Availability type)
export type TranslationAvailabilityStatus =
  | "available"
  | "after-download"
  | "unavailable"
  | "unsupported";

class TranslatorManager {
  private instance: CachedTranslator | null = null;
  private isCreating = false;
  private pendingRequests: Array<{
    resolve: (translator: Translator) => void;
    reject: (error: Error) => void;
  }> = [];

  async checkAvailability(
    sourceLanguage: string,
    targetLanguage: string
  ): Promise<TranslationAvailabilityStatus> {
    if (typeof Translator === "undefined") {
      return "unsupported";
    }

    try {
      const result = await Translator.availability({
        sourceLanguage,
        targetLanguage,
      });

      return mapAvailabilityStatus(result as ChromeAvailability);
    } catch {
      return "unsupported";
    }
  }

  async getTranslator(
    sourceLanguage: string,
    targetLanguage: string
  ): Promise<Translator> {
    // Reuse existing instance if same language pair
    if (isSameLanguagePair(this.instance, sourceLanguage, targetLanguage)) {
      return this.instance?.translator;
    }

    // Destroy existing instance if different language pair
    if (this.instance) {
      this.instance.translator.destroy();
      this.instance = null;
    }

    // Queue request if already creating
    if (this.isCreating) {
      return new Promise((resolve, reject) => {
        this.pendingRequests.push({ resolve, reject });
      });
    }

    this.isCreating = true;

    try {
      if (typeof Translator === "undefined") {
        throw createNotAvailableError();
      }

      // Check availability
      const availability = await this.checkAvailability(
        sourceLanguage,
        targetLanguage
      );

      if (availability === "unsupported") {
        throw createUnsupportedError();
      }

      if (availability === "unavailable") {
        throw createUnavailabilityError(sourceLanguage, targetLanguage);
      }

      // Create translator instance with download progress monitoring
      const translator = await Translator.create({
        sourceLanguage,
        targetLanguage,
        monitor(m) {
          const handleProgress = (e: ProgressEvent) => {
            if (e.lengthComputable && import.meta.env.DEV) {
              const progress = (e.loaded / e.total) * 100;
              console.log(
                `Translation model download: ${progress.toFixed(1)}%`
              );
            }
            // Remove listener when download is complete
            if (e.loaded === e.total) {
              m.removeEventListener("downloadprogress", handleProgress);
            }
          };
          m.addEventListener("downloadprogress", handleProgress);
        },
      });

      this.instance = {
        translator,
        sourceLanguage,
        targetLanguage,
      };

      // Resolve pending requests
      for (const { resolve } of this.pendingRequests) {
        resolve(translator);
      }
      this.pendingRequests = [];

      return translator;
    } catch (error) {
      // Reject pending requests
      for (const { reject } of this.pendingRequests) {
        reject(error as Error);
      }
      this.pendingRequests = [];
      throw error;
    } finally {
      this.isCreating = false;
    }
  }

  async translate(
    text: string,
    sourceLanguage: string,
    targetLanguage: string
  ): Promise<string> {
    const translator = await this.getTranslator(sourceLanguage, targetLanguage);
    return translator.translate(text);
  }

  // biome-ignore lint/complexity/noExcessiveCognitiveComplexity: Streaming logic requires handling multiple paragraphs
  async *translateStreaming(
    text: string,
    sourceLanguage: string,
    targetLanguage: string
  ): AsyncGenerator<string> {
    const translator = await this.getTranslator(sourceLanguage, targetLanguage);

    // Split by paragraph breaks to preserve structure
    const paragraphs = splitTextIntoParagraphs(text);

    if (paragraphs.length === 1) {
      // Single paragraph - stream normally
      const stream = translator.translateStreaming(text);
      const reader = stream.getReader();
      try {
        let accumulated = "";
        while (true) {
          const { done, value } = await reader.read();
          if (done) {
            break;
          }
          accumulated += value;
          yield accumulated;
        }
      } finally {
        reader.releaseLock();
      }
    } else {
      // Multiple paragraphs - translate each and join with line breaks
      const translatedParagraphs: string[] = [];

      for (const paragraph of paragraphs) {
        if (isEmptyParagraph(paragraph)) {
          translatedParagraphs.push("");
          continue;
        }

        const stream = translator.translateStreaming(paragraph.trim());
        const reader = stream.getReader();

        try {
          let paragraphResult = "";
          while (true) {
            const { done, value } = await reader.read();
            if (done) {
              break;
            }
            paragraphResult += value;
            // Yield current progress: completed paragraphs + current paragraph
            yield buildStreamingResult(translatedParagraphs, paragraphResult);
          }
          translatedParagraphs.push(paragraphResult);
        } finally {
          reader.releaseLock();
        }
      }
    }
  }

  destroy(): void {
    if (this.instance) {
      this.instance.translator.destroy();
      this.instance = null;
    }
  }
}

// Singleton instance
export const translatorManager = new TranslatorManager();

// Language pair availability info
export interface LanguagePairStatus {
  sourceLanguage: string;
  targetLanguage: string;
  status: TranslationAvailabilityStatus;
}

// Check availability for all source languages to a specific target
export async function checkAllPairsToTarget(
  targetLanguage: string,
  sourceLanguages: string[]
): Promise<LanguagePairStatus[]> {
  const filteredLanguages = filterSourceLanguages(
    sourceLanguages,
    targetLanguage
  );
  const results = await Promise.all(
    filteredLanguages.map(async (sourceLanguage) => {
      const status = await translatorManager.checkAvailability(
        sourceLanguage,
        targetLanguage
      );
      return { sourceLanguage, targetLanguage, status };
    })
  );
  return results;
}
