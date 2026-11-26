import { describe, expect, it } from "vitest";
import type { RectLike } from "./card-position";
import { calculateCardPosition } from "./card-position";

const VIEWPORT = { width: 1024, height: 768 };
const OPTIONS = { cardWidth: 320, cardHeight: 150, margin: 8 };

function selectionRect(
  left: number,
  top: number,
  width: number,
  height: number
): RectLike {
  return {
    left,
    top,
    width,
    height,
    right: left + width,
    bottom: top + height,
  };
}

describe("calculateCardPosition", () => {
  it.each([
    ["centers on the selection", selectionRect(400, 100, 100, 20), 290],
    ["clamps to the left margin", selectionRect(0, 100, 50, 20), 8],
    ["clamps to the right margin", selectionRect(950, 100, 74, 20), 696],
  ])("%s horizontally", (_case, rect, expectedX) => {
    expect(calculateCardPosition(rect, OPTIONS, VIEWPORT).x).toBe(expectedX);
  });

  it("places the card below the selection when it fits", () => {
    expect(
      calculateCardPosition(selectionRect(400, 100, 100, 20), OPTIONS, VIEWPORT)
        .y
    ).toBe(128);
  });

  it("places the card above the selection when it does not fit below", () => {
    expect(
      calculateCardPosition(
        selectionRect(400, 600, 100, 100),
        OPTIONS,
        VIEWPORT
      ).y
    ).toBe(442);
  });

  it("falls back to below the selection when it fits neither side", () => {
    expect(
      calculateCardPosition(selectionRect(400, 80, 100, 40), OPTIONS, {
        width: 1024,
        height: 200,
      }).y
    ).toBe(128);
  });
});
