import { boardSignature, planBoards } from '@/history/crossword/generator';
import { toCells } from '@/history/crossword/normalizeJapanese';
import type { Board, CrosswordWord } from '@/history/crossword/types';
import type { HistoryTerm } from '@/history/types';

import type { StageDefinition } from './types';

export type StageBoards = {
  boards: Board[];
  signature: string;
  unplaced: string[];
  /** termId → 盤面番号（BOARD A = 0） */
  boardIndexOf: Record<string, number>;
};

const cache = new Map<string, StageBoards>();

/** ステージ定義から盤面を生成する（同一ステージは結果をキャッシュ） */
export function buildStageBoards(stage: StageDefinition, termsById: Record<string, HistoryTerm>): StageBoards {
  const cached = cache.get(stage.id);
  if (cached) return cached;
  const words: CrosswordWord[] = stage.crossword.termIds.map((id) => ({
    id,
    cells: toCells(termsById[id].crosswordAnswer),
  }));
  const plan = planBoards(words, { seed: stage.crossword.seed });
  const boardIndexOf: Record<string, number> = {};
  plan.boards.forEach((b, i) => b.placements.forEach((p) => (boardIndexOf[p.id] = i)));
  const result: StageBoards = {
    boards: plan.boards,
    signature: boardSignature(plan.boards),
    unplaced: plan.unplaced,
    boardIndexOf,
  };
  cache.set(stage.id, result);
  return result;
}

/** 盤面に入らなかった語は進行対象から外す（クロスワード都合で重要度は変えない） */
export function playableTermIds(stage: StageDefinition, sb: StageBoards): string[] {
  return stage.crossword.termIds.filter((id) => !sb.unplaced.includes(id));
}
