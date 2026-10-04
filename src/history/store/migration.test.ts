import { describe, expect, it } from 'vitest';

import { addDiscovery, createArchive, sanitizeArchive } from '@/history/archive/archiveStore';
import { linkKey } from '@/history/archive/linkResolver';
import type { ArchiveState } from '@/history/archive/types';
import { STAGES_BY_ID, TERMS_BY_ID } from '@/history/data';
import { initialBoardIndex, buildStageBoards, nextTarget } from '@/history/stage/stageBoards';
import { applySolve, createStageProgress, isResolved, reconcileProgress } from '@/history/stage/stageState';
import type { StageProgress } from '@/history/stage/types';

/**
 * 保存データの移行。保存先（epoch:v2:*）は変えず、読み込み時に現在の語彙・盤面へ合わせる。
 * - 秦の「法律」（id: law）は「法家」（id: legalism）に差し替えた
 * - 盤面はスマートフォン向けに作り直した（盤面署名が変わる）
 */
describe('保存データの移行', () => {
  const qin = STAGES_BY_ID.qin;
  const sb = buildStageBoards(qin, TERMS_BY_ID);

  /** 旧語彙で秦を最後まで解き終えた保存データ */
  function oldQinSave(): StageProgress {
    const p = createStageProgress(qin, 'old-signature');
    const terms: StageProgress['terms'] = {};
    for (const id of [...qin.crossword.termIds.filter((x) => x !== 'legalism'), 'law']) {
      terms[id] = { discoverLevel: 0, result: 'SOLVED', attempts: 0, resolvedAt: 1 };
    }
    return { ...p, terms, cells: { '0:0:0': 'シ' }, completed: true, completedAt: 1 };
  }

  it('廃止した語（法律）の進捗は持ち越さず、解いた語の結果は残す', () => {
    const r = reconcileProgress(oldQinSave(), qin, sb.boards, sb.signature);
    expect(r.terms.law).toBeUndefined();
    expect(r.terms.legalism.result).toBeNull();
    expect(r.terms.shihuang.result).toBe('SOLVED');
    expect(r.boardSignature).toBe(sb.signature);
  });

  it('新しく入った語（法家）が未解答なので、完了扱いは取り消して解けるようにする', () => {
    const r = reconcileProgress(oldQinSave(), qin, sb.boards, sb.signature);
    expect(r.completed).toBe(false);
    // 解いた語のマスは新しい盤面に作り直される
    const solvedLetters = Object.values(r.cells).length;
    expect(solvedLetters).toBeGreaterThan(0);
    expect(r.cells['0:0:0']).toBeUndefined();
  });

  it('ARCHIVE から廃止した語と、その語に触れる LINK を取り除く', () => {
    let a: ArchiveState = createArchive();
    a = addDiscovery(a, { termId: 'qin', stageId: 'qin', source: 'CROSSWORD' }, TERMS_BY_ID, 1).archive;
    // 旧データ: law の記録と qin|law の LINK
    a = {
      ...a,
      entries: { ...a.entries, law: { termId: 'law', stageId: 'qin', source: 'CROSSWORD', discoveredAt: 2 } },
      links: { ...a.links, [linkKey('law', 'qin')]: { stageId: 'qin', foundAt: 2 } },
    };
    const s = sanitizeArchive(a, TERMS_BY_ID);
    expect(s.entries.law).toBeUndefined();
    expect(s.entries.qin).toBeDefined();
    expect(Object.keys(s.links).some((k) => k.split('|').includes('law'))).toBe(false);
  });

  it('現在の語彙どおりの ARCHIVE は変わらない', () => {
    let a: ArchiveState = createArchive();
    for (const id of ['qin', 'shihuang', 'legalism']) {
      a = addDiscovery(a, { termId: id, stageId: 'qin', source: 'CROSSWORD' }, TERMS_BY_ID, 1).archive;
    }
    expect(sanitizeArchive(a, TERMS_BY_ID)).toEqual(a);
  });
});

describe('盤面の切り替え（BOARD A / B）', () => {
  const egypt = STAGES_BY_ID.egypt;
  const sb = buildStageBoards(egypt, TERMS_BY_ID);

  it('EGYPT は意味で 2 枚に分かれ、見出しが付く', () => {
    expect(sb.boards).toHaveLength(2);
    expect(sb.labels).toEqual(['文明と暮らし', '技術と建造物']);
    expect(sb.boardIndexOf.egypt).toBe(0);
    expect(sb.boardIndexOf.pyramid).toBe(1);
  });

  it('BOARD A を解き終えたら、次は BOARD B の未解答の語', () => {
    const solvedA = new Set(sb.boards[0].placements.map((p) => p.id));
    const last = sb.boards[0].placements[sb.boards[0].placements.length - 1].id;
    const next = nextTarget(sb, 0, last, (id) => solvedA.has(id));
    expect(next?.boardIndex).toBe(1);
    expect(sb.boards[1].placements.map((p) => p.id)).toContain(next?.placement.id);
  });

  it('すべて解き終えたら次はない', () => {
    expect(nextTarget(sb, 1, null, () => true)).toBeNull();
  });

  it('再開時は未解答の残る盤面から始める', () => {
    let p = createStageProgress(egypt, sb.signature);
    for (const pl of sb.boards[0].placements) p = applySolve(p, sb.boards, pl.id, 1);
    expect(initialBoardIndex(sb, egypt.crossword.firstTermId, (id) => isResolved(p, id))).toBe(1);
    expect(initialBoardIndex(sb, egypt.crossword.firstTermId, () => false)).toBe(0);
  });

  it('BOARD B の語を解くと、そのマスは盤面番号 1 に記録される（進捗が混ざらない）', () => {
    let p = createStageProgress(egypt, sb.signature);
    p = applySolve(p, sb.boards, 'pyramid', 1);
    expect(Object.keys(p.cells).every((k) => k.startsWith('1:'))).toBe(true);
  });
});
