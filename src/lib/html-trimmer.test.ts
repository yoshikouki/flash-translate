import { describe, expect, it } from "vitest";
import {
  findTextRange,
  getTextFromHtml,
  normalizeText,
  trimHtmlByRange,
  trimHtmlToMatchText,
} from "./html-trimmer";

describe("getTextFromHtml", () => {
  it("HTMLからテキストを抽出", () => {
    expect(getTextFromHtml("<p>Hello world</p>")).toBe("Hello world");
  });

  it("ネストされた要素からテキストを抽出", () => {
    expect(getTextFromHtml("<p>Hello <strong>bold</strong> text</p>")).toBe(
      "Hello bold text"
    );
  });

  it("複数の要素からテキストを抽出", () => {
    expect(getTextFromHtml("<p>Para 1</p><p>Para 2</p>")).toBe("Para 1Para 2");
  });

  it("空文字列を処理", () => {
    expect(getTextFromHtml("")).toBe("");
  });
});

describe("normalizeText", () => {
  it("前後の空白を削除", () => {
    expect(normalizeText("  hello  ")).toBe("hello");
  });

  it("連続する空白を単一スペースに", () => {
    expect(normalizeText("hello   world")).toBe("hello world");
  });

  it("改行を空白に変換", () => {
    expect(normalizeText("hello\n\nworld")).toBe("hello world");
  });

  it("タブを空白に変換", () => {
    expect(normalizeText("hello\t\tworld")).toBe("hello world");
  });

  it("空文字列を処理", () => {
    expect(normalizeText("")).toBe("");
  });
});

describe("findTextRange", () => {
  it("完全一致で全範囲を返す", () => {
    expect(findTextRange("Hello world", "Hello world")).toEqual({
      start: 0,
      end: 11,
    });
  });

  it("部分一致で正しい範囲を返す", () => {
    const result = findTextRange("Hello world extra", "Hello world");
    expect(result).not.toBeNull();
    expect(result?.start).toBe(0);
    // 元のテキストの "Hello world" 部分の終わり
  });

  it("見つからない場合はnullを返す", () => {
    expect(findTextRange("Hello world", "Goodbye")).toBeNull();
  });

  it("空白の正規化を考慮", () => {
    const result = findTextRange("Hello   world", "Hello world");
    expect(result).not.toBeNull();
  });

  it("空入力でnullを返す", () => {
    expect(findTextRange("", "text")).toBeNull();
    expect(findTextRange("text", "")).toBeNull();
  });
});

describe("trimHtmlByRange", () => {
  it("指定範囲のテキストのみを保持", () => {
    const html = "<p>Hello world extra</p>";
    const result = trimHtmlByRange(html, { start: 0, end: 11 });
    expect(getTextFromHtml(result)).toBe("Hello world");
  });

  it("先頭からトリミング", () => {
    const html = "<p>Extra Hello world</p>";
    const result = trimHtmlByRange(html, { start: 6, end: 17 });
    expect(getTextFromHtml(result)).toBe("Hello world");
  });

  it("空文字列を処理", () => {
    expect(trimHtmlByRange("", { start: 0, end: 10 })).toBe("");
  });
});

describe("trimHtmlToMatchText", () => {
  describe("完全一致", () => {
    it("テキストが一致する場合はそのまま返す", () => {
      const html = "<p>Hello world</p>";
      const text = "Hello world";
      expect(trimHtmlToMatchText(html, text)).toBe(html);
    });

    it("空白の違いは無視して一致とみなす", () => {
      const html = "<p>Hello   world</p>";
      const text = "Hello world";
      expect(trimHtmlToMatchText(html, text)).toBe(html);
    });
  });

  describe("末尾トリミング", () => {
    it("末尾の余分なコンテンツを削除", () => {
      const html = "<p>Selected text</p><h3>Extra heading</h3>";
      const text = "Selected text";
      const result = trimHtmlToMatchText(html, text);
      expect(getTextFromHtml(result)).toBe("Selected text");
      expect(result).not.toContain("<h3>");
    });

    it("同一要素内の末尾をトリミング", () => {
      const html = "<p>Keep this. Remove this.</p>";
      const text = "Keep this.";
      const result = trimHtmlToMatchText(html, text);
      expect(getTextFromHtml(result)).toBe("Keep this.");
    });
  });

  describe("先頭トリミング", () => {
    it("先頭の余分なコンテンツを削除", () => {
      const html = "<h3>Extra heading</h3><p>Selected text</p>";
      const text = "Selected text";
      const result = trimHtmlToMatchText(html, text);
      expect(getTextFromHtml(result)).toBe("Selected text");
      expect(result).not.toContain("<h3>");
    });
  });

  describe("構造の保持", () => {
    it("インライン要素を保持", () => {
      const html = "<p>This is <strong>bold</strong> text. Extra.</p>";
      const text = "This is bold text.";
      const result = trimHtmlToMatchText(html, text);
      expect(result).toContain("<strong>");
      expect(result).toContain("bold");
    });

    it("ネストされたリスト構造を保持", () => {
      const html = "<ul><li>Item 1</li><li>Item 2</li></ul><p>Extra</p>";
      const text = "Item 1Item 2";
      const result = trimHtmlToMatchText(html, text);
      expect(result).toContain("<li>");
      expect(result).not.toContain("Extra");
    });
  });

  describe("エッジケース", () => {
    it("テキストが見つからない場合はプレーンテキストを返す", () => {
      const html = "<p>Completely different</p>";
      const text = "Expected text";
      expect(trimHtmlToMatchText(html, text)).toBe(text);
    });

    it("空のHTMLはテキストを返す", () => {
      expect(trimHtmlToMatchText("", "text")).toBe("text");
    });

    it("空のテキストは空文字列を返す", () => {
      expect(trimHtmlToMatchText("<p>html</p>", "")).toBe("");
    });

    it("両方空の場合は空文字列を返す", () => {
      expect(trimHtmlToMatchText("", "")).toBe("");
    });
  });

  describe("実際のユースケース", () => {
    it("選択範囲の直後の見出しタグを除去", () => {
      const html =
        "<p>This package exports no identifiers. The default export is rehypeRemark.</p><h3>unified().use(rehypeRemark)</h3>";
      const text =
        "This package exports no identifiers. The default export is rehypeRemark.";
      const result = trimHtmlToMatchText(html, text);
      expect(getTextFromHtml(result)).toBe(text);
      expect(result).not.toContain("<h3>");
      expect(result).not.toContain("###");
    });
  });
});
