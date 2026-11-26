import { describe, expect, it } from "vitest";
import {
  computeEffectiveSourceLanguage,
  normalizeDetectedLanguage,
  selectBestLanguage,
  shouldSkipDetection,
} from "./language-detector-utils";

describe("selectBestLanguage", () => {
  it("returns the result with the highest confidence", () => {
    expect(
      selectBestLanguage([
        { detectedLanguage: "en" },
        { detectedLanguage: "ja", confidence: 0.9 },
        { detectedLanguage: "zh", confidence: 0.5 },
      ])
    ).toEqual({ detectedLanguage: "ja", confidence: 0.9 });
  });

  it("returns no language when the detector returns nothing usable", () => {
    expect(selectBestLanguage([])).toEqual({
      detectedLanguage: null,
      confidence: 0,
    });
    expect(selectBestLanguage([{ confidence: 0.5 }])).toEqual({
      detectedLanguage: null,
      confidence: 0.5,
    });
  });
});

describe("normalizeDetectedLanguage", () => {
  it("maps a regional code to a supported language", () => {
    expect(normalizeDetectedLanguage("en-US")).toBe("en");
  });

  it("returns null for an unsupported language", () => {
    expect(normalizeDetectedLanguage("sw")).toBeNull();
  });
});

describe("computeEffectiveSourceLanguage", () => {
  it.each([
    ["a user override", "ja", 0.9, "ko", "ko"],
    ["a confident detection", "ja", 0.9, null, "ja"],
    ["a detection at the threshold", "ja", 0.5, null, "ja"],
    ["the fallback for a low-confidence detection", "ja", 0.4, null, "en"],
    ["the fallback without a detection", null, 0.9, null, "en"],
  ])("uses %s", (_case, detected, confidence, overridden, expected) => {
    expect(
      computeEffectiveSourceLanguage(detected, confidence, overridden, "en")
    ).toBe(expected);
  });
});

describe("shouldSkipDetection", () => {
  it("skips detection when it is disabled", () => {
    expect(shouldSkipDetection("hello world", false)).toBe(true);
  });

  it.each([
    ["abcd", true],
    ["  abcd  ", true],
    ["abcde", false],
    ["翻", false],
    ["안", false],
    ["국민성장펀드", false],
    ["نعم", false],
    ["כן", false],
    ["हाँ", false],
    ["ใช่", false],
    ["Hi 世界", false],
  ])("skips %j: %s", (text, expected) => {
    expect(shouldSkipDetection(text, true)).toBe(expected);
  });
});
