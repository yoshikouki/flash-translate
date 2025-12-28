import { describe, expect, it } from "vitest";
import {
  DEFAULT_OPTIONS,
  htmlToMarkdown,
  htmlToMarkdownSync,
} from "./html-to-markdown";

describe("htmlToMarkdown", () => {
  describe("基本変換", () => {
    it("プレーンテキストをそのまま返す", async () => {
      expect(await htmlToMarkdown("Hello world")).toBe("Hello world");
    });

    it("空文字列は空文字列を返す", async () => {
      expect(await htmlToMarkdown("")).toBe("");
    });

    it("空白のみは空文字列を返す", async () => {
      expect(await htmlToMarkdown("   ")).toBe("");
    });
  });

  describe("インライン要素", () => {
    it("strongタグを**に変換", async () => {
      expect(await htmlToMarkdown("<strong>bold</strong>")).toBe("**bold**");
    });

    it("bタグを**に変換", async () => {
      expect(await htmlToMarkdown("<b>bold</b>")).toBe("**bold**");
    });

    it("emタグを*に変換", async () => {
      expect(await htmlToMarkdown("<em>italic</em>")).toBe("*italic*");
    });

    it("iタグを*に変換", async () => {
      expect(await htmlToMarkdown("<i>italic</i>")).toBe("*italic*");
    });

    it("codeタグを`に変換", async () => {
      expect(await htmlToMarkdown("<code>code</code>")).toBe("`code`");
    });

    it("aタグをテキストのみに変換（デフォルト）", async () => {
      expect(
        await htmlToMarkdown('<a href="https://example.com">link</a>')
      ).toBe("link");
    });

    it("a: true でaタグをMarkdownリンクに変換", async () => {
      const options = { handlers: { a: true as const } };
      expect(
        await htmlToMarkdown('<a href="https://example.com">link</a>', options)
      ).toBe("[link](https://example.com)");
    });
  });

  describe("ブロック要素", () => {
    it("pタグを段落として変換", async () => {
      expect(await htmlToMarkdown("<p>paragraph</p>")).toBe("paragraph");
    });

    it("h1を見出しに変換", async () => {
      expect(await htmlToMarkdown("<h1>Title</h1>")).toBe("# Title");
    });

    it("h2を見出しに変換", async () => {
      expect(await htmlToMarkdown("<h2>Subtitle</h2>")).toBe("## Subtitle");
    });

    it("h3を見出しに変換", async () => {
      expect(await htmlToMarkdown("<h3>Section</h3>")).toBe("### Section");
    });

    it("ulをリストに変換", async () => {
      const html = "<ul><li>item 1</li><li>item 2</li></ul>";
      const result = await htmlToMarkdown(html);
      expect(result).toContain("* item 1");
      expect(result).toContain("* item 2");
    });

    it("olを番号付きリストに変換", async () => {
      const html = "<ol><li>first</li><li>second</li></ol>";
      const result = await htmlToMarkdown(html);
      expect(result).toContain("1. first");
      expect(result).toContain("2. second");
    });

    it("blockquoteを引用に変換", async () => {
      expect(await htmlToMarkdown("<blockquote>quote</blockquote>")).toBe(
        "> quote"
      );
    });
  });

  describe("オプション設定", () => {
    it("a: false でリンクをテキストのみに", async () => {
      const html = '<a href="https://example.com">link</a>';
      const options = { handlers: { a: false as const } };
      expect(await htmlToMarkdown(html, options)).toBe("link");
    });

    it("strong: false で太字をテキストのみに", async () => {
      const html = "<strong>bold</strong>";
      const options = { handlers: { strong: false as const } };
      expect(await htmlToMarkdown(html, options)).toBe("bold");
    });

    it("em: false で斜体をテキストのみに", async () => {
      const html = "<em>italic</em>";
      const options = { handlers: { em: false as const } };
      expect(await htmlToMarkdown(html, options)).toBe("italic");
    });

    it("code: false でコードをテキストのみに", async () => {
      const html = "<code>code</code>";
      const options = { handlers: { code: false as const } };
      expect(await htmlToMarkdown(html, options)).toBe("code");
    });

    it("複数のオプションを組み合わせ可能", async () => {
      const html =
        '<p>This is <strong>bold</strong> and <a href="#">link</a>.</p>';
      const options = {
        handlers: { strong: false as const, a: false as const },
      };
      expect(await htmlToMarkdown(html, options)).toBe(
        "This is bold and link."
      );
    });
  });

  describe("複合パターン", () => {
    it("ネストされた要素を正しく変換", async () => {
      const html = "<p>This is <strong>bold</strong> and <em>italic</em>.</p>";
      expect(await htmlToMarkdown(html)).toBe("This is **bold** and *italic*.");
    });

    it("複数段落を保持", async () => {
      const html = "<p>Para 1</p><p>Para 2</p>";
      const result = await htmlToMarkdown(html);
      expect(result).toContain("Para 1");
      expect(result).toContain("Para 2");
    });

    it("リスト内のリンクをテキストのみに変換（デフォルト）", async () => {
      const html =
        '<ul><li><a href="https://a.com">Link A</a></li><li><a href="https://b.com">Link B</a></li></ul>';
      const result = await htmlToMarkdown(html);
      expect(result).toContain("* Link A");
      expect(result).toContain("* Link B");
      expect(result).not.toContain("https://");
    });

    it("a: true でリスト内のリンクをMarkdownに変換", async () => {
      const html =
        '<ul><li><a href="https://a.com">Link A</a></li><li><a href="https://b.com">Link B</a></li></ul>';
      const options = { handlers: { a: true as const } };
      const result = await htmlToMarkdown(html, options);
      expect(result).toContain("[Link A](https://a.com)");
      expect(result).toContain("[Link B](https://b.com)");
    });
  });

  describe("エッジケース", () => {
    it("scriptタグを無視", async () => {
      const html = '<p>text</p><script>alert("xss")</script>';
      const result = await htmlToMarkdown(html);
      expect(result).toBe("text");
    });

    it("styleタグを無視", async () => {
      const html = "<p>text</p><style>body{color:red}</style>";
      const result = await htmlToMarkdown(html);
      expect(result).toBe("text");
    });

    it("HTMLエンティティをデコード", async () => {
      const html = "<p>&lt;tag&gt; &amp; &quot;quote&quot;</p>";
      const result = await htmlToMarkdown(html);
      expect(result).toContain("<tag>");
      expect(result).toContain("&");
      expect(result).toContain('"quote"');
    });
  });
});

describe("htmlToMarkdownSync", () => {
  it("同期的に変換", () => {
    expect(htmlToMarkdownSync("<strong>bold</strong>")).toBe("**bold**");
  });

  it("空文字列を処理", () => {
    expect(htmlToMarkdownSync("")).toBe("");
  });

  it("オプションを適用", () => {
    const html = "<strong>bold</strong>";
    const options = { handlers: { strong: false as const } };
    expect(htmlToMarkdownSync(html, options)).toBe("bold");
  });
});

describe("DEFAULT_OPTIONS", () => {
  it("aタグ以外の要素がtrueに設定されている", () => {
    const handlers = DEFAULT_OPTIONS.handlers;
    expect(handlers?.a).toBe(false);
    expect(handlers?.strong).toBe(true);
    expect(handlers?.em).toBe(true);
    expect(handlers?.code).toBe(true);
    expect(handlers?.ul).toBe(true);
    expect(handlers?.ol).toBe(true);
    expect(handlers?.h1).toBe(true);
    expect(handlers?.blockquote).toBe(true);
    expect(handlers?.img).toBe(true);
  });

  it("documentがfalse", () => {
    expect(DEFAULT_OPTIONS.document).toBe(false);
  });
});
