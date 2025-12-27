/**
 * HTML Trimmer - HTMLをテキスト選択範囲に合わせてトリミング
 * range.cloneContents()で取得したHTMLが選択範囲外のコンテンツを含む場合に
 * selection.textと一致する部分のみを抽出する
 */

import type { Element, Node, Parent, Text } from "hast";
import rehypeParse from "rehype-parse";
import rehypeStringify from "rehype-stringify";
import { unified } from "unified";

/**
 * ブロック要素のセット
 * これらの要素の後に改行を挿入してブラウザの selection.toString() と一致させる
 */
const BLOCK_ELEMENTS = new Set([
  "p",
  "div",
  "li",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "blockquote",
  "pre",
  "br",
  "tr",
  "dt",
  "dd",
]);

/**
 * HTMLからテキスト内容を抽出
 */
export function getTextFromHtml(html: string): string {
  if (!html) {
    return "";
  }

  const processor = unified().use(rehypeParse, { fragment: true });
  const tree = processor.parse(html);
  return extractText(tree);
}

/**
 * HASTノードからテキストを抽出
 * ブロック要素の後に改行を追加してブラウザのselection.toString()と一致させる
 */
function extractText(node: Node): string {
  if (node.type === "text") {
    return (node as Text).value;
  }

  if (node.type === "element") {
    const element = node as Element;
    const childText = element.children.map(extractText).join("");
    // ブロック要素の後に改行を追加
    if (BLOCK_ELEMENTS.has(element.tagName)) {
      return `${childText}\n`;
    }
    return childText;
  }

  if ("children" in node) {
    return (node as Parent).children.map(extractText).join("");
  }

  return "";
}

/**
 * テキストを正規化（比較用）
 * - 前後の空白を削除
 * - 連続する空白を単一スペースに統一
 */
export function normalizeText(text: string): string {
  if (!text) {
    return "";
  }
  return text.trim().replace(/\s+/g, " ");
}

/**
 * expectedTextがhtmlText内で出現する範囲を検索
 * 正規化されたテキストで比較し、元のテキストでの位置を返す
 */
export function findTextRange(
  htmlText: string,
  expectedText: string
): { start: number; end: number } | null {
  if (!(htmlText && expectedText)) {
    return null;
  }

  const normalizedHtml = normalizeText(htmlText);
  const normalizedExpected = normalizeText(expectedText);

  // 完全一致の場合
  if (normalizedHtml === normalizedExpected) {
    return { start: 0, end: htmlText.length };
  }

  // 正規化されたテキスト内で検索
  const normalizedIndex = normalizedHtml.indexOf(normalizedExpected);
  if (normalizedIndex === -1) {
    return null;
  }

  // 正規化されたインデックスを元のテキストのインデックスにマッピング
  let originalStart = 0;
  let normalizedPos = 0;

  // 先頭の空白をスキップ
  while (
    originalStart < htmlText.length &&
    /\s/.test(htmlText[originalStart])
  ) {
    originalStart++;
  }

  // normalizedIndexまでの位置を特定
  let currentOriginal = originalStart;
  while (normalizedPos < normalizedIndex && currentOriginal < htmlText.length) {
    if (/\s/.test(htmlText[currentOriginal])) {
      while (
        currentOriginal < htmlText.length &&
        /\s/.test(htmlText[currentOriginal])
      ) {
        currentOriginal++;
      }
      normalizedPos++;
    } else {
      currentOriginal++;
      normalizedPos++;
    }
  }
  originalStart = currentOriginal;

  // 終了位置を特定
  let originalEnd = originalStart;
  normalizedPos = 0;
  while (
    normalizedPos < normalizedExpected.length &&
    originalEnd < htmlText.length
  ) {
    if (/\s/.test(htmlText[originalEnd])) {
      while (
        originalEnd < htmlText.length &&
        /\s/.test(htmlText[originalEnd])
      ) {
        originalEnd++;
      }
      normalizedPos++;
    } else {
      originalEnd++;
      normalizedPos++;
    }
  }

  return { start: originalStart, end: originalEnd };
}

interface TextNodeInfo {
  node: Text;
  start: number;
  end: number;
}

/**
 * HASTツリー内のテキストノードとその文字位置をマッピング
 * extractText()で追加されるブロック要素後の改行も考慮する
 */
