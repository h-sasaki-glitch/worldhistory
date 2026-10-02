import type { Board } from './types';

/** スマートフォン縦画面で 1 セル 30px 以上を確保できる目安 */
export const PREFERRED_MAX_WIDTH = 10;
export const PREFERRED_MAX_HEIGHT = 11;

export type BoardMetrics = {
  words: number;
  crossings: number;
  width: number;
  height: number;
  area: number;
  /** 長辺 / 短辺 */
  aspect: number;
  /** 交差が 1 つしかない語（盤面から浮きやすい語）の数 */
  weaklyLinkedWords: number;
  /** 交差がない語の数（成立した盤面では 0） */
  isolatedWords: number;
  /** 文字セルの充填率 */
  density: number;
};

export function measureBoard(board: Board): BoardMetrics {
  const { width, height, grid, placements } = board;
  let letters = 0;
  for (const row of grid) for (const ch of row) if (ch !== null) letters++;

  const crossingCount = new Map<string, number>();
  const seen = new Map<string, string[]>();
  for (const p of placements) {
    for (let i = 0; i < p.cells.length; i++) {
      const r = p.direction === 'down' ? p.row + i : p.row;
      const c = p.direction === 'across' ? p.col + i : p.col;
      const key = `${r}:${c}`;
      const ids = seen.get(key) ?? [];
      ids.push(p.id);
      seen.set(key, ids);
    }
  }
  let crossings = 0;
  for (const ids of seen.values()) {
    if (ids.length > 1) {
      crossings++;
      for (const id of ids) crossingCount.set(id, (crossingCount.get(id) ?? 0) + 1);
    }
  }

  const perWord = placements.map((p) => crossingCount.get(p.id) ?? 0);
  return {
    words: placements.length,
    crossings,
    width,
    height,
    area: width * height,
    aspect: Math.max(width, height) / Math.max(1, Math.min(width, height)),
    weaklyLinkedWords: perWord.filter((n) => n === 1).length,
    isolatedWords: perWord.filter((n) => n === 0).length,
    density: letters / Math.max(1, width * height),
  };
}

/**
 * 盤面の評価値（大きいほど良い）。
 * 優先順: 語数 > 交差数 > 面積の小ささ > 縦横比 > スマホでの読みやすさ > 孤立語の少なさ
 */
export function scoreBoard(board: Board): number {
  const m = measureBoard(board);
  return (
    m.words * 1000 +
    m.crossings * 45 -
    m.area * 2 -
    (m.aspect - 1) * 40 -
    Math.max(0, m.width - PREFERRED_MAX_WIDTH) * 80 -
    Math.max(0, m.height - PREFERRED_MAX_HEIGHT) * 40 -
    m.weaklyLinkedWords * 12 -
    m.isolatedWords * 500
  );
}
