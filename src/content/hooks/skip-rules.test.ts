import { describe, expect, it } from "vitest";
import type { SkipContext, SkipReason } from "./skip-rules";
import { evaluateSkipRules } from "./skip-rules";

const BASE_CONTEXT: SkipContext = {
  targetLanguage: "ja",
  skipSameLanguage: true,
  autoDetectEnabled: false,
  detectedLanguage: null,
  confidence: 0,
  pageLanguage: null,
  isDetecting: false,
};

const cases: [string, Partial<SkipContext>, SkipReason | null][] = [
  [
    "waits while auto-detection is running",
    { autoDetectEnabled: true, isDetecting: true },
    "detecting-in-progress",
  ],
  [
    "waits for detection before comparing the detected language",
    {
      autoDetectEnabled: true,
      isDetecting: true,
      detectedLanguage: "ja",
      confidence: 0.9,
    },
    "detecting-in-progress",
  ],
  [
    "ignores a running detection when auto-detection is off",
    { isDetecting: true, pageLanguage: "en" },
    null,
  ],
  [
    "skips a confidently detected target language",
    { autoDetectEnabled: true, detectedLanguage: "ja-JP", confidence: 0.8 },
    "same-as-detected-language",
  ],
  [
    "translates a low-confidence detection",
    { autoDetectEnabled: true, detectedLanguage: "ja", confidence: 0.3 },
    null,
  ],
  [
    "uses the detection instead of the page language when auto-detection is on",
    { autoDetectEnabled: true, pageLanguage: "ja" },
    null,
  ],
  [
    "skips a page in the target language when auto-detection is off",
    { pageLanguage: "ja-JP" },
    "same-as-page-language",
  ],
  [
    "uses the page language instead of the detection when auto-detection is off",
    { detectedLanguage: "ja", confidence: 0.9, pageLanguage: "en" },
    null,
  ],
  [
    "translates the same language when skipping is off",
    { skipSameLanguage: false, pageLanguage: "ja" },
    null,
  ],
];

describe("evaluateSkipRules", () => {
  it.each(cases)("%s", (_case, overrides, reason) => {
    expect(evaluateSkipRules({ ...BASE_CONTEXT, ...overrides })).toEqual({
      shouldSkip: reason !== null,
      reason,
    });
  });
});
