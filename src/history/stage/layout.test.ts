import { describe, expect, it } from 'vitest';

import { stageLayout } from './layout';

// MESOPOTAMIA の盤面（12 列 × 13 行）、手がかりパネル（文字盤入力）の実測は約 150px
const meso = { cols: 12, rows: 13, clueHeight: 150 };

describe('Stage layout', () => {
  it('iPhone SE 相当（375×560）でもマスは 22px 以上', () => {
    const l = stageLayout({ width: 375, height: 560, ...meso });
    expect(l.cellSize).toBeGreaterThanOrEqual(22);
    expect(l.worldHeight).toBeGreaterThanOrEqual(104);
    expect(l.compact).toBe(true);
  });

  it('iPhone 14 の Safari 表示域（390×664）でマスは 27px 以上', () => {
    const l = stageLayout({ width: 390, height: 664, ...meso });
    expect(l.cellSize).toBeGreaterThanOrEqual(27);
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
