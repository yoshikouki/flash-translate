import { describe, expect, it } from "vitest";
import {
  clearError,
  finishDownloading,
  getDownloadStatus,
  initialDownloadState,
  startDownloading,
} from "./download-state";

describe("download state", () => {
  it("shows a download in progress and then the base status", () => {
    const downloading = startDownloading(initialDownloadState, "en-ja");
    expect(getDownloadStatus(downloading, "en-ja", "after-download")).toBe(
      "downloading"
    );

    const finished = finishDownloading(downloading, "en-ja", false);
    expect(getDownloadStatus(finished, "en-ja", "available")).toBe("available");
  });

  it("shows a failed download until it is retried or cleared", () => {
    const failed = finishDownloading(
      startDownloading(initialDownloadState, "en-ja"),
      "en-ja",
      true
    );
    expect(getDownloadStatus(failed, "en-ja", "after-download")).toBe("error");

    expect(
      getDownloadStatus(
        startDownloading(failed, "en-ja"),
        "en-ja",
        "after-download"
      )
    ).toBe("downloading");
    expect(
      getDownloadStatus(clearError(failed, "en-ja"), "en-ja", "after-download")
    ).toBe("after-download");
  });

  it("tracks each language pair independently", () => {
    const state = finishDownloading(
      startDownloading(
        startDownloading(initialDownloadState, "en-ja"),
        "zh-ja"
      ),
      "en-ja",
      true
    );

    expect(getDownloadStatus(state, "en-ja", "after-download")).toBe("error");
    expect(getDownloadStatus(state, "zh-ja", "after-download")).toBe(
      "downloading"
    );
  });

  it("treats a pair without a known status as unavailable", () => {
    expect(getDownloadStatus(initialDownloadState, "en-ja", undefined)).toBe(
      "unavailable"
    );
  });
});
