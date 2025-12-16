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
  // loaded is a fraction between 0 and 1 representing download progress
  loaded: number;
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

// Chrome Translator API availability returns a string directly
export type TranslatorAvailability = "available" | "downloadable" | "unsupported";

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
