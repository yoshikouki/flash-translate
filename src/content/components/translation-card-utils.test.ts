import { describe, expect, it } from "vitest";
import { calculateCardWidth, MIN_CARD_WIDTH } from "./translation-card-utils";

describe("calculateCardWidth", () => {
  it.each([
    ["follows the selection width", 400, 800, 400],
    ["keeps the minimum width", 100, 800, MIN_CARD_WIDTH],
    ["stays within the viewport", 1000, 800, 800],
    ["prefers the viewport limit in a narrow viewport", 100, 200, 200],
  ])("%s", (_case, selectionWidth, maxWidth, expected) => {
    expect(calculateCardWidth(selectionWidth, maxWidth)).toBe(expected);
  });
});
