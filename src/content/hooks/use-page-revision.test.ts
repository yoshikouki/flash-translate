import { describe, expect, it } from "vitest";
import { getPageIdentity } from "./use-page-revision";

describe("getPageIdentity", () => {
  it("distinguishes pages with different query parameters", () => {
    const page = { origin: "https://example.com", pathname: "/search" };

    expect(getPageIdentity({ ...page, search: "?page=1" })).not.toBe(
      getPageIdentity({ ...page, search: "?page=2" })
    );
  });
});
