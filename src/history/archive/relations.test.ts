import { describe, expect, it } from 'vitest';

import {
  ALL_TERMS,
  CONCEPT_LABELS,
  HOME_STAGE_OF,
  RELATIONS,
  STAGES,
  TERMS_BY_ID,
  conceptLabel,
} from '@/history/data';

import { relatedIds } from './linkResolver';
import { DIRECTED_RELATIONS, acrossTimeOf, relationBetween, relationsOf } from './relations';

const across = (id: string) => acrossTimeOf(id, TERMS_BY_ID, HOME_STAGE_OF, RELATIONS, conceptLabel);
const pairKey = (a: string, b: string) => (a < b ? `${a}|${b}` : `${b}|${a}`);

describe('HistoricalRelation: データの整合性', () => {
  it('関係の両端は、存在する用語', () => {
    for (const r of RELATIONS) {
      expect(TERMS_BY_ID[r.from], `${r.from} → ${r.to}`).toBeDefined();
      expect(TERMS_BY_ID[r.to], `${r.from} → ${r.to}`).toBeDefined();
      expect(r.from).not.toBe(r.to);
      expect(r.note.length, `${r.from} → ${r.to}`).toBeGreaterThan(10);
    }
  });

  it('同じ組に関係を二重に定めない（向きを逆にした重複も不可）', () => {
    const keys = RELATIONS.map((r) => pairKey(r.from, r.to));
    expect(new Set(keys).size).toBe(keys.length);
  });

  it('SAME_CATEGORY は conceptId から導く。明示データには書かない', () => {
    expect(RELATIONS.filter((r) => r.type === 'SAME_CATEGORY')).toEqual([]);
  });

  it('同じ時代の中の関係は、CONNECTED（relatedTermIds）にも出る組に限る', () => {
    for (const r of RELATIONS) {
      if (HOME_STAGE_OF[r.from] !== HOME_STAGE_OF[r.to]) continue;
      expect(relatedIds(r.from, TERMS_BY_ID), `${r.from} → ${r.to}`).toContain(r.to);
    }
  });

  it('すべての conceptId に表示名がある', () => {
    for (const t of ALL_TERMS) if (t.conceptId) expect(CONCEPT_LABELS[t.conceptId], t.id).toBeDefined();
  });
});

describe('HistoricalRelation: 向き', () => {
  it('向きのある関係は、見る側によってラベルが変わる（甲骨文字 → 漢字）', () => {
    expect(relationBetween('oracle', 'kanji', RELATIONS)).toMatchObject({ type: 'EVOLUTION', direction: 'out', label: '発展先' });
    expect(relationBetween('kanji', 'oracle', RELATIONS)).toMatchObject({ type: 'EVOLUTION', direction: 'in', label: '発展元' });
  });

  it('影響: 法家 → 秦、法家 → 始皇帝', () => {
    expect(relationBetween('legalism', 'qin', RELATIONS)).toMatchObject({ type: 'INFLUENCE', direction: 'out', label: '影響先' });
    expect(relationBetween('qin', 'legalism', RELATIONS)).toMatchObject({ type: 'INFLUENCE', direction: 'in', label: '影響元' });
    expect(relationBetween('shihuang', 'legalism', RELATIONS)).toMatchObject({ type: 'INFLUENCE', direction: 'in' });
  });

  it('向きのない関係は、どちらから見ても同じ（太陰暦 ↔ 太陽暦 は対照）', () => {
    const a = relationBetween('lunar_calendar', 'solar_calendar', RELATIONS);
    const b = relationBetween('solar_calendar', 'lunar_calendar', RELATIONS);
    expect(a).toMatchObject({ type: 'CONTRAST', direction: 'both', label: '対照' });
    expect(b).toMatchObject({ type: 'CONTRAST', direction: 'both', label: '対照' });
  });

  it('向きのない種類に out/in は付かない', () => {
    for (const r of RELATIONS) {
      const rel = relationsOf(r.from, RELATIONS).find((x) => x.termId === r.to)!;
      expect(rel.direction === 'both', `${r.from} → ${r.to}`).toBe(!DIRECTED_RELATIONS.has(r.type));
    }
  });
});

