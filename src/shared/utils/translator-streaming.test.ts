import { describe, expect, it } from "vitest";
import {
  readStreamAccumulated,
  streamMultipleParagraphs,
} from "./translator-streaming";

function createMockReadableStream(chunks: string[]): ReadableStream<string> {
  let index = 0;
  return new ReadableStream({
    pull(controller) {
      if (index < chunks.length) {
        controller.enqueue(chunks[index]);
        index++;
      } else {
        controller.close();
      }
    },
  });
}

describe("readStreamAccumulated", () => {
  it("yields accumulated results for each chunk", async () => {
    const stream = createMockReadableStream(["Hello", " ", "World"]);
    const results: string[] = [];

    for await (const result of readStreamAccumulated(stream)) {
      results.push(result);
    }

    expect(results).toEqual(["Hello", "Hello ", "Hello World"]);
  });

  it("handles empty stream", async () => {
    const stream = createMockReadableStream([]);
    const results: string[] = [];

    for await (const result of readStreamAccumulated(stream)) {
      results.push(result);
    }

    expect(results).toEqual([]);
  });

  it("handles single chunk stream", async () => {
    const stream = createMockReadableStream(["Complete text"]);
    const results: string[] = [];

    for await (const result of readStreamAccumulated(stream)) {
      results.push(result);
    }

    expect(results).toEqual(["Complete text"]);
  });
});

describe("streamMultipleParagraphs", () => {
  function createTranslateStreaming(
    mapping: Record<string, string[]>
  ): (text: string) => ReadableStream<string> {
    return (text: string) => {
      const chunks = mapping[text] || [text];
      return createMockReadableStream(chunks);
    };
  }

  it("yields combined progress for multiple paragraphs", async () => {
    const translateStreaming = createTranslateStreaming({
      Hello: ["こん", "にちは"],
      World: ["世", "界"],
    });

    const paragraphs = ["Hello", "World"];
    const results: string[] = [];

    for await (const result of streamMultipleParagraphs(
      paragraphs,
      translateStreaming
    )) {
      results.push(result);
    }

    expect(results).toEqual([
      "こん", // First chunk of first paragraph
      "こんにちは", // Final of first paragraph
      "こんにちは\n\n世", // First chunk of second paragraph
      "こんにちは\n\n世界", // Final result
    ]);
  });

  it("preserves empty paragraphs", async () => {
    const translateStreaming = createTranslateStreaming({
      Hello: ["こんにちは"],
      World: ["世界"],
    });

    const paragraphs = ["Hello", "", "World"];
    const results: string[] = [];

    for await (const result of streamMultipleParagraphs(
      paragraphs,
      translateStreaming
    )) {
      results.push(result);
    }

    expect(results).toEqual([
      "こんにちは", // First paragraph
      "こんにちは\n\n\n\n世界", // Third paragraph (with empty paragraph preserved)
    ]);
  });

  it("handles single paragraph", async () => {
    const translateStreaming = createTranslateStreaming({
      "Single paragraph": ["単一", "の段", "落"],
    });

    const paragraphs = ["Single paragraph"];
    const results: string[] = [];

    for await (const result of streamMultipleParagraphs(
      paragraphs,
      translateStreaming
    )) {
      results.push(result);
    }

    expect(results).toEqual(["単一", "単一の段", "単一の段落"]);
  });

  it("trims paragraph text before translating", async () => {
    const translateStreaming = createTranslateStreaming({
      Hello: ["こんにちは"],
    });

    const paragraphs = ["  Hello  "];
    const results: string[] = [];

    for await (const result of streamMultipleParagraphs(
      paragraphs,
      translateStreaming
    )) {
      results.push(result);
    }

    expect(results).toEqual(["こんにちは"]);
  });

  it("handles whitespace-only paragraphs as empty", async () => {
    const paragraphs = ["Hello", "   ", "World"];
    const results: string[] = [];

    for await (const result of streamMultipleParagraphs(paragraphs, (text) => {
      // Mock that will track what gets translated
      if (text === "Hello") {
        return createMockReadableStream(["こんにちは"]);
      }
      if (text === "World") {
        return createMockReadableStream(["世界"]);
      }
      throw new Error(`Unexpected text to translate: "${text}"`);
    })) {
      results.push(result);
    }

    expect(results).toEqual([
      "こんにちは", // First paragraph
      "こんにちは\n\n\n\n世界", // Third paragraph (whitespace paragraph preserved as empty)
    ]);
  });
});
