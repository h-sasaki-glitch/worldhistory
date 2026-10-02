import type { CellPos, Direction, Placement } from './types';

export function step(direction: Direction): { dr: number; dc: number } {
  return direction === 'across' ? { dr: 0, dc: 1 } : { dr: 1, dc: 0 };
}

export function placementCells(p: Pick<Placement, 'row' | 'col' | 'direction' | 'cells'>): CellPos[] {
  const { dr, dc } = step(p.direction);
  return p.cells.map((_, i) => ({ row: p.row + dr * i, col: p.col + dc * i }));
}

export function containsCell(p: Placement, row: number, col: number): number {
  const { dr, dc } = step(p.direction);
  for (let i = 0; i < p.cells.length; i++) {
    if (p.row + dr * i === row && p.col + dc * i === col) return i;
  }
  return -1;
}

export function cellKey(row: number, col: number): string {
  return `${row}:${col}`;
}
