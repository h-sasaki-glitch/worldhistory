import { containsCell } from './geometry';
import type { Board, Direction, Placement } from './types';

export type WordSelection = {
  placementId: string;
  direction: Direction;
  row: number;
  col: number;
};

export function placementsAt(board: Board, row: number, col: number): Placement[] {
  return board.placements.filter((p) => containsCell(p, row, col) >= 0);
}

/**
 * セルをタップしたときの選択語を決める。
 * - 同じ交差セルを再タップ → 方向を切り替える
 * - 選択中の語の中をタップ → その語のまま
 * - それ以外 → 未解答の語を優先し、同条件なら横を優先
 */
export function selectAt(
  board: Board,
  row: number,
  col: number,
  current: WordSelection | null,
  isResolved: (id: string) => boolean = () => false,
): WordSelection | null {
  const hits = placementsAt(board, row, col);
  if (hits.length === 0) return null;
  const across = hits.find((p) => p.direction === 'across');
  const down = hits.find((p) => p.direction === 'down');
  const make = (p: Placement): WordSelection => ({ placementId: p.id, direction: p.direction, row, col });

  if (current && current.row === row && current.col === col && across && down) {
    return make(current.direction === 'across' ? down : across);
  }
  const inCurrent = current ? hits.find((p) => p.id === current.placementId) : undefined;
  if (inCurrent) return make(inCurrent);

  if (across && down) {
    if (isResolved(across.id) && !isResolved(down.id)) return make(down);
    return make(across);
  }
  return make((across ?? down)!);
}

/** 語の先頭セルを選択した状態を作る */
export function selectPlacement(p: Placement): WordSelection {
  return { placementId: p.id, direction: p.direction, row: p.row, col: p.col };
}

/** 指定語の次（番号順・循環）にある未解答の語 */
export function nextUnresolved(
  board: Board,
  afterId: string | null,
  isResolved: (id: string) => boolean,
): Placement | null {
  const list = board.placements;
  if (list.length === 0) return null;
  const start = afterId ? list.findIndex((p) => p.id === afterId) : -1;
  for (let k = 1; k <= list.length; k++) {
    const p = list[(start + k + list.length) % list.length];
    if (!isResolved(p.id)) return p;
  }
  return null;
}
