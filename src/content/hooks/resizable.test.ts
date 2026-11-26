import { describe, expect, it } from "vitest";
import {
  calculateBottomResize,
  calculateLeftResize,
  calculateRightResize,
} from "./resizable";

const WIDTH_CONSTRAINTS = { minWidth: 280, maxWidth: 600, edgeMargin: 8 };
const HEIGHT_CONSTRAINTS = { minHeight: 120, maxHeight: 600, edgeMargin: 8 };

describe("calculateLeftResize", () => {
  it.each([
    ["grows when dragged left", -50, 100, 15, 370, -35],
    ["shrinks when dragged right", 30, 100, 0, 290, 30],
    ["keeps the minimum width", 200, 100, 0, 280, 40],
    ["keeps the maximum width", -500, 500, 0, 600, -280],
    ["stops at the left edge margin", -200, 50, 0, 362, -42],
  ])(
    "%s and keeps the right edge fixed",
    (_case, deltaX, cardLeft, startOffsetX, newWidth, newOffsetX) => {
      expect(
        calculateLeftResize({
          deltaX,
          startWidth: 320,
          startOffsetX,
          cardLeft,
          constraints: WIDTH_CONSTRAINTS,
        })
      ).toEqual({ newWidth, newOffsetX });
    }
  );
});

describe("calculateRightResize", () => {
  it.each([
    ["grows when dragged right", 50, 500, 370],
    ["keeps the minimum width", -200, 500, 280],
    ["keeps the maximum width", 500, 500, 600],
    ["stops at the right edge margin", 200, 950, 386],
  ])("%s", (_case, deltaX, cardRight, newWidth) => {
    expect(
      calculateRightResize({
        deltaX,
        startWidth: 320,
        cardRight,
        viewportWidth: 1024,
        constraints: WIDTH_CONSTRAINTS,
      })
    ).toEqual({ newWidth });
  });
});

describe("calculateBottomResize", () => {
  it.each([
    ["grows when dragged down", 50, 400, 230],
    ["keeps the minimum height", -200, 400, 120],
    ["keeps the maximum height", 500, 100, 600],
    ["stops at the bottom edge margin", 200, 700, 240],
  ])("%s", (_case, deltaY, cardBottom, newHeight) => {
    expect(
      calculateBottomResize({
        deltaY,
        startHeight: 180,
        cardBottom,
        viewportHeight: 768,
        constraints: HEIGHT_CONSTRAINTS,
      })
    ).toEqual({ newHeight });
  });
});
