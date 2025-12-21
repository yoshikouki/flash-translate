import { describe, it, expect } from "vitest";
import {
  clampWidth,
  calculateMaxLeftExpansion,
  calculateMaxRightExpansion,
  calculateLeftResize,
  calculateRightResize,
  type ResizeConstraints,
} from "./resizable";

const defaultConstraints: ResizeConstraints = {
  minWidth: 280,
  maxWidth: 600,
  edgeMargin: 8,
};

describe("clampWidth", () => {
  it("returns width when within bounds", () => {
    expect(clampWidth(400, 280, 600)).toBe(400);
  });

  it("returns minWidth when width is below minimum", () => {
    expect(clampWidth(200, 280, 600)).toBe(280);
  });

  it("returns maxWidth when width is above maximum", () => {
    expect(clampWidth(700, 280, 600)).toBe(600);
  });

  it("handles edge case where width equals minWidth", () => {
    expect(clampWidth(280, 280, 600)).toBe(280);
  });

  it("handles edge case where width equals maxWidth", () => {
    expect(clampWidth(600, 280, 600)).toBe(600);
  });

  it("handles negative width", () => {
    expect(clampWidth(-100, 280, 600)).toBe(280);
  });
});

describe("calculateMaxLeftExpansion", () => {
  it("calculates available space to left edge", () => {
    expect(calculateMaxLeftExpansion(100, 8)).toBe(92);
  });

  it("returns zero when popup is at edge margin", () => {
    expect(calculateMaxLeftExpansion(8, 8)).toBe(0);
  });

  it("returns negative when popup is past edge margin", () => {
    expect(calculateMaxLeftExpansion(4, 8)).toBe(-4);
  });

  it("handles zero margin", () => {
    expect(calculateMaxLeftExpansion(50, 0)).toBe(50);
  });
});

describe("calculateMaxRightExpansion", () => {
  it("calculates available space to right edge", () => {
    // viewportWidth=1024, popupRight=800, margin=8 => 1024 - 8 - 800 = 216
    expect(calculateMaxRightExpansion(800, 1024, 8)).toBe(216);
  });

  it("returns zero when popup is at edge margin", () => {
    // viewportWidth=1024, popupRight=1016, margin=8 => 1024 - 8 - 1016 = 0
    expect(calculateMaxRightExpansion(1016, 1024, 8)).toBe(0);
  });

  it("returns negative when popup is past edge margin", () => {
    expect(calculateMaxRightExpansion(1020, 1024, 8)).toBe(-4);
  });

  it("handles zero margin", () => {
    expect(calculateMaxRightExpansion(800, 1024, 0)).toBe(224);
  });
});

describe("calculateLeftResize", () => {
  it("increases width when dragging left (negative deltaX)", () => {
    const result = calculateLeftResize({
      deltaX: -50,
      startWidth: 320,
      startOffsetX: 0,
      popupLeft: 100,
      constraints: defaultConstraints,
    });

    expect(result.newWidth).toBe(370);
    expect(result.newOffsetX).toBe(-50);
  });

  it("decreases width when dragging right (positive deltaX)", () => {
    const result = calculateLeftResize({
      deltaX: 30,
      startWidth: 350,
      startOffsetX: 0,
      popupLeft: 100,
      constraints: defaultConstraints,
    });

    expect(result.newWidth).toBe(320);
    expect(result.newOffsetX).toBe(30);
  });

  it("clamps width to minWidth when shrinking too much", () => {
    const result = calculateLeftResize({
      deltaX: 200,
      startWidth: 320,
      startOffsetX: 0,
      popupLeft: 100,
      constraints: defaultConstraints,
    });

    expect(result.newWidth).toBe(280);
    expect(result.newOffsetX).toBe(40);
  });

  it("clamps width to maxWidth when expanding too much", () => {
    const result = calculateLeftResize({
      deltaX: -500,
      startWidth: 320,
      startOffsetX: 0,
      popupLeft: 500,
      constraints: defaultConstraints,
    });

    expect(result.newWidth).toBe(600);
    expect(result.newOffsetX).toBe(-280);
  });

  it("clamps expansion to edge margin", () => {
    const result = calculateLeftResize({
      deltaX: -200,
      startWidth: 320,
      startOffsetX: 0,
      popupLeft: 50, // Only 42px available (50 - 8)
      constraints: defaultConstraints,
    });

    // Can only expand by 42px
    expect(result.newWidth).toBe(362);
    expect(result.newOffsetX).toBe(-42);
  });

  it("prevents popup from going past left edge margin", () => {
    const result = calculateLeftResize({
      deltaX: -100,
      startWidth: 320,
      startOffsetX: 0,
      popupLeft: 20, // Only 12px available
      constraints: defaultConstraints,
    });

    expect(result.newWidth).toBe(332);
    expect(result.newOffsetX).toBe(-12);
  });

  it("handles popup already at left edge", () => {
    const result = calculateLeftResize({
      deltaX: -50,
      startWidth: 320,
      startOffsetX: 0,
      popupLeft: 8, // Already at edge margin
      constraints: defaultConstraints,
    });

    // No expansion possible
    expect(result.newWidth).toBe(320);
    expect(result.newOffsetX).toBe(0);
  });

  it("handles zero deltaX", () => {
    const result = calculateLeftResize({
      deltaX: 0,
      startWidth: 320,
      startOffsetX: 10,
      popupLeft: 100,
      constraints: defaultConstraints,
    });

    expect(result.newWidth).toBe(320);
    expect(result.newOffsetX).toBe(10);
  });

  it("preserves startOffsetX in calculations", () => {
    const result = calculateLeftResize({
      deltaX: -20,
      startWidth: 320,
      startOffsetX: 15,
      popupLeft: 100,
      constraints: defaultConstraints,
    });

    expect(result.newWidth).toBe(340);
    expect(result.newOffsetX).toBe(-5); // 15 - 20 = -5
  });
});

