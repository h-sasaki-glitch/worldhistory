import { describe, expect, it } from 'vitest';

import { TERMS_BY_ID } from '@/history/data';
import { toCells } from '@/history/crossword/normalizeJapanese';

import { buildLetterTiles } from './answerInput';
import { MAX_TILE, MIN_TILE, TILE_GAP, tileLayout } from './tileLayout';

// 手がかりパネルの内側の幅（375px 幅の端末で左右の余白を引いた値）
const PHONE_WIDTH = 375 - 24;

const fits = (width: number, l: ReturnType<typeof tileLayout>) =>
  l.perRow * l.size + TILE_GAP * (l.perRow - 1) <= width;

describe('文字盤の並べ方', () => {
  it('短い語は 1 行（例: ナイル 3 文字＋ダミー 4＋⌫）', () => {
    const l = tileLayout(PHONE_WIDTH, 3 + 4 + 1);
    expect(l.rows).toBe(1);
    expect(l.size).toBeGreaterThanOrEqual(MIN_TILE);
    expect(l.size).toBeLessThanOrEqual(MAX_TILE);
  });

  it('バンリノチョウジョウ（10 文字）は縮めずに 2 行へ折り返す', () => {
    const cells = toCells(TERMS_BY_ID.wall.crosswordAnswer);
    expect(cells.length).toBe(10);
    const count = buildLetterTiles(cells, cells.map(() => null), 1).length + 1;
    const l = tileLayout(PHONE_WIDTH, count);
    expect(l.rows).toBe(2);
    expect(l.size).toBeGreaterThanOrEqual(MIN_TILE);
    expect(fits(PHONE_WIDTH, l)).toBe(true);
    // 1 行に詰めた場合は押しにくい大きさになっていた
    expect(Math.floor((PHONE_WIDTH - TILE_GAP * (count - 1)) / count)).toBeLessThan(MIN_TILE);
  });

  it('全ステージのどの語でも、375px 幅でタイルは 34px 以上・はみ出さない・2 行以内', () => {
    for (const t of Object.values(TERMS_BY_ID)) {
      const cells = toCells(t.crosswordAnswer);
      const count = buildLetterTiles(cells, cells.map(() => null), 1).length + 1;
      const l = tileLayout(PHONE_WIDTH, count);
      expect(l.size, t.id).toBeGreaterThanOrEqual(MIN_TILE);
      expect(l.rows, t.id).toBeLessThanOrEqual(2);
      expect(fits(PHONE_WIDTH, l), t.id).toBe(true);
      expect(l.perRow * l.rows, t.id).toBeGreaterThanOrEqual(count);
    }
  });

  it('幅 0（計測前）は描かない', () => {
    expect(tileLayout(0, 8).size).toBe(0);
  });
});
