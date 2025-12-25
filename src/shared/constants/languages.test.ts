import { describe, expect, it } from "vitest";
import {
  getLanguageByCode,
  getLanguageDisplayName,
  SUPPORTED_LANGUAGES,
} from "./languages";

describe("getLanguageByCode", () => {
  it("returns language object for valid code", () => {
    const en = getLanguageByCode("en");
    expect(en).toEqual({
      code: "en",
      name: "English",
      nativeName: "English",
    });

    const ja = getLanguageByCode("ja");
    expect(ja).toEqual({
      code: "ja",
      name: "Japanese",
      nativeName: "日本語",
    });
  });

  it("returns undefined for invalid code", () => {
    expect(getLanguageByCode("invalid")).toBeUndefined();
    expect(getLanguageByCode("")).toBeUndefined();
  });

  it("finds all supported languages", () => {
    for (const lang of SUPPORTED_LANGUAGES) {
      expect(getLanguageByCode(lang.code)).toEqual(lang);
    }
  });
});

describe("getLanguageDisplayName", () => {
  it("returns formatted display name for valid code", () => {
    expect(getLanguageDisplayName("en")).toBe("English (English)");
    expect(getLanguageDisplayName("ja")).toBe("日本語 (Japanese)");
    expect(getLanguageDisplayName("zh")).toBe("中文 (Chinese)");
  });

  it("returns code as-is for invalid code", () => {
    expect(getLanguageDisplayName("invalid")).toBe("invalid");
    expect(getLanguageDisplayName("xyz")).toBe("xyz");
  });
});

describe("SUPPORTED_LANGUAGES", () => {
  it("contains expected languages", () => {
    const codes = SUPPORTED_LANGUAGES.map((l) => l.code);
    expect(codes).toContain("en");
    expect(codes).toContain("ja");
    expect(codes).toContain("zh");
    expect(codes).toContain("ko");
    expect(codes).toContain("es");
    expect(codes).toContain("fr");
    expect(codes).toContain("de");
  });

  it("has unique codes", () => {
    const codes = SUPPORTED_LANGUAGES.map((l) => l.code);
    const uniqueCodes = new Set(codes);
    expect(uniqueCodes.size).toBe(codes.length);
  });

  it("all languages have required fields", () => {
    for (const lang of SUPPORTED_LANGUAGES) {
      expect(lang.code).toBeTruthy();
      expect(lang.name).toBeTruthy();
      expect(lang.nativeName).toBeTruthy();
    }
  });
});
