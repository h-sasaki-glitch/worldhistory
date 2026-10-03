import { placementCells } from '@/history/crossword/geometry';
import type { Board } from '@/history/crossword/types';
import type { DiscoverLevel, DiscoveryResult } from '@/history/types';

import type { StageDefinition, StageProgress, TermProgress } from './types';

/**
 * ステージ進行の純粋関数群。React からは独立しており、すべて新しいオブジェクトを返す。
 */

export function createStageProgress(stage: StageDefinition, boardSignature: string): StageProgress {
  return {
    version: 1,
    stageId: stage.id,
    boardSignature,
    terms: Object.fromEntries(stage.crossword.termIds.map((id) => [id, emptyTerm()])),
    cells: {},
    firedEvents: [],
    backgroundDiscoveries: [],
    completed: false,
  };
}

function emptyTerm(): TermProgress {
  return { discoverLevel: 0, result: null, attempts: 0 };
}

function termOf(p: StageProgress, termId: string): TermProgress {
  return p.terms[termId] ?? emptyTerm();
}

function withTerm(p: StageProgress, termId: string, next: TermProgress): StageProgress {
  return { ...p, terms: { ...p.terms, [termId]: next } };
}

export function isResolved(p: StageProgress, termId: string): boolean {
  return termOf(p, termId).result !== null;
}

/** 「調べる」を 1 段階進める（最大 3）。解答済みの語は変化しない。 */
export function applyDiscover(p: StageProgress, termId: string): StageProgress {
  const t = termOf(p, termId);
  if (t.result !== null || t.discoverLevel >= 3) return p;
  return withTerm(p, termId, { ...t, discoverLevel: (t.discoverLevel + 1) as DiscoverLevel });
}

/** 正解時の学習結果: 調べた段階を記録する */
export function resultForSolve(level: DiscoverLevel): DiscoveryResult {
  return level === 0 ? 'SOLVED' : (`DISCOVER_${level}` as DiscoveryResult);
}

export function cellKeysFor(boardIndex: number, board: Board, termId: string): { key: string; ch: string }[] {
  const p = board.placements.find((x) => x.id === termId);
  if (!p) return [];
  return placementCells(p).map((pos, i) => ({ key: `${boardIndex}:${pos.row}:${pos.col}`, ch: p.cells[i] }));
}

function fillCells(p: StageProgress, boards: Board[], termId: string): Record<string, string> {
  const cells = { ...p.cells };
  boards.forEach((b, i) => {
    for (const { key, ch } of cellKeysFor(i, b, termId)) cells[key] = ch;
  });
  return cells;
}

function resolve(
  p: StageProgress,
  boards: Board[],
  termId: string,
  result: DiscoveryResult,
  now: number,
): StageProgress {
  const t = termOf(p, termId);
  if (t.result !== null) return p;
  return {
    ...withTerm(p, termId, { ...t, result, resolvedAt: now }),
    cells: fillCells(p, boards, termId),
  };
}

/** 自力（または「調べる」を経て）正解した */
export function applySolve(p: StageProgress, boards: Board[], termId: string, now: number): StageProgress {
  return resolve(p, boards, termId, resultForSolve(termOf(p, termId).discoverLevel), now);
}

/** 「答えを見る」を使った。進行は妨げず、完了扱いにする */
export function applyReveal(p: StageProgress, boards: Board[], termId: string, now: number): StageProgress {
  return resolve(p, boards, termId, 'ANSWERED', now);
}

export function recordAttempt(p: StageProgress, termId: string): StageProgress {
  const t = termOf(p, termId);
  return withTerm(p, termId, { ...t, attempts: t.attempts + 1 });
}

export function resolvedCount(p: StageProgress, stage: StageDefinition): number {
  return stage.crossword.termIds.filter((id) => isResolved(p, id)).length;
}

export function progressRatio(p: StageProgress, stage: StageDefinition): number {
  const total = stage.crossword.termIds.length;
  return total === 0 ? 0 : resolvedCount(p, stage) / total;
}

/** 進捗が閾値（約 50%）に達し、まだ発火していなければ true */
export function shouldFireMidEvent(p: StageProgress, stage: StageDefinition): boolean {
  return !p.firedEvents.includes(stage.midEvent.id) && progressRatio(p, stage) >= stage.midEvent.threshold;
}

export function markEventFired(p: StageProgress, eventId: string): StageProgress {
  if (p.firedEvents.includes(eventId)) return p;
  return { ...p, firedEvents: [...p.firedEvents, eventId] };
}

export function hasFired(p: StageProgress, eventId: string): boolean {
  return p.firedEvents.includes(eventId);
}

/** クロスワードの全語が SOLVED / DISCOVER_n / ANSWERED のいずれかになったか */
export function isCrosswordComplete(p: StageProgress, stage: StageDefinition): boolean {
  return stage.crossword.termIds.every((id) => isResolved(p, id));
}

export function markCompleted(p: StageProgress, stage: StageDefinition, now: number): StageProgress {
  if (p.completed || !isCrosswordComplete(p, stage)) return p;
  return { ...p, completed: true, completedAt: now };
}

export function addBackgroundDiscovery(p: StageProgress, termId: string): StageProgress {
  if (p.backgroundDiscoveries.includes(termId)) return p;
  return { ...p, backgroundDiscoveries: [...p.backgroundDiscoveries, termId] };
}

/**
 * 保存データを現在の盤面に合わせる。
 * 盤面署名が変わっていても、語ごとの学習結果は残し、セル状態だけを作り直す。
 */
export function reconcileProgress(
  saved: StageProgress | undefined,
  stage: StageDefinition,
  boards: Board[],
  signature: string,
): StageProgress {
  if (!saved || saved.version !== 1 || saved.stageId !== stage.id) {
    return createStageProgress(stage, signature);
  }
  const base: StageProgress = {
    ...createStageProgress(stage, signature),
    ...saved,
    terms: { ...createStageProgress(stage, signature).terms, ...saved.terms },
  };
  if (saved.boardSignature === signature) return base;
  let cells: Record<string, string> = {};
  const rebuilt = { ...base, boardSignature: signature, cells };
  for (const id of stage.crossword.termIds) {
    if (isResolved(rebuilt, id)) cells = fillCells({ ...rebuilt, cells }, boards, id);
  }
  // 語の入れ替えなどで未解答の語が増えた場合は、完了扱いを取り消す
  const completed = rebuilt.completed && isCrosswordComplete(rebuilt, stage);
  return { ...rebuilt, cells, completed, completedAt: completed ? rebuilt.completedAt : undefined };
}

/** 盤面上で現在わかっている文字（他の語の正解で埋まった交差セルなど） */
export function knownLetters(p: StageProgress, boardIndex: number, board: Board, termId: string): (string | null)[] {
  return cellKeysFor(boardIndex, board, termId).map(({ key }) => p.cells[key] ?? null);
}
