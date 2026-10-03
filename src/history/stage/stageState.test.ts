import { describe, expect, it } from 'vitest';

import { MESOPOTAMIA_STAGE } from '@/history/data/stages/mesopotamia';
import { getTerm, TERMS_BY_ID } from '@/history/data';
import { toCells } from '@/history/crossword/normalizeJapanese';

import { discoverLevel1, discoverLevel2, letterHint } from './discover';
import { buildStageBoards } from './stageBoards';
import {
  applyDiscover,
  applyReveal,
  applySolve,
  createStageProgress,
  isCrosswordComplete,
  knownLetters,
  markCompleted,
  markEventFired,
  progressRatio,
  reconcileProgress,
  shouldFireMidEvent,
  addBackgroundDiscovery,
} from './stageState';

const stage = MESOPOTAMIA_STAGE;
const sb = buildStageBoards(stage, TERMS_BY_ID);
const ids = stage.crossword.termIds;
const fresh = () => createStageProgress(stage, sb.signature);

describe('Stage progress', () => {
  it('50% 到達で Hammurabi イベントが発火する', () => {
    let p = fresh();
    p = applySolve(p, sb.boards, ids[0], 1);
    p = applySolve(p, sb.boards, ids[1], 2);
    p = applySolve(p, sb.boards, ids[2], 3);
    expect(progressRatio(p, stage)).toBe(3 / 8);
    expect(shouldFireMidEvent(p, stage)).toBe(false);
    p = applySolve(p, sb.boards, ids[3], 4);
    expect(progressRatio(p, stage)).toBe(0.5);
    expect(shouldFireMidEvent(p, stage)).toBe(true);
  });

  it('イベントは 1 回のみ', () => {
    let p = fresh();
    for (const id of ids.slice(0, 4)) p = applySolve(p, sb.boards, id, 1);
    expect(shouldFireMidEvent(p, stage)).toBe(true);
    p = markEventFired(p, stage.midEvent.id);
    expect(shouldFireMidEvent(p, stage)).toBe(false);
    p = applySolve(p, sb.boards, ids[4], 5);
    expect(shouldFireMidEvent(p, stage)).toBe(false);
    p = markEventFired(p, stage.midEvent.id);
    expect(p.firedEvents.filter((e) => e === stage.midEvent.id)).toHaveLength(1);
  });

  it('ANSWERED（答えを見る）も完了扱い・進捗に数える', () => {
    let p = fresh();
    for (const id of ids) p = applyReveal(p, sb.boards, id, 1);
    expect(progressRatio(p, stage)).toBe(1);
    expect(isCrosswordComplete(p, stage)).toBe(true);
    expect(Object.values(p.terms).every((t) => t.result === 'ANSWERED')).toBe(true);
  });

  it('全語完了で stage completed になる（未完了では completed にならない）', () => {
    let p = fresh();
    for (const id of ids.slice(0, 7)) p = applySolve(p, sb.boards, id, 1);
    expect(markCompleted(p, stage, 10).completed).toBe(false);
    p = applyReveal(p, sb.boards, ids[7], 2);
    p = markCompleted(p, stage, 10);
    expect(p.completed).toBe(true);
    expect(p.completedAt).toBe(10);
  });

  it('調べた段階が DiscoveryResult として保存される', () => {
    let p = fresh();
    p = applySolve(p, sb.boards, 'babylon', 1);
    expect(p.terms.babylon.result).toBe('SOLVED');

    p = applyDiscover(p, 'cuneiform');
    p = applyDiscover(p, 'cuneiform');
    p = applySolve(p, sb.boards, 'cuneiform', 2);
    expect(p.terms.cuneiform.result).toBe('DISCOVER_2');

    for (let i = 0; i < 5; i++) p = applyDiscover(p, 'sumer');
    expect(p.terms.sumer.discoverLevel).toBe(3);
    p = applySolve(p, sb.boards, 'sumer', 3);
    expect(p.terms.sumer.result).toBe('DISCOVER_3');

    // 一度確定した結果は上書きされない
    p = applyReveal(p, sb.boards, 'sumer', 4);
    expect(p.terms.sumer.result).toBe('DISCOVER_3');
  });

  it('正解した語のセルが埋まり、交差する語の既知文字になる', () => {
    let p = fresh();
    p = applySolve(p, sb.boards, 'cuneiform', 1);
    const board = sb.boards[0];
    const crossingIds = board.placements
      .filter((x) => x.id !== 'cuneiform')
      .filter((x) => knownLetters(p, 0, board, x.id).some((ch) => ch !== null));
    expect(crossingIds.length).toBeGreaterThan(0);
    for (const x of crossingIds) {
      const known = knownLetters(p, 0, board, x.id);
      known.forEach((ch, i) => ch && expect(ch).toBe(x.cells[i]));
    }
  });

  it('背景 DISCOVERY は重複しない', () => {
    let p = fresh();
    p = addBackgroundDiscovery(p, 'tigris');
    p = addBackgroundDiscovery(p, 'tigris');
    expect(p.backgroundDiscoveries).toEqual(['tigris']);
  });

  it('語が入れ替わって未解答の語がある場合、保存された完了扱いを取り消す', () => {
    const stale = { ...fresh(), boardSignature: 'old', completed: true, completedAt: 1 };
    const r = reconcileProgress(stale, stage, sb.boards, sb.signature);
    expect(r.completed).toBe(false);
    expect(r.completedAt).toBeUndefined();
  });

  it('盤面署名が変わっても学習結果を保ち、セルを作り直す', () => {
    let p = fresh();
    p = applySolve(p, sb.boards, 'babylon', 1);
    const stale = { ...p, boardSignature: 'old', cells: { 'x:y:z': 'ア' } };
    const r = reconcileProgress(stale, stage, sb.boards, sb.signature);
    expect(r.terms.babylon.result).toBe('SOLVED');
    expect(r.cells['x:y:z']).toBeUndefined();
    expect(Object.values(r.cells).sort()).toEqual([...toCells('バビロン')].sort());
  });
});

describe('DISCOVER (調べる)', () => {
  it('LEVEL 1 はカテゴリーと地域、LEVEL 2 は追加情報', () => {
    expect(discoverLevel1(getTerm('cuneiform'))).toContain('文字・記録');
    expect(discoverLevel2(getTerm('cuneiform'))).toBe('線の形が、木を割るときに使う道具に似ています。');
  });

  it('LEVEL 3 は文字ヒント（クサビガタモジ → ク サ ビ _ タ モ ジ）', () => {
    expect(letterHint(toCells('クサビガタモジ')).join(' ')).toBe('ク サ ビ _ タ モ ジ');
    for (const id of ids) {
      const cells = toCells(TERMS_BY_ID[id].crosswordAnswer);
      const hint = letterHint(cells);
      expect(hint.filter((c) => c === '_').length).toBeGreaterThanOrEqual(1);
      expect(hint.filter((c) => c === '_').length).toBeLessThan(cells.length);
    }
  });
});
