import { describe, expect, it } from "vitest";
import {
  readStreamAccumulated,
  streamMultipleParagraphs,
} from "./translator-streaming";

function streamOf(chunks: string[]): ReadableStream<string> {
  return new ReadableStream({
    start(controller) {
      for (const chunk of chunks) {
        controller.enqueue(chunk);
      }
      controller.close();
    },
  });
}

async function collect(source: AsyncIterable<string>): Promise<string[]> {
  const results: string[] = [];
  for await (const result of source) {
    results.push(result);
  }
  return results;
}

function translateWith(
  translations: Record<string, string[]>
): (text: string) => ReadableStream<string> {
  return (text) => {
    const chunks = translations[text];
    if (!chunks) {
      throw new Error(`Unexpected text to translate: "${text}"`);
    }
    return streamOf(chunks);
  };
}

describe("readStreamAccumulated", () => {
  it("yields the accumulated text after each chunk", async () => {
    await expect(
      collect(readStreamAccumulated(streamOf(["Hello", " ", "World"])))
    ).resolves.toEqual(["Hello", "Hello ", "Hello World"]);
  });
});

describe("streamMultipleParagraphs", () => {
  it("streams each paragraph after the completed ones", async () => {
    const translate = translateWith({
      Hello: ["こん", "にちは"],
      World: ["世", "界"],
    });

    await expect(
      collect(streamMultipleParagraphs(["Hello", "World"], translate))
    ).resolves.toEqual([
      "こん",
      "こんにちは",
      "こんにちは\n\n世",
      "こんにちは\n\n世界",
    ]);
  });

  it("keeps blank paragraphs without translating them", async () => {
    const translate = translateWith({
      Hello: ["こんにちは"],
      World: ["世界"],
    });

    await expect(
      collect(streamMultipleParagraphs(["Hello", "   ", "World"], translate))
    ).resolves.toEqual(["こんにちは", "こんにちは\n\n\n\n世界"]);
  });

  it("trims paragraph text before translating", async () => {
    const translate = translateWith({ Hello: ["こんにちは"] });

    await expect(
      collect(streamMultipleParagraphs(["  Hello  "], translate))
    ).resolves.toEqual(["こんにちは"]);
  });
});
