// Pure streaming utilities for translator
// Extracted from TranslatorManager for testability and reduced complexity

import { buildStreamingResult, isEmptyParagraph } from "./translator-utils";

/**
 * Reads from a ReadableStream and yields accumulated results
 * Each yield contains the full accumulated text so far
 */
export async function* readStreamAccumulated(
  stream: ReadableStream<string>
): AsyncGenerator<string> {
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
}

/**
 * Streams multiple paragraphs, yielding combined progress
 * Empty paragraphs are preserved, non-empty ones are translated with streaming
 */
export async function* streamMultipleParagraphs(
  paragraphs: string[],
  translateStreaming: (text: string) => ReadableStream<string>
): AsyncGenerator<string> {
  const translatedParagraphs: string[] = [];

  for (const paragraph of paragraphs) {
    if (isEmptyParagraph(paragraph)) {
      translatedParagraphs.push("");
      continue;
    }

    let paragraphResult = "";
    for await (const result of readStreamAccumulated(
      translateStreaming(paragraph.trim())
    )) {
      paragraphResult = result;
      yield buildStreamingResult(translatedParagraphs, paragraphResult);
    }
    translatedParagraphs.push(paragraphResult);
  }
}
