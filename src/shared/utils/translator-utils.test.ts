import { describe, expect, it } from "vitest";
import {
  buildStreamingResult,
  createNotAvailableError,
  createUnavailabilityError,
  createUnsupportedError,
  filterSourceLanguages,
  isAbortError,
  isEmptyParagraph,
  isSameLanguagePair,
  isValidTranslationText,
  joinParagraphs,
  mapAvailabilityStatus,
  splitTextIntoParagraphs,
  toError,
} from "./translator-utils";

describe("mapAvailabilityStatus", () => {
  it("maps 'available' to 'available'", () => {
    expect(mapAvailabilityStatus("available")).toBe("available");
  });

  it("maps 'downloadable' to 'after-download'", () => {
    expect(mapAvailabilityStatus("downloadable")).toBe("after-download");
  });

  it("maps 'downloading' to 'after-download'", () => {
    expect(mapAvailabilityStatus("downloading")).toBe("after-download");
  });

  it("maps 'unavailable' to 'unavailable'", () => {
    expect(mapAvailabilityStatus("unavailable")).toBe("unavailable");
  });
});

describe("splitTextIntoParagraphs", () => {
  it("returns single element array for text without paragraph breaks", () => {
    expect(splitTextIntoParagraphs("Hello world")).toEqual(["Hello world"]);
  });

  it("splits on double newlines", () => {
    expect(splitTextIntoParagraphs("Para 1\n\nPara 2")).toEqual([
      "Para 1",
      "Para 2",
    ]);
  });

  it("splits on multiple newlines (3+)", () => {
    expect(splitTextIntoParagraphs("Para 1\n\n\nPara 2")).toEqual([
      "Para 1",
      "Para 2",
    ]);
    expect(splitTextIntoParagraphs("Para 1\n\n\n\n\nPara 2")).toEqual([
      "Para 1",
      "Para 2",
    ]);
  });

  it("preserves single newlines within paragraphs", () => {
    expect(splitTextIntoParagraphs("Line 1\nLine 2\n\nPara 2")).toEqual([
      "Line 1\nLine 2",
      "Para 2",
    ]);
  });

  it("handles empty string", () => {
    expect(splitTextIntoParagraphs("")).toEqual([""]);
  });

  it("handles text with only newlines", () => {
    expect(splitTextIntoParagraphs("\n\n")).toEqual(["", ""]);
  });

  it("handles multiple paragraphs", () => {
    const text = "First paragraph.\n\nSecond paragraph.\n\nThird paragraph.";
    expect(splitTextIntoParagraphs(text)).toEqual([
      "First paragraph.",
      "Second paragraph.",
      "Third paragraph.",
    ]);
  });
});

describe("joinParagraphs", () => {
  it("joins empty array to empty string", () => {
    expect(joinParagraphs([])).toBe("");
  });

  it("joins single paragraph without separator", () => {
    expect(joinParagraphs(["Hello"])).toBe("Hello");
  });

  it("joins multiple paragraphs with double newlines", () => {
    expect(joinParagraphs(["Para 1", "Para 2"])).toBe("Para 1\n\nPara 2");
  });

  it("joins three paragraphs correctly", () => {
    expect(joinParagraphs(["A", "B", "C"])).toBe("A\n\nB\n\nC");
  });

  it("preserves empty paragraphs", () => {
    expect(joinParagraphs(["A", "", "C"])).toBe("A\n\n\n\nC");
  });
});

describe("buildStreamingResult", () => {
  it("returns current paragraph when no completed paragraphs", () => {
    expect(buildStreamingResult([], "Current")).toBe("Current");
  });

  it("joins completed paragraphs with current in progress", () => {
    expect(buildStreamingResult(["Done 1", "Done 2"], "In progress")).toBe(
      "Done 1\n\nDone 2\n\nIn progress"
    );
  });

  it("handles empty current paragraph", () => {
    expect(buildStreamingResult(["Done"], "")).toBe("Done\n\n");
  });

  it("handles single completed paragraph", () => {
    expect(buildStreamingResult(["Done"], "Current")).toBe("Done\n\nCurrent");
  });
});

describe("isSameLanguagePair", () => {
  it("returns false when cached is null", () => {
    expect(isSameLanguagePair(null, "en", "ja")).toBe(false);
  });

  it("returns true when both languages match", () => {
    const cached = { sourceLanguage: "en", targetLanguage: "ja" };
    expect(isSameLanguagePair(cached, "en", "ja")).toBe(true);
  });

  it("returns false when source differs", () => {
    const cached = { sourceLanguage: "en", targetLanguage: "ja" };
    expect(isSameLanguagePair(cached, "fr", "ja")).toBe(false);
  });

  it("returns false when target differs", () => {
    const cached = { sourceLanguage: "en", targetLanguage: "ja" };
    expect(isSameLanguagePair(cached, "en", "fr")).toBe(false);
  });

  it("returns false when both differ", () => {
    const cached = { sourceLanguage: "en", targetLanguage: "ja" };
    expect(isSameLanguagePair(cached, "fr", "de")).toBe(false);
  });

  it("is case-sensitive", () => {
    const cached = { sourceLanguage: "en", targetLanguage: "ja" };
    expect(isSameLanguagePair(cached, "EN", "ja")).toBe(false);
  });
});

