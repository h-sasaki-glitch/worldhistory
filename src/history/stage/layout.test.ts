import { describe, expect, it } from 'vitest';

import { STAGES, TERMS_BY_ID } from '@/history/data';

import { stageLayout } from './layout';
import { buildStageBoards } from './stageBoards';

// 手がかりパネル（文字盤入力）の実測: 1 行で約 150px、長い語で 2 行に折り返すと約 195px
const CLUE_ONE_ROW = 150;
const CLUE_TWO_ROWS = 195;
// 旧 MESOPOTAMIA の盤面（10 列 × 11 行）。小さい画面でマスが 22px まで縮んでいた
const meso = { cols: 10, rows: 11, clueHeight: CLUE_ONE_ROW };
const MIN_CELL = 28;

describe('Stage layout', () => {
  // 小さい画面: iPhone SE の Safari 表示域（375×560）、iPhone 14 の Safari 表示域（390×664）
  const PHONES = [
    [375, 560],
    [390, 664],
  ] as const;

  it.each(STAGES.map((s) => [s.id, s] as const))(
    '%s: 小さい画面でも、どの盤面のマスも 28px 以上（文字盤が 2 行に折り返しても）',
    (_, stage) => {
      const sb = buildStageBoards(stage, TERMS_BY_ID);
      expect(sb.unplaced).toEqual([]);
      for (const board of sb.boards) {
        for (const [width, height] of PHONES) {
          for (const clueHeight of [CLUE_ONE_ROW, CLUE_TWO_ROWS]) {
            const l = stageLayout({
              width,
              height,
              cols: board.width,
              rows: board.height,
              clueHeight,
              tabs: sb.boards.length > 1,
            });
            expect(l.cellSize, `${width}x${height} clue ${clueHeight} board ${board.width}x${board.height}`).toBeGreaterThanOrEqual(MIN_CELL);
            expect(l.worldHeight).toBeGreaterThanOrEqual(124);
          }
        }
      }
    },
  );

  it('iPhone 14 の Safari 表示域（390×664）では、文字盤 1 行ならマスは 30px 以上', () => {
    for (const stage of STAGES) {
      for (const board of buildStageBoards(stage, TERMS_BY_ID).boards) {
        const l = stageLayout({ width: 390, height: 664, cols: board.width, rows: board.height, clueHeight: CLUE_ONE_ROW });
        expect(l.cellSize, stage.id).toBeGreaterThanOrEqual(30);
      }
    }
  });

  it('盤面はスマートフォン向けに横長（短辺 8・長辺 12 マス以内）', () => {
    for (const stage of STAGES) {
      for (const b of buildStageBoards(stage, TERMS_BY_ID).boards) {
        expect(b.width, stage.id).toBeGreaterThanOrEqual(b.height);
        expect(b.width, stage.id).toBeLessThanOrEqual(12);
        expect(b.height, stage.id).toBeLessThanOrEqual(8);
      }
    }
  });

  it('旧 MESOPOTAMIA の 10×11 盤面は、375×560 で 28px を下回っていた（分割・転置が必要だった根拠）', () => {
    const l = stageLayout({ width: 375, height: 560, ...meso });
    expect(l.cellSize).toBeLessThan(MIN_CELL);
  });

  it('縦に余裕がある画面では HISTORY WORLD を広げる（上限 42%）', () => {
    const l = stageLayout({ width: 390, height: 844, cols: 8, rows: 11, clueHeight: 130 });
    expect(l.worldHeight).toBeGreaterThan(250);
    expect(l.worldHeight).toBeLessThanOrEqual(Math.round(844 * 0.42));
    expect(l.compact).toBe(false);
  });

  it('マスは 40px を超えない', () => {
    const l = stageLayout({ width: 480, height: 1200, cols: 6, rows: 6, clueHeight: 130 });
    expect(l.cellSize).toBeLessThanOrEqual(40);
  });

  it('各領域の合計が画面の高さを超えない', () => {
    for (const [w, h] of [[375, 560], [390, 664], [390, 844], [430, 932]]) {
      const l = stageLayout({ width: w, height: h, ...meso });
      expect(l.worldHeight + meso.clueHeight + l.cellSize * meso.rows + 12).toBeLessThanOrEqual(h);
    }
  });
});