describe('HistoricalRelation: 指定された組', () => {
  it('くさび形文字 ↔ 象形文字 は比較', () => {
    expect(relationBetween('cuneiform', 'hieroglyph', RELATIONS)?.type).toBe('COMPARE');
  });
  it('ジッグラト ↔ ピラミッド は比較（同じ分類でもある）', () => {
    expect(relationBetween('ziggurat', 'pyramid', RELATIONS)?.type).toBe('COMPARE');
    expect(TERMS_BY_ID.ziggurat.conceptId).toBe(TERMS_BY_ID.pyramid.conceptId);
  });
  it('法家 ↔ 儒教 は対照', () => {
    expect(relationBetween('legalism', 'confucian', RELATIONS)?.type).toBe('CONTRAST');
  });
});

describe('conceptId（分類）と関係は独立している', () => {
  it('ハンムラビ法典とローマ法は同じ分類だが、影響関係ではない', () => {
    expect(TERMS_BY_ID.hammurabi_code.conceptId).toBe(TERMS_BY_ID.roman_law.conceptId);
    const rel = relationBetween('hammurabi_code', 'roman_law', RELATIONS);
    expect(rel?.type).toBe('COMPARE');
    expect(rel?.type).not.toBe('INFLUENCE');
    expect(rel?.note).toContain('直接影響したわけではない');
  });

  it('秦の法家は「法のしくみ」に分類しない（法典と同一視しない）', () => {
    expect(TERMS_BY_ID.legalism.conceptId).not.toBe(TERMS_BY_ID.hammurabi_code.conceptId);
    expect(across('legalism').map((x) => x.termId)).not.toContain('hammurabi_code');
    expect(across('legalism').map((x) => x.termId)).not.toContain('roman_law');
  });

  it('時代をまたぐ「影響」「原因」「発展」は置かない（確かな根拠のある直接関係は、現状どれも同じ時代の中）', () => {
    for (const r of RELATIONS) {
      if (!DIRECTED_RELATIONS.has(r.type)) continue;
      expect(HOME_STAGE_OF[r.from], `${r.from} → ${r.to}`).toBe(HOME_STAGE_OF[r.to]);
    }
  });

  it('関係を定めた組は「同じ分類」ではなく、その関係として ACROSS TIME に出る', () => {
    const lunar = across('lunar_calendar');
    expect(lunar).toEqual([expect.objectContaining({ termId: 'solar_calendar', type: 'CONTRAST', label: '対照' })]);
  });

  it('関係を定めていない同じ分類は SAME_CATEGORY（同じ分類）として出る', () => {
    expect(across('shamash')).toEqual([
      expect.objectContaining({ termId: 'ra', type: 'SAME_CATEGORY', label: '同じ分類' }),
    ]);
    expect(across('shamash')[0].note).toContain('太陽の神');
  });

  it('conceptId がなくても、時代をまたぐ関係があれば ACROSS TIME に出る（道路 ↔ 街道）', () => {
    expect(TERMS_BY_ID.road.conceptId).toBeUndefined();
    expect(across('road').map((x) => x.termId)).toEqual(['roman_road']);
  });

  it('ACROSS TIME に同じ時代の用語は出ない', () => {
    for (const t of ALL_TERMS) {
      for (const x of across(t.id)) expect(x.stageId, `${t.id} → ${x.termId}`).not.toBe(HOME_STAGE_OF[t.id]);
    }
  });

  it('ACROSS TIME の行き先は、遊べるステージの時代', () => {
    const ids = new Set(STAGES.map((s) => s.id));
    for (const t of ALL_TERMS) for (const x of across(t.id)) expect(ids.has(x.stageId)).toBe(true);
  });
});
