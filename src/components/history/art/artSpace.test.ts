import { describe, expect, it } from 'vitest';

import { STAGES } from '@/history/data';

import { artToScreen, cropFor } from './artSpace';

describe('Backdrop crop', () => {
  it('切り抜きは表示領域と同じ縦横比になる', () => {
    const c = cropFor(390, 130, []);
    expect(c.w / c.h).toBeCloseTo(390 / 130, 5);
  });

  it('タップポイントがないときは中央で切り抜く', () => {
    const c = cropFor(390, 130, []);
    expect(c.y).toBeCloseTo((340 - c.h) / 2, 5);
  });

  // スマホで HISTORY WORLD が最も低くなる場合（下限 124px）から、縦に余裕のある場合まで。見出し（約 42px）の下に置く
  const HEADER = 42;
  const sizes: [number, number][] = [
    [375, 124],
    [390, 130],
    [390, 205],
    [390, 354],
    [480, 300],
  ];

  it.each(STAGES.map((s) => [s.id, s] as const))('%s: すべての背景 DISCOVERY が画面内に収まる', (_, stage) => {
    const ys = stage.backgroundHotspots.map((h) => h.y);
    for (const [w, h] of sizes) {
      const crop = cropFor(w, h, ys, HEADER);
      for (const spot of stage.backgroundHotspots) {
        const p = artToScreen(spot.x, spot.y, w, h, crop);
        expect(p.x, `${stage.id} ${spot.termId} @${w}x${h}`).toBeGreaterThanOrEqual(0);
        expect(p.x, `${stage.id} ${spot.termId} @${w}x${h}`).toBeLessThanOrEqual(w);
        expect(p.y, `${stage.id} ${spot.termId} @${w}x${h}`).toBeGreaterThanOrEqual(HEADER);
        expect(p.y, `${stage.id} ${spot.termId} @${w}x${h}`).toBeLessThanOrEqual(h - 8);
      }
    }
  });
});
