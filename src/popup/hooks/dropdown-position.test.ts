import { describe, expect, it } from "vitest";
import { calculateDropdownPosition } from "./dropdown-position";

describe("calculateDropdownPosition", () => {
  it("returns left when dropdown fits within viewport", () => {
    const buttonRect = { left: 100 };
    const viewportWidth = 400;
    expect(calculateDropdownPosition(buttonRect, viewportWidth)).toBe("left");
  });

  it("returns right when dropdown would overflow right edge", () => {
    const buttonRect = { left: 300 };
    const viewportWidth = 400;
    // 300 + 128 = 428 > 400 - 16 = 384
    expect(calculateDropdownPosition(buttonRect, viewportWidth)).toBe("right");
  });

  it("returns left when dropdown exactly fits", () => {
    // buttonRect.left + 128 = viewportWidth - 16
    // left + 128 = 400 - 16 = 384
    // left = 256
    const buttonRect = { left: 256 };
    const viewportWidth = 400;
    expect(calculateDropdownPosition(buttonRect, viewportWidth)).toBe("left");
  });

  it("returns right when dropdown exceeds by 1 pixel", () => {
    const buttonRect = { left: 257 };
    const viewportWidth = 400;
    // 257 + 128 = 385 > 384
    expect(calculateDropdownPosition(buttonRect, viewportWidth)).toBe("right");
  });

  it("handles button at left edge of viewport", () => {
    const buttonRect = { left: 0 };
    const viewportWidth = 400;
    expect(calculateDropdownPosition(buttonRect, viewportWidth)).toBe("left");
  });

  it("handles narrow viewport", () => {
    const buttonRect = { left: 50 };
    const viewportWidth = 150;
    // 50 + 128 = 178 > 150 - 16 = 134
    expect(calculateDropdownPosition(buttonRect, viewportWidth)).toBe("right");
  });

  it("handles typical popup width (400px)", () => {
    // Typical Chrome extension popup is around 400px
    const viewportWidth = 400;

    // Button near start - should fit left
    expect(calculateDropdownPosition({ left: 50 }, viewportWidth)).toBe("left");

    // Button in middle - should fit left
    expect(calculateDropdownPosition({ left: 200 }, viewportWidth)).toBe(
      "left"
    );

    // Button near end - should align right
    expect(calculateDropdownPosition({ left: 300 }, viewportWidth)).toBe(
      "right"
    );
  });
});
