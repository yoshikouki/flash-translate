import { describe, expect, it } from "vitest";
import { preserveNewlines, restoreNewlines } from "./newline-preserver";

describe("preserveNewlines", () => {
  it("単一の改行を <br> に変換", () => {
    expect(preserveNewlines("Hello\nWorld")).toBe("Hello<br>World");
  });

  it("複数の改行を <br> に変換", () => {
    expect(preserveNewlines("Line1\nLine2\nLine3")).toBe(
      "Line1<br>Line2<br>Line3"
    );
  });

  it("連続する改行を <br> に変換", () => {
    expect(preserveNewlines("Hello\n\nWorld")).toBe("Hello<br><br>World");
  });

  it("改行がない場合はそのまま返す", () => {
    expect(preserveNewlines("Hello World")).toBe("Hello World");
  });

  it("空文字列を処理", () => {
    expect(preserveNewlines("")).toBe("");
  });

  it("改行のみのテキストを処理", () => {
    expect(preserveNewlines("\n")).toBe("<br>");
  });
});

describe("restoreNewlines", () => {
  it("<br> を改行に復元", () => {
    expect(restoreNewlines("Hello<br>World")).toBe("Hello\nWorld");
  });

  it("<BR> (大文字) を改行に復元", () => {
    expect(restoreNewlines("Hello<BR>World")).toBe("Hello\nWorld");
  });

  it("<br/> を改行に復元", () => {
    expect(restoreNewlines("Hello<br/>World")).toBe("Hello\nWorld");
  });

  it("<BR/> を改行に復元", () => {
    expect(restoreNewlines("Hello<BR/>World")).toBe("Hello\nWorld");
  });

  it("<br /> (スペースあり) を改行に復元", () => {
    expect(restoreNewlines("Hello<br />World")).toBe("Hello\nWorld");
  });

  it("<BR /> を改行に復元", () => {
    expect(restoreNewlines("Hello<BR />World")).toBe("Hello\nWorld");
  });

  it("複数の <br> バリエーションを処理", () => {
    expect(restoreNewlines("A<br>B<BR>C<br/>D<BR />E")).toBe("A\nB\nC\nD\nE");
  });

  it("<br> がない場合はそのまま返す", () => {
    expect(restoreNewlines("Hello World")).toBe("Hello World");
  });

  it("空文字列を処理", () => {
    expect(restoreNewlines("")).toBe("");
  });
});

describe("preserveNewlines と restoreNewlines の往復", () => {
  it("変換と復元で元のテキストに戻る", () => {
    const original = "Hello\nWorld\n\nNew paragraph";
    const preserved = preserveNewlines(original);
    const restored = restoreNewlines(preserved);
    expect(restored).toBe(original);
  });

  it("リスト形式のテキストを往復", () => {
    const original = "- Item 1\n- Item 2\n- Item 3";
    const preserved = preserveNewlines(original);
    const restored = restoreNewlines(preserved);
    expect(restored).toBe(original);
  });
});
