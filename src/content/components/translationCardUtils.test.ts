import { describe, expect, it } from "vitest";
import {
  calculateMaxPopupWidth,
  calculatePopupWidth,
  MIN_POPUP_WIDTH,
  POPUP_EDGE_MARGIN,
} from "./translationCardUtils";

describe("translationCard pure functions", () => {
  describe("calculatePopupWidth", () => {
    const maxWidth = 800;

    it("returns selection width when within bounds", () => {
      expect(calculatePopupWidth(400, maxWidth)).toBe(400);
      expect(calculatePopupWidth(500, maxWidth)).toBe(500);
    });

    it("returns MIN_POPUP_WIDTH when selection is narrower", () => {
      expect(calculatePopupWidth(100, maxWidth)).toBe(MIN_POPUP_WIDTH);
      expect(calculatePopupWidth(200, maxWidth)).toBe(MIN_POPUP_WIDTH);
      expect(calculatePopupWidth(0, maxWidth)).toBe(MIN_POPUP_WIDTH);
    });

    it("returns maxWidth when selection is wider", () => {
      expect(calculatePopupWidth(1000, maxWidth)).toBe(maxWidth);
      expect(calculatePopupWidth(900, maxWidth)).toBe(maxWidth);
    });

    it("returns MIN_POPUP_WIDTH exactly at boundary", () => {
      expect(calculatePopupWidth(MIN_POPUP_WIDTH, maxWidth)).toBe(
        MIN_POPUP_WIDTH
      );
    });

    it("returns maxWidth exactly at boundary", () => {
      expect(calculatePopupWidth(maxWidth, maxWidth)).toBe(maxWidth);
    });

    it("handles edge case where maxWidth is less than MIN_POPUP_WIDTH", () => {
      // When viewport is very narrow, maxWidth could be less than MIN_POPUP_WIDTH
      const narrowMax = 200;
      // Math.min(Math.max(100, 280), 200) = Math.min(280, 200) = 200
      expect(calculatePopupWidth(100, narrowMax)).toBe(narrowMax);
    });
  });

  describe("calculateMaxPopupWidth", () => {
    it("subtracts POPUP_EDGE_MARGIN from viewport width", () => {
      expect(calculateMaxPopupWidth(1920)).toBe(1920 - POPUP_EDGE_MARGIN);
      expect(calculateMaxPopupWidth(1024)).toBe(1024 - POPUP_EDGE_MARGIN);
      expect(calculateMaxPopupWidth(375)).toBe(375 - POPUP_EDGE_MARGIN);
    });

    it("returns correct margin value", () => {
      // Ensure the margin is 32px (16px on each side)
      expect(POPUP_EDGE_MARGIN).toBe(32);
    });
  });
});
