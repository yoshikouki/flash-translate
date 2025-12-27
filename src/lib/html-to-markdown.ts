import type { Handle } from "hast-util-to-mdast";
import rehypeParse from "rehype-parse";
import type { Options } from "rehype-remark";
import rehypeRemark from "rehype-remark";
import remarkStringify from "remark-stringify";
import { unified } from "unified";

/**
 * HTML to Markdown 変換オプション
 * 各要素の変換方法を設定可能
 */
export interface HtmlToMarkdownOptions {
  handlers?: {
    /** aタグ: true=Markdownリンク, false=テキストのみ, 'preserve'=HTMLそのまま */
    a?: boolean | "preserve";
    /** strong/bタグ: true=**text**, false=テキストのみ */
    strong?: boolean;
    /** em/iタグ: true=*text*, false=テキストのみ */
    em?: boolean;
    /** codeタグ: true=`code`, false=テキストのみ */
    code?: boolean;
    /** ulタグ: true=Markdownリスト, false=テキストのみ */
    ul?: boolean;
    /** olタグ: true=Markdownリスト, false=テキストのみ */
    ol?: boolean;
    /** 見出しタグ: true=# heading, false=テキストのみ */
    h1?: boolean;
    h2?: boolean;
    h3?: boolean;
    h4?: boolean;
    h5?: boolean;
    h6?: boolean;
    /** blockquoteタグ: true=> quote, false=テキストのみ */
    blockquote?: boolean;
    /** imgタグ: true=![alt](src), false=altテキストのみ */
    img?: boolean;
  };
  /** ドキュメント全体として扱うか (false=fragment) */
  document?: boolean;
}

/**
 * デフォルト設定 - 全ての構造を保持
 */
export const DEFAULT_OPTIONS: HtmlToMarkdownOptions = {
  handlers: {
    a: true,
    strong: true,
    em: true,
    code: true,
    ul: true,
    ol: true,
    h1: true,
    h2: true,
    h3: true,
    h4: true,
    h5: true,
    h6: true,
    blockquote: true,
    img: true,
  },
  document: false,
};

/**
 * 無効化されたハンドラーを生成
 * 要素をテキストのみに変換する
 */
function createDisabledHandler(): Handle {
  return (state, node) => {
    // 子ノードのテキストのみを返す
    if ("children" in node && Array.isArray(node.children)) {
      return state.all(node);
    }
    return [];
  };
}

/**
 * オプションからrehype-remarkのOptionsを構築
 */
function buildOptions(options: HtmlToMarkdownOptions): Options | undefined {
  const opts = options.handlers;
  if (!opts) {
    return undefined;
  }

  const handlers: Record<string, Handle> = {};

  // 各要素のハンドラーを設定
  const elementMappings: Array<{
    key: keyof NonNullable<HtmlToMarkdownOptions["handlers"]>;
    elements: string[];
  }> = [
    { key: "a", elements: ["a"] },
    { key: "strong", elements: ["strong", "b"] },
    { key: "em", elements: ["em", "i"] },
    { key: "code", elements: ["code"] },
    { key: "ul", elements: ["ul"] },
    { key: "ol", elements: ["ol"] },
    { key: "h1", elements: ["h1"] },
    { key: "h2", elements: ["h2"] },
    { key: "h3", elements: ["h3"] },
    { key: "h4", elements: ["h4"] },
    { key: "h5", elements: ["h5"] },
    { key: "h6", elements: ["h6"] },
    { key: "blockquote", elements: ["blockquote"] },
    { key: "img", elements: ["img"] },
  ];

  for (const { key, elements } of elementMappings) {
    const value = opts[key];
    if (value === false) {
      const handler = createDisabledHandler();
      for (const element of elements) {
        handlers[element] = handler;
      }
    }
    // value === true の場合はデフォルトのrehype-remarkハンドラーを使用
    // value === 'preserve' は将来の拡張用（HTMLをそのまま保持）
  }

  return Object.keys(handlers).length > 0 ? { handlers } : undefined;
}

/**
 * HTML文字列をMarkdownに変換
 * 純粋関数としてテスト可能
 */
export async function htmlToMarkdown(
  html: string,
  options: HtmlToMarkdownOptions = DEFAULT_OPTIONS
): Promise<string> {
  if (!html || html.trim().length === 0) {
    return "";
  }

  const rehypeRemarkOptions = buildOptions(options);

  const processor = unified()
    .use(rehypeParse, { fragment: !options.document })
    .use(rehypeRemark, rehypeRemarkOptions)
    .use(remarkStringify);

  const result = await processor.process(html);
  return String(result).trim();
}

/**
 * HTML文字列をMarkdownに同期的に変換
 * 小さなHTMLフラグメント向け
 */
export function htmlToMarkdownSync(
  html: string,
  options: HtmlToMarkdownOptions = DEFAULT_OPTIONS
): string {
  if (!html || html.trim().length === 0) {
    return "";
  }

  const rehypeRemarkOptions = buildOptions(options);

  const processor = unified()
    .use(rehypeParse, { fragment: !options.document })
    .use(rehypeRemark, rehypeRemarkOptions)
    .use(remarkStringify);

  const result = processor.processSync(html);
  return String(result).trim();
}
