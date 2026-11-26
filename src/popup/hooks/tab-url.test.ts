import { describe, expect, it } from "vitest";
import { getValidOrigin, isInternalBrowserUrl } from "./tab-url";

// Chrome gives some internal URLs, such as chrome-extension://, a real origin,
// while Node returns "null". Check the prefix rule directly so these tests do
// not pass only because of Node's URL behavior.
describe("isInternalBrowserUrl", () => {
  it.each([
    "chrome://settings",
    "CHROME://settings",
    "chrome-extension://abc123/popup.html",
    "edge://settings",
    "about:blank",
    "moz-extension://abc123",
    "file:///Users/test/file.html",
  ])("treats %s as internal", (url) => {
    expect(isInternalBrowserUrl(url)).toBe(true);
  });

  it.each(["https://example.com/chrome/page", "https://chrome-news.com"])(
    "treats %s as a web page",
    (url) => {
      expect(isInternalBrowserUrl(url)).toBe(false);
    }
  );
});

describe("getValidOrigin", () => {
  it.each([
    ["https://www.example.com/path?q=1#top", "https://www.example.com"],
    ["http://localhost:3000/app", "http://localhost:3000"],
  ])("returns the origin of %s", (url, expected) => {
    expect(getValidOrigin(url)).toBe(expected);
  });

  it.each(["chrome://settings", "not-a-url", ""])("rejects %j", (url) => {
    expect(getValidOrigin(url)).toBeNull();
  });
});
