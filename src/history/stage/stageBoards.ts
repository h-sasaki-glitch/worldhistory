import { boardSignature, generateBoard, planBoards } from '@/history/crossword/generator';
import { toCells } from '@/history/crossword/normalizeJapanese';
import { nextUnresolved } from '@/history/crossword/selection';
import type { Board, CrosswordWord, GeneratorOptions, Placement } from '@/history/crossword/types';
import type { HistoryTerm } from '@/history/types';

import type { StageDefinition } from './types';

export type StageBoards = {
  boards: Board[];
  signature: string;
  unplaced: string[];
  /** termId → 盤面番号（BOARD A = 0） */
  boardIndexOf: Record<string, number>;
  /** 盤面ごとのタブの見出し（グループ指定がない場合は undefined） */
  labels: (string | undefined)[];
};

/**
 * スマートフォン縦画面向けの盤面の大きさ。
 * - 長辺 12 マス: 幅 375px で 1 マス 30px
 * - 短辺 8 マス: 375×560 で手がかりパネルが 2 段（約 195px）になっても 1 マス 28px 以上
 * - 縦長の盤面は転置して横長にそろえる（盤面の領域は横長のため）
 * layout.test.ts で、この制約のもと全ステージのマスが 28px 以上になることを検証する。
 */
export const PHONE_BOARD_LIMITS: Partial<GeneratorOptions> = { maxGridSize: 12, maxShortSide: 8, landscape: true };

const cache = new Map<string, StageBoards>();

/** ステージ定義から盤面を生成する（同一ステージは結果をキャッシュ） */
export function buildStageBoards(stage: StageDefinition, termsById: Record<string, HistoryTerm>): StageBoards {
  const cached = cache.get(stage.id);
  if (cached) return cached;
  const toWords = (ids: string[]): CrosswordWord[] =>
    ids.map((id) => ({ id, cells: toCells(termsById[id].crosswordAnswer) }));
  const opts = { ...PHONE_BOARD_LIMITS, seed: stage.crossword.seed };
  const groups = stage.crossword.boards;
  let plan: { boards: Board[]; unplaced: string[] };
  if (groups?.length) {
    // 指定どおりに分ける。各グループは別のシードで 1 枚ずつ生成する
    const made = groups.map((g, i) => generateBoard(toWords(g.termIds), { ...opts, seed: opts.seed + i }));
    plan = { boards: made.map((m) => m.board), unplaced: made.flatMap((m) => m.unplaced) };
  } else {
    plan = planBoards(toWords(stage.crossword.termIds), opts);
  }
  const boardIndexOf: Record<string, number> = {};
  plan.boards.forEach((b, i) => b.placements.forEach((p) => (boardIndexOf[p.id] = i)));
  const result: StageBoards = {
    boards: plan.boards,
    signature: boardSignature(plan.boards),
    unplaced: plan.unplaced,
    boardIndexOf,
    labels: plan.boards.map((_, i) => groups?.[i]?.label),
  };
  cache.set(stage.id, result);
  return result;
}

/** 盤面に入らなかった語は進行対象から外す（クロスワード都合で重要度は変えない） */
export function playableTermIds(stage: StageDefinition, sb: StageBoards): string[] {
  return stage.crossword.termIds.filter((id) => !sb.unplaced.includes(id));
}

/** 盤面のタブ見出し: "BOARD A" または "A 文明と暮らし" */
export function boardTabLabel(sb: StageBoards, index: number): string {
  const letter = String.fromCharCode(65 + index);
  const label = sb.labels[index];
  return label ? `${letter} ${label}` : `BOARD ${letter}`;
}

/**
 * 次に解く語。いまの盤面に未解答が残っていればその中から、なければ未解答の残る次の盤面へ移る。
 * 全盤面を解き終えたら null。
 */
export function nextTarget(
  sb: StageBoards,
  boardIndex: number,
  afterId: string | null,
  isResolved: (id: string) => boolean,
): { boardIndex: number; placement: Placement } | null {
  const here = sb.boards[boardIndex] ? nextUnresolved(sb.boards[boardIndex], afterId, isResolved) : null;
  if (here) return { boardIndex, placement: here };
  for (let k = 1; k < sb.boards.length; k++) {
    const j = (boardIndex + k) % sb.boards.length;
    const p = nextUnresolved(sb.boards[j], null, isResolved);
    if (p) return { boardIndex: j, placement: p };
  }
  return null;
}

/** 最初に開く盤面: firstTermId があればその盤面、なければ未解答の残る最初の盤面 */
export function initialBoardIndex(
  sb: StageBoards,
  firstTermId: string | undefined,
  isResolved: (id: string) => boolean,
): number {
  if (firstTermId && !isResolved(firstTermId) && sb.boardIndexOf[firstTermId] !== undefined) {
    return sb.boardIndexOf[firstTermId];
  }
  const i = sb.boards.findIndex((b) => b.placements.some((p) => !isResolved(p.id)));
  return i < 0 ? 0 : i;
}
