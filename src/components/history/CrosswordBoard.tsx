import { useMemo, useState } from 'react';
import { StyleSheet, View, type LayoutChangeEvent } from 'react-native';

import { containsCell } from '@/history/crossword/geometry';
import type { WordSelection } from '@/history/crossword/selection';
import type { Board } from '@/history/crossword/types';

import { CrosswordCell, type CellVisual } from './CrosswordCell';

type Props = {
  board: Board;
  boardIndex: number;
  /** 解けたセルの文字（キー "boardIndex:row:col"） */
  cells: Record<string, string>;
  selection: WordSelection | null;
  /** termId → 発光トークン（正解の瞬間に更新） */
  glow: Record<string, number>;
  onSelect: (row: number, col: number) => void;
};

const MAX_CELL = 44;

export function CrosswordBoard({ board, boardIndex, cells, selection, glow, onSelect }: Props) {
  const [area, setArea] = useState({ w: 0, h: 0 });
  const onLayout = (e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    setArea({ w: width, h: height });
  };
  const size = Math.floor(Math.min(MAX_CELL, area.w / Math.max(1, board.width), area.h / Math.max(1, board.height)));

  const selected = selection ? board.placements.find((p) => p.id === selection.placementId) : undefined;

  const items = useMemo(() => {
    const numbers = new Map<string, number>();
    for (const p of board.placements) numbers.set(`${p.row}:${p.col}`, p.number);
    const glowOf = new Map<string, number>();
    for (const p of board.placements) {
      const token = glow[p.id];
      if (!token) continue;
      p.cells.forEach((_, i) => {
        const r = p.direction === 'down' ? p.row + i : p.row;
        const c = p.direction === 'across' ? p.col + i : p.col;
        glowOf.set(`${r}:${c}`, Math.max(glowOf.get(`${r}:${c}`) ?? 0, token));
      });
    }
    const out: { row: number; col: number; letter: string | null; number?: number; visual: CellVisual; glow?: number }[] = [];
    for (let r = 0; r < board.height; r++) {
      for (let c = 0; c < board.width; c++) {
        if (board.grid[r][c] === null) continue;
        let visual: CellVisual = 'idle';
        if (selected && containsCell(selected, r, c) >= 0) {
          visual = selection && selection.row === r && selection.col === c ? 'active' : 'word';
        }
        out.push({
          row: r,
          col: c,
          letter: cells[`${boardIndex}:${r}:${c}`] ?? null,
          number: numbers.get(`${r}:${c}`),
          visual,
          glow: glowOf.get(`${r}:${c}`),
        });
      }
    }
    return out;
  }, [board, boardIndex, cells, selected, selection, glow]);

  return (
    <View style={styles.area} onLayout={onLayout}>
      {size > 0 && (
        <View style={{ width: size * board.width, height: size * board.height }}>
          {items.map((it) => (
            <CrosswordCell
              key={`${it.row}:${it.col}`}
              row={it.row}
              col={it.col}
              size={size}
              letter={it.letter}
              number={it.number}
              visual={it.visual}
              glowToken={it.glow}
              onPress={onSelect}
            />
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  area: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
