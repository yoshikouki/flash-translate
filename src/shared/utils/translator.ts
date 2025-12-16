// Using official @types/dom-chromium-ai types

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

      // Availability type: "unavailable" | "downloadable" | "downloading" | "available"
      switch (result) {
        case "available":
          return "available";
        case "downloadable":
        case "downloading":
          return "after-download";
        case "unavailable":
          return "unavailable";
        default:
          return "unavailable";
      }
    } catch {
      return "unsupported";
    }
  }

  async getTranslator(
    sourceLanguage: string,
    targetLanguage: string
  ): Promise<Translator> {
    // Reuse existing instance if same language pair
    if (
      this.instance &&
      this.instance.sourceLanguage === sourceLanguage &&
      this.instance.targetLanguage === targetLanguage
    ) {
      return this.instance.translator;
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
        throw new Error("Translator API is not available in this browser");
      }

      // Check availability
      const availability = await this.checkAvailability(
        sourceLanguage,
        targetLanguage
      );

      if (availability === "unsupported") {
        throw new Error("Translator API is not supported");
      }

      if (availability === "unavailable") {
        throw new Error(
          `Translation not available for ${sourceLanguage} → ${targetLanguage}`
        );
      }

      // Create translator instance with download progress monitoring
      const translator = await Translator.create({
        sourceLanguage,
        targetLanguage,
        monitor(m) {
          m.addEventListener("downloadprogress", (e: ProgressEvent) => {
            if (e.lengthComputable) {
              const progress = (e.loaded / e.total) * 100;
              console.log(`Translation model download: ${progress.toFixed(1)}%`);
            }
          });
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

  async *translateStreaming(
    text: string,
    sourceLanguage: string,
    targetLanguage: string
  ): AsyncGenerator<string> {
    const translator = await this.getTranslator(sourceLanguage, targetLanguage);
    const stream = translator.translateStreaming(text);
    const reader = stream.getReader();

    try {
      let accumulated = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        accumulated += value;
        yield accumulated;
      }
    } finally {
      reader.releaseLock();
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
