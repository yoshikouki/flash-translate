/**
 * @vitest-environment jsdom
 */
import { describe, expect, it } from "vitest";
import {
  cloneSelectionRanges,
  getSelectionRect,
  getValidSelectionText,
  isNodeInContentEditable,
} from "./text-selection";

describe("getValidSelectionText", () => {
  it("returns trimmed text", () => {
    expect(getValidSelectionText("\n hello \t")).toBe("hello");
  });

  it.each([null, undefined, "", " \n\t "])("rejects %j", (text) => {
    expect(getValidSelectionText(text)).toBeNull();
  });
});

describe("getSelectionRect", () => {
  const fallback = new DOMRect(0, 0, 100, 100);

  function selectionWithRect(rect: DOMRect): Selection {
    return {
      getRangeAt: () => ({ getBoundingClientRect: () => rect }),
    } as unknown as Selection;
  }

  it("returns the bounding rect of the first range", () => {
    const rect = new DOMRect(10, 20, 30, 40);

    expect(getSelectionRect(selectionWithRect(rect), fallback)).toBe(rect);
  });

  it("rejects a collapsed rect", () => {
    expect(
      getSelectionRect(selectionWithRect(new DOMRect(10, 20, 0, 40)), fallback)
    ).toBeNull();
  });

  it("returns the fallback rect when the range cannot be read", () => {
    const selection = {
      getRangeAt: () => {
        throw new Error("No range");
      },
    } as unknown as Selection;

    expect(getSelectionRect(selection, fallback)).toBe(fallback);
  });
});

describe("cloneSelectionRanges", () => {
  it("clones every current selection range", () => {
    const textNode = document.createTextNode("hello world");
    document.body.append(textNode);
    const range = document.createRange();
    range.setStart(textNode, 0);
    range.setEnd(textNode, 5);
    const selection = window.getSelection();
    selection?.removeAllRanges();
    selection?.addRange(range);

    const ranges = cloneSelectionRanges(selection);

    expect(ranges).toHaveLength(1);
    expect(ranges[0]).not.toBe(range);
    expect(ranges[0]?.toString()).toBe("hello");

    selection?.removeAllRanges();
    document.body.replaceChildren();
  });
});

describe("isNodeInContentEditable", () => {
  it.each([
    ["<p>hello</p>", false],
    ['<div contenteditable="true"><p>hello</p></div>', true],
    ["<div contenteditable><p>hello</p></div>", true],
    [
      '<div contenteditable="true"><p contenteditable="false">hello</p></div>',
      false,
    ],
  ])("checks text inside %s: %s", (html, expected) => {
    const container = document.createElement("div");
    container.innerHTML = html;

    expect(
      isNodeInContentEditable(container.querySelector("p")?.firstChild ?? null)
    ).toBe(expected);
  });
});
