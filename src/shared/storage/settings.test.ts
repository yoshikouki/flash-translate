import { describe, expect, it } from "vitest";
import type { ExclusionPattern } from "./settings";
import {
  enableExclusionPattern,
  isLanguageMatch,
  isUrlExcluded,
} from "./settings";

describe("enableExclusionPattern", () => {
  it("prepends a new enabled pattern", () => {
    const patterns: ExclusionPattern[] = [
      { id: "existing", pattern: "https://other.com", enabled: true },
    ];

    expect(
      enableExclusionPattern(patterns, "https://example.com", "new")
    ).toEqual([
      { id: "new", pattern: "https://example.com", enabled: true },
      ...patterns,
    ]);
  });

  it("enables an existing disabled pattern without adding a duplicate", () => {
    const patterns: ExclusionPattern[] = [
      { id: "existing", pattern: "https://example.com", enabled: false },
      { id: "other", pattern: "https://other.com", enabled: true },
    ];

    expect(
      enableExclusionPattern(patterns, "https://example.com", "unused")
    ).toEqual([
      { id: "existing", pattern: "https://example.com", enabled: true },
      patterns[1],
    ]);
  });

  it("returns the original patterns when the site is already excluded", () => {
    const patterns: ExclusionPattern[] = [
      { id: "existing", pattern: "https://example.com", enabled: true },
    ];

    expect(
      enableExclusionPattern(patterns, "https://example.com", "unused")
    ).toBe(patterns);
  });
});

describe("isLanguageMatch", () => {
  it.each([
    ["ja", "ja", true],
    ["ja-JP", "ja", true],
    ["ja_JP", "ja", true],
    ["EN-us", "en-GB", true],
    ["zh-CN", "ja", false],
    [null, "ja", false],
  ])("compares %j with %j: %s", (pageLanguage, targetLanguage, expected) => {
    expect(isLanguageMatch(pageLanguage, targetLanguage)).toBe(expected);
  });
});

describe("isUrlExcluded", () => {
  const patterns: ExclusionPattern[] = [
    { id: "1", pattern: "https://example.com/admin", enabled: true },
    { id: "2", pattern: "https://disabled.com", enabled: false },
    { id: "3", pattern: "https://blocked.com", enabled: true },
  ];

  it.each([
    ["https://example.com/admin", true],
    ["https://example.com/admin/users", true],
    ["https://example.com/admin?page=1", true],
    ["https://blocked.com?query=test", true],
    ["https://example.com/admin2", false],
    ["https://example.com/other", false],
    ["https://blocked.com.evil.com/page", false],
    ["https://disabled.com/page", false],
  ])("checks %s: %s", (url, expected) => {
    expect(isUrlExcluded(url, patterns)).toBe(expected);
  });
});
