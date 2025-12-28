/**
 * Newline Preserver - 翻訳 API 用の改行保持ユーティリティ
 *
 * Chromium Translator API は改行を無視して翻訳するため、
 * 改行を <br> タグに変換して保持し、翻訳後に復元する。
 */

/**
 * すべての改行を <br> に変換（翻訳前）
 */
export function preserveNewlines(text: string): string {
  if (!text) {
    return "";
  }
  return text.replace(/\n/g, "<br>");
}

/**
 * <br> バリエーションを改行に復元（翻訳後）
 * 対応パターン: <br>, <BR>, <br/>, <BR/>, <br />, <BR />
 */
export function restoreNewlines(text: string): string {
  if (!text) {
    return "";
  }
  return text.replace(/<br\s*\/?>/gi, "\n");
}
