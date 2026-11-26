import { describe, expect, it } from "vitest";
import { splitTextIntoParagraphs } from "./translator-utils";

describe("splitTextIntoParagraphs", () => {
  it.each([
    ["Hello world", ["Hello world"]],
    ["Para 1\n\nPara 2", ["Para 1", "Para 2"]],
    ["Para 1\r\n\r\nPara 2", ["Para 1", "Para 2"]],
    ["Para 1\n\n\n\nPara 2", ["Para 1", "Para 2"]],
    ["Line 1\nLine 2\n\nPara 2", ["Line 1\nLine 2", "Para 2"]],
  ])("splits %j into %j", (text, expected) => {
    expect(splitTextIntoParagraphs(text)).toEqual(expected);
  });
});
