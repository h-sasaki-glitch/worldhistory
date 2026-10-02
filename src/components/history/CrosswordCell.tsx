import { memo, useEffect, useRef } from 'react';
import { Animated, Pressable, StyleSheet, Text } from 'react-native';

import { C, F } from './theme';

export type CellVisual = 'idle' | 'word' | 'active';

type Props = {
  row: number;
  col: number;
  size: number;
  letter: string | null;
  number?: number;
  visual: CellVisual;
  /** 値が変わるたびに軽く発光する（正解演出） */
  glowToken?: number;
  onPress: (row: number, col: number) => void;
};

function CrosswordCellImpl({ row, col, size, letter, number, visual, glowToken, onPress }: Props) {
  const glow = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!glowToken) return;
    glow.setValue(0);
    Animated.sequence([
      Animated.delay(((row + col) % 7) * 40),
      Animated.timing(glow, { toValue: 1, duration: 220, useNativeDriver: true }),
      Animated.timing(glow, { toValue: 0, duration: 900, useNativeDriver: true }),
    ]).start();
  }, [glowToken, glow, row, col]);

  const solved = letter !== null;
  const bg = solved
    ? visual === 'active'
      ? '#e8d4a6'
      : C.clay
    : visual === 'active'
      ? C.cellActive
      : visual === 'word'
        ? C.cellSelected
        : C.cellEmpty;
  const border = visual === 'idle' ? (solved ? C.clayDark : C.cellEdge) : C.gold;

  return (
    <Pressable
      onPress={() => onPress(row, col)}
      accessibilityRole="button"
      accessibilityLabel={letter ? `セル ${letter}` : `空きセル ${row + 1}行 ${col + 1}列`}
      style={[
        styles.cell,
        {
          left: col * size,
          top: row * size,
          width: size - 2,
          height: size - 2,
          backgroundColor: bg,
          borderColor: border,
          borderWidth: visual === 'active' ? 2 : 1,
        },
      ]}
    >
      {number !== undefined && (
        <Text style={[styles.num, { fontSize: Math.max(7, size * 0.26), color: solved ? C.clayInk : C.textDim }]}>
          {number}
        </Text>
      )}
      {letter && <Text style={[styles.letter, { fontSize: size * 0.56 }]}>{letter}</Text>}
      <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, styles.glow, { opacity: glow }]} />
    </Pressable>
  );
}

export const CrosswordCell = memo(CrosswordCellImpl);

const styles = StyleSheet.create({
  cell: {
    position: 'absolute',
    margin: 1,
    borderRadius: 3,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  num: {
    position: 'absolute',
    top: 1,
    left: 2,
    fontFamily: F.latin,
  },
  letter: {
    color: C.clayInk,
    fontFamily: F.ja,
    fontWeight: '700',
  },
  glow: {
    backgroundColor: '#ffe6a8',
    borderRadius: 3,
  },
});
