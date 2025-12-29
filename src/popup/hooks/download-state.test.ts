import { describe, expect, it } from "vitest";
import {
  clearError,
  createPairKey,
  finishDownloading,
  getDownloadStatus,
  initialDownloadState,
  startDownloading,
} from "./download-state";

describe("createPairKey", () => {
  it("creates key from source and target", () => {
    expect(createPairKey("en", "ja")).toBe("en-ja");
    expect(createPairKey("zh", "ko")).toBe("zh-ko");
  });

  it("preserves order of languages", () => {
    expect(createPairKey("en", "ja")).not.toBe(createPairKey("ja", "en"));
  });
});

describe("startDownloading", () => {
  it("adds pair to downloading set", () => {
    const result = startDownloading(initialDownloadState, "en-ja");
    expect(result.downloadingPairs.has("en-ja")).toBe(true);
  });

  it("preserves existing downloading pairs", () => {
    const state = {
      ...initialDownloadState,
      downloadingPairs: new Set(["zh-ja"]),
    };
    const result = startDownloading(state, "en-ja");
    expect(result.downloadingPairs.has("zh-ja")).toBe(true);
    expect(result.downloadingPairs.has("en-ja")).toBe(true);
  });

  it("clears any existing error for the pair", () => {
    const stateWithError = {
      ...initialDownloadState,
      downloadErrors: new Set(["en-ja"]),
    };
    const result = startDownloading(stateWithError, "en-ja");
    expect(result.downloadErrors.has("en-ja")).toBe(false);
  });

  it("preserves other errors", () => {
    const stateWithError = {
      ...initialDownloadState,
      downloadErrors: new Set(["en-ja", "zh-ja"]),
    };
    const result = startDownloading(stateWithError, "en-ja");
    expect(result.downloadErrors.has("zh-ja")).toBe(true);
  });
});

describe("finishDownloading", () => {
  it("removes pair from downloading set", () => {
    const downloading = {
      ...initialDownloadState,
      downloadingPairs: new Set(["en-ja"]),
    };
    const result = finishDownloading(downloading, "en-ja", false);
    expect(result.downloadingPairs.has("en-ja")).toBe(false);
  });

  it("preserves other downloading pairs", () => {
    const downloading = {
      ...initialDownloadState,
      downloadingPairs: new Set(["en-ja", "zh-ja"]),
    };
    const result = finishDownloading(downloading, "en-ja", false);
    expect(result.downloadingPairs.has("zh-ja")).toBe(true);
  });

  it("does not add error when hasError is false", () => {
    const downloading = {
      ...initialDownloadState,
      downloadingPairs: new Set(["en-ja"]),
    };
    const result = finishDownloading(downloading, "en-ja", false);
    expect(result.downloadErrors.has("en-ja")).toBe(false);
  });

  it("adds error when hasError is true", () => {
    const downloading = {
      ...initialDownloadState,
      downloadingPairs: new Set(["en-ja"]),
    };
    const result = finishDownloading(downloading, "en-ja", true);
    expect(result.downloadErrors.has("en-ja")).toBe(true);
  });
});

describe("clearError", () => {
  it("removes error for the pair", () => {
    const state = {
      ...initialDownloadState,
      downloadErrors: new Set(["en-ja"]),
    };
    const result = clearError(state, "en-ja");
    expect(result.downloadErrors.has("en-ja")).toBe(false);
  });

  it("preserves other errors", () => {
    const state = {
      ...initialDownloadState,
      downloadErrors: new Set(["en-ja", "zh-ja"]),
    };
    const result = clearError(state, "en-ja");
    expect(result.downloadErrors.has("zh-ja")).toBe(true);
  });

  it("preserves downloading pairs", () => {
    const state = {
      downloadingPairs: new Set(["zh-ja"]),
      downloadErrors: new Set(["en-ja"]),
    };
    const result = clearError(state, "en-ja");
    expect(result.downloadingPairs.has("zh-ja")).toBe(true);
  });
});

describe("getDownloadStatus", () => {
  it("returns error when pair has error", () => {
    const state = {
      ...initialDownloadState,
      downloadErrors: new Set(["en-ja"]),
    };
    expect(getDownloadStatus(state, "en-ja", "available")).toBe("error");
  });

  it("returns downloading when pair is downloading", () => {
    const state = {
      ...initialDownloadState,
      downloadingPairs: new Set(["en-ja"]),
    };
    expect(getDownloadStatus(state, "en-ja", "available")).toBe("downloading");
  });

  it("prioritizes error over downloading", () => {
    const state = {
      downloadingPairs: new Set(["en-ja"]),
      downloadErrors: new Set(["en-ja"]),
    };
    expect(getDownloadStatus(state, "en-ja", "available")).toBe("error");
  });

  it("returns base status when no special state", () => {
    expect(getDownloadStatus(initialDownloadState, "en-ja", "available")).toBe(
      "available"
    );
    expect(
      getDownloadStatus(initialDownloadState, "en-ja", "after-download")
    ).toBe("after-download");
    expect(
      getDownloadStatus(initialDownloadState, "en-ja", "unavailable")
    ).toBe("unavailable");
    expect(
      getDownloadStatus(initialDownloadState, "en-ja", "unsupported")
    ).toBe("unsupported");
  });

  it("returns unavailable when base status is undefined", () => {
    expect(getDownloadStatus(initialDownloadState, "en-ja", undefined)).toBe(
      "unavailable"
    );
  });
});