describe("calculateRightResize", () => {
  const viewportWidth = 1024;

  it("increases width when dragging right (positive deltaX)", () => {
    const result = calculateRightResize({
      deltaX: 50,
      startWidth: 320,
      popupRight: 500,
      viewportWidth,
      constraints: defaultConstraints,
    });

    expect(result.newWidth).toBe(370);
  });

  it("decreases width when dragging left (negative deltaX)", () => {
    const result = calculateRightResize({
      deltaX: -30,
      startWidth: 350,
      popupRight: 500,
      viewportWidth,
      constraints: defaultConstraints,
    });

    expect(result.newWidth).toBe(320);
  });

  it("clamps width to minWidth", () => {
    const result = calculateRightResize({
      deltaX: -200,
      startWidth: 320,
      popupRight: 500,
      viewportWidth,
      constraints: defaultConstraints,
    });

    expect(result.newWidth).toBe(280);
  });

  it("clamps width to maxWidth", () => {
    const result = calculateRightResize({
      deltaX: 500,
      startWidth: 320,
      popupRight: 500,
      viewportWidth,
      constraints: defaultConstraints,
    });

    expect(result.newWidth).toBe(600);
  });

  it("clamps expansion to viewport edge", () => {
    const result = calculateRightResize({
      deltaX: 200,
      startWidth: 320,
      popupRight: 950, // Only 66px available (1024 - 8 - 950)
      viewportWidth,
      constraints: defaultConstraints,
    });

    expect(result.newWidth).toBe(386); // 320 + 66
  });

  it("prevents popup from going past right edge margin", () => {
    const result = calculateRightResize({
      deltaX: 100,
      startWidth: 320,
      popupRight: 1000, // Only 16px available
      viewportWidth,
      constraints: defaultConstraints,
    });

    expect(result.newWidth).toBe(336); // 320 + 16
  });

  it("handles popup already at right edge", () => {
    const result = calculateRightResize({
      deltaX: 50,
      startWidth: 320,
      popupRight: 1016, // Already at edge margin
      viewportWidth,
      constraints: defaultConstraints,
    });

    // No expansion possible
    expect(result.newWidth).toBe(320);
  });

  it("handles zero deltaX", () => {
    const result = calculateRightResize({
      deltaX: 0,
      startWidth: 320,
      popupRight: 500,
      viewportWidth,
      constraints: defaultConstraints,
    });

    expect(result.newWidth).toBe(320);
  });

  it("handles narrow viewport", () => {
    const result = calculateRightResize({
      deltaX: 50,
      startWidth: 300,
      popupRight: 350,
      viewportWidth: 400, // Narrow viewport
      constraints: { ...defaultConstraints, minWidth: 200 },
    });

    // Max available: 400 - 8 - 350 = 42
    expect(result.newWidth).toBe(342);
  });
});
