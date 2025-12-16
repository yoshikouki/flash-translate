// Translator API types based on Chrome's built-in AI APIs
// Reference: https://developer.chrome.com/docs/ai/translator-api

export interface TranslatorOptions {
  sourceLanguage: string;
  targetLanguage: string;
  monitor?: (monitor: TranslatorMonitor) => void;
}

export interface TranslatorMonitor {
  addEventListener(
    type: "downloadprogress",
    listener: (event: DownloadProgressEvent) => void
  ): void;
}

export interface DownloadProgressEvent {
  loaded: number;
  total: number;
}

export interface TranslatorInstance {
  translate(text: string): Promise<string>;
  translateStreaming(text: string): ReadableStream<string>;
  measureInputUsage(text: string): Promise<number>;
  destroy(): void;
  readonly sourceLanguage: string;
  readonly targetLanguage: string;
  readonly inputQuota: number;
}

export interface TranslatorAvailability {
  available: "no" | "after-download" | "readily";
}

export interface TranslatorStatic {
  availability(options?: {
    sourceLanguage?: string;
    targetLanguage?: string;
  }): Promise<TranslatorAvailability>;
  create(options: TranslatorOptions): Promise<TranslatorInstance>;
}

// Extend Window interface for Translator API
declare global {
  interface Window {
    Translator?: TranslatorStatic;
  }
}

export type TranslationAvailabilityStatus =
  | "available"
  | "after-download"
  | "unavailable"
  | "unsupported";