function collectTextNodes(node: Node, currentPos = 0): TextNodeInfo[] {
  const nodes: TextNodeInfo[] = [];

  if (node.type === "text") {
    const textNode = node as Text;
    const length = textNode.value.length;
    nodes.push({
      node: textNode,
      start: currentPos,
      end: currentPos + length,
    });
  } else if (node.type === "element") {
    const element = node as Element;
    let pos = currentPos;
    for (const child of element.children) {
      const childNodes = collectTextNodes(child, pos);
      nodes.push(...childNodes);
      for (const { end } of childNodes) {
        pos = Math.max(pos, end);
      }
      if (childNodes.length === 0 && child.type === "text") {
        pos += (child as Text).value.length;
      }
      // ブロック要素の後に改行が追加される
      if (
        child.type === "element" &&
        BLOCK_ELEMENTS.has((child as Element).tagName)
      ) {
        pos += 1; // 改行文字分
      }
    }
  } else if ("children" in node) {
    let pos = currentPos;
    for (const child of (node as Parent).children) {
      const childNodes = collectTextNodes(child, pos);
      nodes.push(...childNodes);
      for (const { end } of childNodes) {
        pos = Math.max(pos, end);
      }
      if (childNodes.length === 0 && child.type === "text") {
        pos += (child as Text).value.length;
      }
      // ブロック要素の後に改行が追加される
      if (
        child.type === "element" &&
        BLOCK_ELEMENTS.has((child as Element).tagName)
      ) {
        pos += 1; // 改行文字分
      }
    }
  }

  return nodes;
}

/**
 * 指定された文字範囲のみを残してHTMLをトリミング
 */
export function trimHtmlByRange(
  html: string,
  range: { start: number; end: number }
): string {
  if (!html) {
    return "";
  }

  const processor = unified()
    .use(rehypeParse, { fragment: true })
    .use(rehypeStringify);

  const tree = processor.parse(html);
  const textNodes = collectTextNodes(tree);

  // 範囲外のテキストノードを処理
  for (const { node, start, end } of textNodes) {
    const nodeText = node.value;

    if (end <= range.start || start >= range.end) {
      // 完全に範囲外 - テキストを空にする
      node.value = "";
    } else if (start < range.start || end > range.end) {
      // 部分的に範囲内 - テキストをトリミング
      const trimStart = Math.max(0, range.start - start);
      const trimEnd = Math.min(nodeText.length, range.end - start);
      node.value = nodeText.slice(trimStart, trimEnd);
    }
    // 完全に範囲内の場合は変更なし
  }

  // 空になった要素を削除
  removeEmptyNodes(tree);

  return processor.stringify(tree);
}

/**
 * 空のノードを再帰的に削除
 * 空のブロック要素（h1-h6, div, p など）も削除する
 */
function removeEmptyNodes(node: Node): boolean {
  if (node.type === "text") {
    return (node as Text).value.length > 0;
  }

  if ("children" in node) {
    const parent = node as Parent;
    parent.children = parent.children.filter((child) =>
      removeEmptyNodes(child)
    );
    // rootノード以外で子がない場合は削除
    return parent.children.length > 0 || node.type === "root";
  }

  return true;
}

/**
 * HTMLから空のブロック要素を削除
 */
export function removeEmptyBlockElements(html: string): string {
  if (!html) {
    return "";
  }

  const processor = unified()
    .use(rehypeParse, { fragment: true })
    .use(rehypeStringify);

  const tree = processor.parse(html);
  removeEmptyNodes(tree);

  return processor.stringify(tree);
}

/**
 * HTMLをテキストに合わせてトリミング
 * selection.textと一致する部分のみを抽出
 */
export function trimHtmlToMatchText(
  html: string,
  expectedText: string
): string {
  // 空入力のチェック
  if (!(html && expectedText)) {
    return expectedText || "";
  }

  const htmlText = getTextFromHtml(html);

  // 正規化して比較 - 一致してもまず空要素を削除
  if (normalizeText(htmlText) === normalizeText(expectedText)) {
    return removeEmptyBlockElements(html);
  }

  // 範囲を検索
  const range = findTextRange(htmlText, expectedText);

  if (!range) {
    // 見つからない場合はプレーンテキストにフォールバック
    return expectedText;
  }

  // 範囲に基づいてトリミング
  return trimHtmlByRange(html, range);
}
