import { describe, expect, it } from "vitest";
import {
  getValidOrigin,
  isInternalBrowserUrl,
  parseUrlToOrigin,
} from "./tabUrl";

describe("parseUrlToOrigin", () => {
  it("extracts origin from https URL", () => {
    expect(parseUrlToOrigin("https://example.com")).toBe("https://example.com");
  });

  it("extracts origin from http URL", () => {
    expect(parseUrlToOrigin("http://example.com")).toBe("http://example.com");
  });

  it("extracts origin from URL with path", () => {
    expect(parseUrlToOrigin("https://example.com/path/to/page")).toBe(
      "https://example.com"
    );
  });

  it("extracts origin from URL with query params", () => {
    expect(parseUrlToOrigin("https://example.com?foo=bar&baz=qux")).toBe(
      "https://example.com"
    );
  });

  it("extracts origin from URL with port", () => {
    expect(parseUrlToOrigin("https://example.com:8080/path")).toBe(
      "https://example.com:8080"
    );
  });

  it("extracts origin from URL with hash", () => {
    expect(parseUrlToOrigin("https://example.com#section")).toBe(
      "https://example.com"
    );
  });

  it("returns null for empty string", () => {
    expect(parseUrlToOrigin("")).toBeNull();
  });

  it("returns null for invalid URL", () => {
    expect(parseUrlToOrigin("not-a-url")).toBeNull();
  });

  it("returns null for malformed URL", () => {
    expect(parseUrlToOrigin("://missing-protocol")).toBeNull();
  });
});

describe("isInternalBrowserUrl", () => {
  it("returns true for chrome:// URLs", () => {
    expect(isInternalBrowserUrl("chrome://settings")).toBe(true);
    expect(isInternalBrowserUrl("chrome://extensions")).toBe(true);
  });

  it("returns true for chrome-extension:// URLs", () => {
    expect(isInternalBrowserUrl("chrome-extension://abc123")).toBe(true);
  });

  it("returns true for edge:// URLs", () => {
    expect(isInternalBrowserUrl("edge://settings")).toBe(true);
  });

  it("returns true for about: URLs", () => {
    expect(isInternalBrowserUrl("about:blank")).toBe(true);
    expect(isInternalBrowserUrl("about:debugging")).toBe(true);
  });

  it("returns true for moz-extension:// URLs", () => {
    expect(isInternalBrowserUrl("moz-extension://abc123")).toBe(true);
  });

  it("returns true for file:// URLs", () => {
    expect(isInternalBrowserUrl("file:///path/to/file")).toBe(true);
  });

  it("returns false for https:// URLs", () => {
    expect(isInternalBrowserUrl("https://example.com")).toBe(false);
  });

  it("returns false for http:// URLs", () => {
    expect(isInternalBrowserUrl("http://example.com")).toBe(false);
  });

  it("returns false for URL containing chrome in path", () => {
    expect(isInternalBrowserUrl("https://example.com/chrome/page")).toBe(false);
  });

  it("returns false for domain starting with chrome-like name", () => {
    expect(isInternalBrowserUrl("https://chrome-news.com")).toBe(false);
  });

  it("returns false for empty string", () => {
    expect(isInternalBrowserUrl("")).toBe(false);
  });

  it("is case-insensitive", () => {
    expect(isInternalBrowserUrl("CHROME://settings")).toBe(true);
    expect(isInternalBrowserUrl("Chrome://Settings")).toBe(true);
  });
});

describe("getValidOrigin", () => {
  it("returns origin for valid external URL", () => {
    expect(getValidOrigin("https://example.com/path")).toBe(
      "https://example.com"
    );
  });

  it("returns null for chrome:// URL", () => {
    expect(getValidOrigin("chrome://settings")).toBeNull();
  });

  it("returns null for edge:// URL", () => {
    expect(getValidOrigin("edge://settings")).toBeNull();
  });

  it("returns null for chrome-extension:// URL", () => {
    expect(getValidOrigin("chrome-extension://abc123/popup.html")).toBeNull();
  });

  it("returns null for about: URL", () => {
    expect(getValidOrigin("about:blank")).toBeNull();
  });

  it("returns null for file:// URL", () => {
    expect(getValidOrigin("file:///Users/test/file.html")).toBeNull();
  });

  it("returns null for invalid URL", () => {
    expect(getValidOrigin("not-a-url")).toBeNull();
  });

  it("returns null for empty string", () => {
    expect(getValidOrigin("")).toBeNull();
  });

  it("returns origin for URL with subdomain", () => {
    expect(getValidOrigin("https://www.example.com/path")).toBe(
      "https://www.example.com"
    );
  });

  it("returns origin for localhost", () => {
    expect(getValidOrigin("http://localhost:3000/app")).toBe(
      "http://localhost:3000"
    );
  });
});
