/**
 * クロスワード用の日本語文字正規化。
 *
 * ルール:
 * - 盤面はカタカナのみ。ひらがな入力はカタカナへ変換する。
 * - 1文字 = 1セル。小書き文字（ィ・ュ・ッ）、長音（ー）、濁音・半濁音（ガ・パ）もそれぞれ1セル。
 * - 中黒（・）、イコール（=／＝／゠）、空白は除去する。
 * - 漢字など、カタカナに変換できない文字が残る場合は不正な解答とみなす。
 *   （表示名「楔形文字」を解答「クサビガタモジ」と混同しないため）
 */

const HIRAGANA_START = 0x3041;
const HIRAGANA_END = 0x3096;
const KANA_OFFSET = 0x60;

/** 除去する区切り記号 */
const SEPARATORS = /[\s・･=＝゠]/g;
/** 長音として扱う横棒類 */
const DASHES = /[-‐‑–—―−－~〜～]/g;

/** 盤面で許可する文字: カタカナ（ァ〜ヶ）と長音 */
const CROSSWORD_CHAR = /^[ァ-ヶー]$/;

export function hiraganaToKatakana(input: string): string {
  let out = '';
  for (const ch of input) {
    const code = ch.codePointAt(0)!;
    out +=
      code >= HIRAGANA_START && code <= HIRAGANA_END
        ? String.fromCodePoint(code + KANA_OFFSET)
        : ch;
  }
  return out;
}

/**
 * 入力文字列を盤面用のカタカナ文字列へ正規化する。
 * 不正な文字（漢字など）はそのまま残すので、isCrosswordAnswer で判定すること。
 */
export function normalizeAnswer(input: string): string {
  // NFKC: 半角カナ→全角、結合用濁点の合成（カ+゙→ガ）、全角英数→半角
  const nfkc = input.normalize('NFKC');
  return hiraganaToKatakana(nfkc).replace(SEPARATORS, '').replace(DASHES, 'ー');
}

export function isCrosswordChar(ch: string): boolean {
  return CROSSWORD_CHAR.test(ch);
}

/** 正規化後の文字列がすべて盤面用文字か */
export function isCrosswordAnswer(normalized: string): boolean {
  if (normalized.length === 0) return false;
  return Array.from(normalized).every(isCrosswordChar);
}

/**
 * 解答文字列をセル単位の配列へ分割する。
 * 盤面に置けない文字が含まれる場合は例外を投げる。
 */
export function toCells(answer: string): string[] {
  const normalized = normalizeAnswer(answer);
  const cells = Array.from(normalized);
  if (!isCrosswordAnswer(normalized)) {
    throw new Error(`Not a crossword answer (katakana only): "${answer}"`);
  }
  return cells;
}

/** ユーザー入力をセル配列へ。不正な場合は null（例外にしない） */
export function inputToCells(input: string): string[] | null {
  const normalized = normalizeAnswer(input);
  return isCrosswordAnswer(normalized) ? Array.from(normalized) : null;
}

export function cellsEqual(a: readonly string[], b: readonly string[]): boolean {
  return a.length === b.length && a.every((ch, i) => ch === b[i]);
}
