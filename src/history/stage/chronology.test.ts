import { describe, expect, it } from 'vitest';

import { CIVILIZATIONS, STAGES, UPCOMING_STAGES } from '@/history/data';

import { formatYear, nextStopAfter, nextStopLabel, sortByVisit, stageNumberOf } from './chronology';
import type { StageDefinition } from './types';

describe('時間軸: visitYear と civilizationStartYear', () => {
  it('ステージは visitYear の昇順に並ぶ', () => {
    for (let i = 1; i < STAGES.length; i++) {
      expect(STAGES[i].visitYear, `${STAGES[i - 1].id} → ${STAGES[i].id}`).toBeGreaterThan(STAGES[i - 1].visitYear);
    }
  });

  it('並び順は EGYPT → INDUS → MESOPOTAMIA → CHINA → GREECE → QIN → ROME', () => {
    expect(STAGES.map((s) => s.id)).toEqual(['egypt', 'indus', 'mesopotamia', 'china', 'greece', 'qin', 'rome']);
  });

  it('どの時代の「次」も、過去へ戻らない', () => {
    for (const s of STAGES) {
      const next = nextStopAfter(s.id, STAGES, UPCOMING_STAGES);
      if (!next) continue;
      const year = next.kind === 'stage' ? next.stage.visitYear : next.upcoming.visitYear;
      expect(year, s.id).toBeGreaterThan(s.visitYear);
    }
  });

  it('「次」は並びのすぐ後ろの時代。最後の時代の次は予告（ARABIA AD 610）', () => {
    STAGES.slice(0, -1).forEach((s, i) => {
      const next = nextStopAfter(s.id, STAGES, UPCOMING_STAGES);
      expect(next?.kind === 'stage' && next.stage.id, s.id).toBe(STAGES[i + 1].id);
    });
    const last = nextStopAfter(STAGES[STAGES.length - 1].id, STAGES, UPCOMING_STAGES);
    expect(last && nextStopLabel(last)).toEqual({ id: 'arabia', title: 'ARABIA', timelineLabel: 'AD 610' });
  });

  it('予告は遊べるどのステージよりも後の年', () => {
    const latest = Math.max(...STAGES.map((s) => s.visitYear));
    for (const u of UPCOMING_STAGES) expect(u.visitYear).toBeGreaterThan(latest);
  });

  it('タイムライン表示は訪れる年と一致する（文明の起点年ではない）', () => {
    for (const s of STAGES) expect(s.timelineLabel, s.id).toBe(formatYear(s.visitYear));
    for (const u of UPCOMING_STAGES) expect(u.timelineLabel, u.id).toBe(formatYear(u.visitYear));
  });

  it('eraLabel の年も visitYear と一致する', () => {
    for (const s of STAGES) {
      const y = Math.abs(s.visitYear);
      expect(s.eraLabel, s.id).toBe(s.visitYear < 0 ? `c. ${y} BCE` : `c. AD ${y}`);
    }
  });

  it('文明の起点は、訪れる年より前（または同じ）', () => {
    for (const s of STAGES) {
      const civ = CIVILIZATIONS[s.civilizationId];
      expect(civ, s.id).toBeDefined();
      expect(civ.startYear, s.id).toBeLessThanOrEqual(s.visitYear);
    }
  });

  it('メソポタミア文明は BC 3500 に始まるが、ステージで訪れるのは BC 1750 のバビロン', () => {
    const meso = STAGES.find((s) => s.id === 'mesopotamia')!;
    expect(CIVILIZATIONS[meso.civilizationId].startYear).toBe(-3500);
    expect(meso.visitYear).toBe(-1750);
  });

  it('同じ文明を別の年に訪れるステージを表現できる（殷と秦はどちらも中国文明）', () => {
    const ids = STAGES.filter((s) => s.civilizationId === 'china').map((s) => s.id);
    expect(ids).toEqual(['china', 'qin']);
    // 将来 SUMER/URUK（BC 3000）を加えても、BABYLON（BC 1750）の前に自動で並ぶ
    const meso = STAGES.find((s) => s.id === 'mesopotamia')!;
    const uruk: StageDefinition = { ...meso, id: 'uruk', place: 'URUK', visitYear: -3000 };
    const ordered = sortByVisit([...STAGES, uruk]).map((s) => s.id);
    expect(ordered.slice(0, 2)).toEqual(['uruk', 'egypt']);
    expect(ordered.indexOf('uruk')).toBeLessThan(ordered.indexOf('mesopotamia'));
  });

  it('ステージ番号は並び順から決まる', () => {
    expect(STAGES.map((s) => stageNumberOf(STAGES, s.id))).toEqual([1, 2, 3, 4, 5, 6, 7]);
    expect(stageNumberOf(STAGES, 'mesopotamia')).toBe(3);
  });

  it('formatYear', () => {
    expect(formatYear(-1750)).toBe('BC 1750');
    expect(formatYear(120)).toBe('AD 120');
    expect(() => formatYear(0)).toThrow();
  });
});
