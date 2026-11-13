import { afterEach, describe, expect, it, vi } from "vitest";
import { checkTranslationAvailability } from "./translator";

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("checkTranslationAvailability", () => {
  it("resolves to unsupported when the browser has no Translator API", async () => {
    vi.stubGlobal("Translator", undefined);

    await expect(checkTranslationAvailability("en", "ja")).resolves.toBe(
      "unsupported"
    );
  });

  it.each([
    ["available", "available"],
    ["downloadable", "after-download"],
    ["downloading", "after-download"],
    ["unavailable", "unavailable"],
  ])(
    "resolves %s to %s for the requested language pair",
    async (status, expected) => {
      const availability = vi.fn().mockResolvedValue(status);
      vi.stubGlobal("Translator", { availability });

      await expect(checkTranslationAvailability("en", "ja")).resolves.toBe(
        expected
      );
      expect(availability).toHaveBeenCalledExactlyOnceWith({
        sourceLanguage: "en",
        targetLanguage: "ja",
      });
    }
  );

  it("resolves to unsupported when the browser rejects the availability check", async () => {
    vi.spyOn(console, "error").mockImplementation(() => undefined);
    vi.stubGlobal("Translator", {
      availability: vi.fn().mockRejectedValue(new Error("API unavailable")),
    });

    await expect(checkTranslationAvailability("en", "ja")).resolves.toBe(
      "unsupported"
    );
  });
});
