// Pure utility functions for translation logic
// These are extracted from TranslatorManager for testability

import type { TranslationAvailabilityStatus } from "./translator";

/**
 * Chrome Translator API availability values
 */
export type ChromeAvailability =
  | "unavailable"
  | "downloadable"
  | "downloading"
  | "available";

/**
 * Cached translator language pair info
 */
export interface LanguagePair {
  sourceLanguage: string;
  targetLanguage: string;
}

/**
 * Map Chrome API availability status to internal enum
 */
export function mapAvailabilityStatus(
  chromeStatus: ChromeAvailability
): TranslationAvailabilityStatus {
  switch (chromeStatus) {
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
}

/**
 * Split text into paragraphs for structured translation
 * Splits on double newlines (paragraph breaks)
 */
export function splitTextIntoParagraphs(text: string): string[] {
  return text.split(/\n\n+/);
}

/**
 * Join paragraphs with double newlines
 */
export function joinParagraphs(paragraphs: string[]): string {
  return paragraphs.join("\n\n");
}

/**
 * Build streaming result by joining completed paragraphs with current progress
 */
export function buildStreamingResult(
  completedParagraphs: string[],
  currentParagraph: string
): string {
  return [...completedParagraphs, currentParagraph].join("\n\n");
}

/**
 * Check if cached translator matches the requested language pair
 */
export function isSameLanguagePair(
  cached: LanguagePair | null,
  sourceLanguage: string,
  targetLanguage: string
): boolean {
  if (!cached) return false;
  return (
    cached.sourceLanguage === sourceLanguage &&
    cached.targetLanguage === targetLanguage
  );
}

/**
 * Check if a paragraph is empty (whitespace only)
 */
export function isEmptyParagraph(paragraph: string): boolean {
  return paragraph.trim().length === 0;
}