describe("isEmptyParagraph", () => {
  it("returns true for empty string", () => {
    expect(isEmptyParagraph("")).toBe(true);
  });

  it("returns true for whitespace-only string", () => {
    expect(isEmptyParagraph("   ")).toBe(true);
    expect(isEmptyParagraph("\t")).toBe(true);
    expect(isEmptyParagraph("\n")).toBe(true);
  });

  it("returns false for non-empty string", () => {
    expect(isEmptyParagraph("Hello")).toBe(false);
  });

  it("returns false for string with leading/trailing whitespace", () => {
    expect(isEmptyParagraph("  Hello  ")).toBe(false);
  });

  it("returns false for string with only non-whitespace", () => {
    expect(isEmptyParagraph("a")).toBe(false);
  });
});

describe("isValidTranslationText", () => {
  it("returns true for non-empty text", () => {
    expect(isValidTranslationText("Hello")).toBe(true);
  });

  it("returns true for text with leading/trailing whitespace", () => {
    expect(isValidTranslationText("  Hello  ")).toBe(true);
  });

  it("returns false for empty string", () => {
    expect(isValidTranslationText("")).toBe(false);
  });

  it("returns false for whitespace-only string", () => {
    expect(isValidTranslationText("   ")).toBe(false);
    expect(isValidTranslationText("\t")).toBe(false);
    expect(isValidTranslationText("\n")).toBe(false);
    expect(isValidTranslationText("  \t\n  ")).toBe(false);
  });

  it("returns true for single character", () => {
    expect(isValidTranslationText("a")).toBe(true);
  });

  it("returns true for multiline text", () => {
    expect(isValidTranslationText("Line 1\nLine 2")).toBe(true);
  });
});

describe("isAbortError", () => {
  it("returns true for AbortError", () => {
    const abortError = new DOMException("Aborted", "AbortError");
    expect(isAbortError(abortError)).toBe(true);
  });

  it("returns true for Error with name AbortError", () => {
    const error = new Error("Operation cancelled");
    error.name = "AbortError";
    expect(isAbortError(error)).toBe(true);
  });

  it("returns false for regular Error", () => {
    expect(isAbortError(new Error("Some error"))).toBe(false);
  });

  it("returns false for TypeError", () => {
    expect(isAbortError(new TypeError("Type error"))).toBe(false);
  });

  it("returns false for non-Error values", () => {
    expect(isAbortError("AbortError")).toBe(false);
    expect(isAbortError(null)).toBe(false);
    expect(isAbortError(undefined)).toBe(false);
    expect(isAbortError({ name: "AbortError" })).toBe(false);
  });
});

describe("toError", () => {
  it("returns Error instance unchanged", () => {
    const error = new Error("Test error");
    expect(toError(error)).toBe(error);
  });

  it("returns TypeError unchanged", () => {
    const error = new TypeError("Type error");
    expect(toError(error)).toBe(error);
  });

  it("converts string to Error", () => {
    const result = toError("string error");
    expect(result).toBeInstanceOf(Error);
    expect(result.message).toBe("string error");
  });

  it("converts number to Error", () => {
    const result = toError(42);
    expect(result).toBeInstanceOf(Error);
    expect(result.message).toBe("42");
  });

  it("converts null to Error with 'Unknown error'", () => {
    const result = toError(null);
    expect(result).toBeInstanceOf(Error);
    expect(result.message).toBe("Unknown error");
  });

  it("converts undefined to Error with 'Unknown error'", () => {
    const result = toError(undefined);
    expect(result).toBeInstanceOf(Error);
    expect(result.message).toBe("Unknown error");
  });

  it("converts empty string to Error with 'Unknown error'", () => {
    const result = toError("");
    expect(result).toBeInstanceOf(Error);
    expect(result.message).toBe("Unknown error");
  });

  it("converts object to Error with string representation", () => {
    const result = toError({ key: "value" });
    expect(result).toBeInstanceOf(Error);
    expect(result.message).toBe("[object Object]");
  });
});

describe("filterSourceLanguages", () => {
  it("filters out target language from source languages", () => {
    const sources = ["en", "ja", "fr", "de"];
    expect(filterSourceLanguages(sources, "ja")).toEqual(["en", "fr", "de"]);
  });

  it("returns all languages if target is not in sources", () => {
    const sources = ["en", "ja", "fr"];
    expect(filterSourceLanguages(sources, "de")).toEqual(["en", "ja", "fr"]);
  });

  it("returns empty array when sources is empty", () => {
    expect(filterSourceLanguages([], "en")).toEqual([]);
  });

  it("returns empty array when only source equals target", () => {
    expect(filterSourceLanguages(["en"], "en")).toEqual([]);
  });

  it("handles duplicate languages in sources", () => {
    const sources = ["en", "ja", "en", "ja"];
    expect(filterSourceLanguages(sources, "ja")).toEqual(["en", "en"]);
  });

  it("is case-sensitive", () => {
    const sources = ["en", "EN", "En"];
    expect(filterSourceLanguages(sources, "en")).toEqual(["EN", "En"]);
  });
});

describe("createUnavailabilityError", () => {
  it("creates error with language pair in message", () => {
    const error = createUnavailabilityError("en", "ja");
    expect(error).toBeInstanceOf(Error);
    expect(error.message).toBe("Translation not available for en → ja");
  });

  it("includes both source and target in message", () => {
    const error = createUnavailabilityError("fr", "de");
    expect(error.message).toContain("fr");
    expect(error.message).toContain("de");
  });
});

describe("createUnsupportedError", () => {
  it("creates error with unsupported message", () => {
    const error = createUnsupportedError();
    expect(error).toBeInstanceOf(Error);
    expect(error.message).toBe("Translator API is not supported");
  });
});

describe("createNotAvailableError", () => {
  it("creates error with not available message", () => {
    const error = createNotAvailableError();
    expect(error).toBeInstanceOf(Error);
    expect(error.message).toBe(
      "Translator API is not available in this browser"
    );
  });
});
