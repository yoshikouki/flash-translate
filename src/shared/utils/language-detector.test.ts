import { afterEach, describe, expect, it, vi } from "vitest";
import { checkLanguageDetectionAvailability } from "./language-detector";

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("checkLanguageDetectionAvailability", () => {
  it("resolves to unsupported when the browser has no Language Detector API", async () => {
    vi.stubGlobal("LanguageDetector", undefined);

    await expect(checkLanguageDetectionAvailability()).resolves.toBe(
      "unsupported"
    );
  });

  it.each([
    ["available", "available"],
    ["downloadable", "after-download"],
    ["downloading", "after-download"],
    ["unavailable", "unavailable"],
  ])("resolves %s to %s", async (status, expected) => {
    const availability = vi.fn().mockResolvedValue(status);
    vi.stubGlobal("LanguageDetector", { availability });

    await expect(checkLanguageDetectionAvailability()).resolves.toBe(expected);
    expect(availability).toHaveBeenCalledExactlyOnceWith();
  });

  it("resolves to unsupported when the browser rejects the availability check", async () => {
    vi.spyOn(console, "error").mockImplementation(() => undefined);
    vi.stubGlobal("LanguageDetector", {
      availability: vi.fn().mockRejectedValue(new Error("API unavailable")),
    });

    await expect(checkLanguageDetectionAvailability()).resolves.toBe(
      "unsupported"
    );
  });
});
