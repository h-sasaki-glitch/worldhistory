import { describe, expect, it } from 'vitest';

import { conceptIndex, relatedIds, timeLinksOf } from '@/history/archive/linkResolver';
import { generateBoard } from '@/history/crossword/generator';
import { isCrosswordAnswer, normalizeAnswer, toCells } from '@/history/crossword/normalizeJapanese';
import { validateBoard } from '@/history/crossword/validator';

import { DRAFT_STAGES, HOME_STAGE_OF, LIBRARY_BY_ID, LIBRARY_TERMS, STAGES } from './index';

const ALL_STAGES = [...STAGES, ...DRAFT_STAGES];

describe('語彙データの整合性（全ステージ）', () => {
  it('ID は重複しない', () => {
    expect(new Set(LIBRARY_TERMS.map((t) => t.id)).size).toBe(LIBRARY_TERMS.length);
  });

  it('crosswordAnswer はカタカナのみで、読みと一致する', () => {
    for (const t of LIBRARY_TERMS) {
      expect(isCrosswordAnswer(t.crosswordAnswer), t.id).toBe(true);
      expect(normalizeAnswer(t.reading).startsWith(t.crosswordAnswer), t.id).toBe(true);
    }
  });

  it('関連語はすべて実在する', () => {
    for (const t of LIBRARY_TERMS) {
      for (const r of t.relatedTermIds) expect(LIBRARY_BY_ID[r], `${t.id} → ${r}`).toBeDefined();
    }
  });

  it('summary はおおむね 50〜80 字', () => {
    for (const t of LIBRARY_TERMS) {
      expect(t.summary.length, t.id).toBeGreaterThanOrEqual(45);
      expect(t.summary.length, t.id).toBeLessThanOrEqual(85);
    }
  });

  it('手がかり文に答えそのものを書かない', () => {
    for (const t of LIBRARY_TERMS) {
      const answers = [t.crosswordAnswer, t.display.replace(/（.*）/, '')];
      for (const clue of [t.clues.easy, t.clues.normal, t.discoverNote]) {
        for (const a of answers) expect(clue.includes(a), `${t.id}: ${clue}`).toBe(false);
      }
    }
  });
});

describe.each(ALL_STAGES.map((s) => [s.id, s] as const))('ステージ定義 %s', (_, stage) => {
  it('参照する語がすべて存在する', () => {
    const ids = [
      ...stage.crossword.termIds,
      ...stage.backgroundHotspots.map((h) => h.termId),
      stage.completion.unlockTermId,
      ...(stage.midEvent.unlockTermId ? [stage.midEvent.unlockTermId] : []),
    ];
    for (const id of ids) expect(LIBRARY_BY_ID[id], id).toBeDefined();
    if (stage.crossword.firstTermId) expect(stage.crossword.termIds).toContain(stage.crossword.firstTermId);
  });

  it('クロスワード・背景・人物登場・完了解放の語が重複しない', () => {
    const ids = [
      ...stage.crossword.termIds,
      ...stage.backgroundHotspots.map((h) => h.termId),
      stage.completion.unlockTermId,
      ...(stage.midEvent.unlockTermId ? [stage.midEvent.unlockTermId] : []),
    ];
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('全語が 1 枚の盤面に収まり、盤面として成立する', () => {
    const words = stage.crossword.termIds.map((id) => ({ id, cells: toCells(LIBRARY_BY_ID[id].crosswordAnswer) }));
    const { board, unplaced } = generateBoard(words, { seed: stage.crossword.seed });
    expect(unplaced).toEqual([]);
    expect(validateBoard(board, { maxGridSize: 15 })).toEqual([]);
  });
});

describe('TIME LINK（時代をまたぐ概念）', () => {
  const links = (id: string) => timeLinksOf(id, LIBRARY_BY_ID, HOME_STAGE_OF).map((t) => t.id);

  it('高校受験の対比: 太陰暦 ↔ 太陽暦、60進法 ↔ 十進法', () => {
    expect(links('lunar_calendar')).toEqual(['solar_calendar']);
    expect(links('sexagesimal')).toEqual(['decimal']);
  });

  it('文字体系: くさび形文字 ↔ 象形文字', () => {
    expect(links('cuneiform')).toEqual(['hieroglyph']);
    expect(links('hieroglyph')).toEqual(['cuneiform']);
  });

  it('書写材料・太陽神・大河・巨大建造物・河川文明でつながる', () => {
    expect(links('clay_tablet')).toEqual(['papyrus']);
    expect(links('shamash')).toEqual(['ra']);
    expect(links('nile').sort()).toEqual(['euphrates', 'tigris']);
    expect(links('ziggurat')).toEqual(['pyramid']);
    expect(links('mesopotamia')).toEqual(['egypt']);
  });

  it('同じ時代の中の同一概念は TIME LINK にしない', () => {
    expect(links('pharaoh')).toEqual([]); // 他の時代に同じ概念の語はまだない
    expect(links('tigris')).toEqual(['nile']); // ユーフラテス川は同じ時代なので含めない
  });

  it('時代内の LINK（relatedTermIds）は時代をまたがない', () => {
    for (const t of LIBRARY_TERMS) {
      for (const r of relatedIds(t.id, LIBRARY_BY_ID)) expect(HOME_STAGE_OF[r], `${t.id} → ${r}`).toBe(HOME_STAGE_OF[t.id]);
    }
  });

  it('概念索引に 2 つの時代が並ぶ', () => {
    const idx = conceptIndex(LIBRARY_BY_ID, HOME_STAGE_OF);
    expect(new Set(idx.WRITING_SYSTEM.map((x) => x.stageId))).toEqual(new Set(['mesopotamia', 'egypt']));
  });
});
