import { cellsEqual, inputToCells } from '@/history/crossword/normalizeJapanese';
import { createRng, shuffle } from '@/history/crossword/random';

/**
 * 入力レイヤー（UI から独立）。
 *
 * - 'keyboard': 日本語ソフトウェアキーボードで読みを入力（MVP の既定）
 * - 'tiles'   : 必要文字＋ダミー文字の文字盤から選ぶ方式
 *
 * どちらも最終的に「セル配列」を checkAnswer に渡すだけなので、UI を差し替えても判定は共通。
 */
export type AnswerInputMode = 'keyboard' | 'tiles';

export type AnswerCheck =
  | { kind: 'correct' }
  | { kind: 'wrong' }
  | { kind: 'length'; expected: number; actual: number }
  | { kind: 'invalid' };

export function checkAnswer(raw: string | readonly string[], answer: readonly string[]): AnswerCheck {
  const cells = typeof raw === 'string' ? inputToCells(raw) : inputToCells(raw.join(''));
  if (!cells) return { kind: 'invalid' };
  if (cells.length !== answer.length) return { kind: 'length', expected: answer.length, actual: cells.length };
  return cellsEqual(cells, answer) ? { kind: 'correct' } : { kind: 'wrong' };
}

/** ダミー文字の候補（メソポタミアの語に頻出しない、自然なカタカナ） */
export const DEFAULT_DUMMY_POOL = Array.from('アイウエオカキクケコサスセタチツテナニヌネノハヒフホマミムモヤユヨラリルレロワンガギグゲゴザジズダドバビブベボパピプペポャュョッー');

/**
 * 文字盤（必要文字＋ダミー文字）を作る。
 * known[i] が埋まっている位置（交差で判明済みの文字）は必要文字から除く。
 */
export function buildLetterTiles(
  answer: readonly string[],
  known: readonly (string | null)[],
  seed: number,
  dummyCount = 4,
  dummyPool: readonly string[] = DEFAULT_DUMMY_POOL,
): string[] {
  const rng = createRng(seed);
  const required = answer.filter((_, i) => !known[i]);
  const pool = shuffle(
    dummyPool.filter((ch) => !answer.includes(ch)),
    rng,
  );
  return shuffle([...required, ...pool.slice(0, dummyCount)], rng);
}
