import { describe, it, expect } from "vitest";
import {
  getValidSelectionText,
  isValidRect,
  shouldShowPopupForSelection,
  MAX_SELECTION_LENGTH,
} from "./textSelection";

describe("getValidSelectionText", () => {
  it("returns null for null or undefined", () => {
    expect(getValidSelectionText(null)).toBeNull();
    expect(getValidSelectionText(undefined)).toBeNull();
  });

  it("returns null for empty string", () => {
    expect(getValidSelectionText("")).toBeNull();
  });

  it("returns null for whitespace-only string", () => {
    expect(getValidSelectionText("   ")).toBeNull();
    expect(getValidSelectionText("\n\t")).toBeNull();
  });

  it("returns trimmed text for valid input", () => {
    expect(getValidSelectionText("hello")).toBe("hello");
    expect(getValidSelectionText("こんにちは")).toBe("こんにちは");
  });

  it("trims whitespace from valid text", () => {
    expect(getValidSelectionText("  trimmed  ")).toBe("trimmed");
    expect(getValidSelectionText("\n hello \t")).toBe("hello");
  });

  it("returns null for text exceeding max length", () => {
    const longText = "a".repeat(MAX_SELECTION_LENGTH);
    expect(getValidSelectionText(longText)).toBeNull();
  });

  it("returns text at max length - 1", () => {
    const maxText = "a".repeat(MAX_SELECTION_LENGTH - 1);
    expect(getValidSelectionText(maxText)).toBe(maxText);
  });
});

describe("isValidRect", () => {
  it("returns false for null or undefined", () => {
    expect(isValidRect(null)).toBe(false);
    expect(isValidRect(undefined)).toBe(false);
  });

  it("returns false for zero-width rect", () => {
    expect(isValidRect({ width: 0, height: 100 })).toBe(false);
  });

  it("returns false for zero-height rect", () => {
    expect(isValidRect({ width: 100, height: 0 })).toBe(false);
  });

  it("returns true for valid rect", () => {
    expect(isValidRect({ width: 100, height: 50 })).toBe(true);
  });

  it("returns true for rect with minimal dimensions", () => {
    expect(isValidRect({ width: 1, height: 1 })).toBe(true);
  });

  it("returns false for negative dimensions", () => {
    expect(isValidRect({ width: -10, height: 50 })).toBe(false);
    expect(isValidRect({ width: 10, height: -50 })).toBe(false);
  });
});

describe("shouldShowPopupForSelection", () => {
  it("returns true when lastText is null", () => {
    expect(shouldShowPopupForSelection("hello", null)).toBe(true);
  });

  it("returns true when text is different from lastText", () => {
    expect(shouldShowPopupForSelection("hello", "world")).toBe(true);
    expect(shouldShowPopupForSelection("new text", "old text")).toBe(true);
  });

  it("returns false when text is same as lastText", () => {
    expect(shouldShowPopupForSelection("hello", "hello")).toBe(false);
    expect(shouldShowPopupForSelection("same", "same")).toBe(false);
  });

  it("is case-sensitive", () => {
    expect(shouldShowPopupForSelection("Hello", "hello")).toBe(true);
  });
});
