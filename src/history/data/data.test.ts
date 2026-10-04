import { describe, expect, it } from 'vitest';

import { conceptIndex, relatedIds, timeLinksOf } from '@/history/archive/linkResolver';
import { isCrosswordAnswer, normalizeAnswer, toCells } from '@/history/crossword/normalizeJapanese';
import { validateBoard } from '@/history/crossword/validator';
import { buildStageBoards } from '@/history/stage/stageBoards';

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

  it('全語が盤面に収まり、どの盤面もクロスワードとして成立する', () => {
    const sb = buildStageBoards(stage, LIBRARY_BY_ID);
    expect(sb.unplaced).toEqual([]);
    for (const board of sb.boards) expect(validateBoard(board, { maxGridSize: 12 })).toEqual([]);
    const placed = sb.boards.flatMap((b) => b.placements.map((p) => p.id)).sort();
    expect(placed).toEqual([...stage.crossword.termIds].sort());
  });

  it('盤面の分け方（boards）を指定する場合、語の過不足がない', () => {
    const groups = stage.crossword.boards;
    if (!groups) return;
    const ids = groups.flatMap((g) => g.termIds);
    expect(new Set(ids).size).toBe(ids.length);
    expect([...ids].sort()).toEqual([...stage.crossword.termIds].sort());
    for (const g of groups) expect(g.label.length).toBeGreaterThan(0);
    // 指定した分け方どおりに盤面ができる
    const sb = buildStageBoards(stage, LIBRARY_BY_ID);
    groups.forEach((g, i) => expect(sb.boards[i].placements.map((p) => p.id).sort()).toEqual([...g.termIds].sort()));
  });
});

describe('TIME LINK（時代をまたぐ概念）', () => {
  const links = (id: string) => timeLinksOf(id, LIBRARY_BY_ID, HOME_STAGE_OF).map((t) => t.id).sort();

  it('高校受験の対比: 太陰暦 ↔ 太陽暦、60進法 ↔ 十進法', () => {
    expect(links('lunar_calendar')).toEqual(['solar_calendar']);
    expect(links('sexagesimal')).toEqual(['decimal']);
  });

  it('四大文明の文字がつながる: くさび形文字・象形文字・インダス文字・甲骨文字', () => {
    expect(links('cuneiform')).toEqual(['hieroglyph', 'indus_script', 'kanji', 'oracle']);
    expect(links('oracle')).toEqual(['cuneiform', 'hieroglyph', 'indus_script']);
  });

  it('四大文明の大河がつながる（同じ時代の川どうしは含めない）', () => {
    expect(links('nile')).toEqual(['euphrates', 'indus_river', 'tigris', 'yangtze', 'yellow_river']);
    expect(links('tigris')).toEqual(['indus_river', 'nile', 'yangtze', 'yellow_river']);
    expect(links('yellow_river')).not.toContain('yangtze');
  });

  it('書写材料・太陽神・巨大建造物・農耕でつながる', () => {
    expect(links('clay_tablet')).toEqual(['papyrus']);
    expect(links('shamash')).toEqual(['ra']);
    expect(links('ziggurat')).toEqual(['pyramid']);
    expect(links('farming')).toEqual(['millet', 'rice']);
  });

  it('河川文明: メソポタミア・エジプト・インダス文明', () => {
    expect(links('mesopotamia')).toEqual(['egypt', 'indus_civ']);
  });

  it('他の時代に同じ概念がない語は TIME LINK を持たない', () => {
    expect(links('pharaoh')).toEqual([]);
    expect(links('bronze')).toEqual([]);
  });

  it('時代内の LINK（relatedTermIds）は時代をまたがない', () => {
    for (const t of LIBRARY_TERMS) {
      for (const r of relatedIds(t.id, LIBRARY_BY_ID)) expect(HOME_STAGE_OF[r], `${t.id} → ${r}`).toBe(HOME_STAGE_OF[t.id]);
    }
  });

  it('概念索引に四大文明の文字が並ぶ', () => {
    const idx = conceptIndex(LIBRARY_BY_ID, HOME_STAGE_OF);
    expect(new Set(idx.WRITING_SYSTEM.map((x) => x.stageId))).toEqual(new Set(['mesopotamia', 'egypt', 'indus', 'china']));
  });
});

describe('秦の「法律」と「法家」', () => {
  it('秦の語は「法家」（思想）。一般名詞の「法律」ではない', () => {
    const t = LIBRARY_BY_ID.legalism;
    expect(t.display).toBe('法家');
    expect(t.crosswordAnswer).toBe('ホウカ');
    expect(t.wikipediaTitle).toBe('法家');
    expect(LIBRARY_TERMS.some((x) => x.display === '法律')).toBe(false);
    expect(LIBRARY_BY_ID.law).toBeUndefined();
  });

  it('法家 → 秦 → 始皇帝 がつながり、秦のクロスワードに入る', () => {
    expect(relatedIds('legalism', LIBRARY_BY_ID)).toEqual(expect.arrayContaining(['qin', 'shihuang']));
    expect(STAGES.find((s) => s.id === 'qin')!.crossword.termIds).toContain('legalism');
  });

  it('表示名・解答・Wikipedia 記事が同じものを指す（表示名が記事名の一部か、記事名が表示名の一部）', () => {
    // 記事が個別にない語（大浴場・印章など）は、その語を扱う上位の記事を指してよい。ここでは秦の語だけ厳密に確認する
    for (const t of LIBRARY_TERMS.filter((x) => HOME_STAGE_OF[x.id] === 'qin')) {
      if (!t.wikipediaTitle || ['coin', 'xianyang'].includes(t.id)) continue;
      expect(t.wikipediaTitle, t.id).toBe(t.display);
    }
  });
});
