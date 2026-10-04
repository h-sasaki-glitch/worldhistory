import { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View, type LayoutChangeEvent } from 'react-native';

import { hashString } from '@/history/crossword/random';
import { buildLetterTiles, type AnswerCheck } from '@/history/input/answerInput';
import { TILE_GAP, tileLayout } from '@/history/input/tileLayout';

import { C, F } from '../theme';
import { feedbackText } from './feedback';

type Props = {
  termKey: string;
  answer: readonly string[];
  known: readonly (string | null)[];
  onSubmit: (cells: string[]) => AnswerCheck;
  /** 選んだ文字（未確定）を盤面のマスに表示するために通知する。位置ごとに文字か null */
  onPendingChange: (cells: (string | null)[]) => void;
};

/**
 * 「必要文字＋ダミー文字」の文字盤。選んだ文字は盤面のマスに直接入る。
 * ソフトキーボードを開かないので、スマホでも盤面が隠れない。
 * 長い語ではタイルを小さくせず、2 行に折り返す（tileLayout）。
 */
export function TileAnswerInput({ termKey, answer, known, onSubmit, onPendingChange }: Props) {
  const tiles = useMemo(() => buildLetterTiles(answer, known, hashString(termKey)), [answer, known, termKey]);
  const [picked, setPicked] = useState<number[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const [width, setWidth] = useState(0);

  const openSlots = useMemo(() => answer.map((_, i) => i).filter((i) => !known[i]), [answer, known]);

  useEffect(() => {
    setPicked([]);
    setMessage(null);
  }, [termKey]);

  useEffect(() => {
    onPendingChange(answer.map((_, i) => (known[i] ? null : (tiles[picked[openSlots.indexOf(i)]] ?? null))));
  }, [picked, answer, known, tiles, openSlots, onPendingChange]);

  const tap = (idx: number) => {
    if (picked.includes(idx) || picked.length >= openSlots.length) return;
    const next = [...picked, idx];
    setPicked(next);
    setMessage(null);
    if (next.length === openSlots.length) {
      const cells = answer.map((_, i) => known[i] ?? tiles[next[openSlots.indexOf(i)]]);
      const msg = feedbackText(onSubmit(cells));
      if (msg) {
        setMessage(msg);
        setTimeout(() => setPicked([]), 600);
      }
    }
  };

  const onLayout = (e: LayoutChangeEvent) => setWidth(e.nativeEvent.layout.width);
  // 文字タイル＋「⌫」。押しやすい大きさを保てなければ折り返す
  const { size, perRow, height } = tileLayout(width, tiles.length + 1);
  // 折り返したときも左端をそろえるため、行の幅を固定する
  const rowWidth = perRow * size + TILE_GAP * (perRow - 1);

  return (
    <View onLayout={onLayout}>
      {size > 0 && (
        <View style={[styles.row, { width: rowWidth }]}>
          {tiles.map((ch, i) => (
            <Pressable
              key={i}
              onPress={() => tap(i)}
              style={[styles.tile, { width: size, height }, picked.includes(i) && styles.tileUsed]}
              accessibilityRole="button"
              accessibilityLabel={ch}
            >
              <Text style={[styles.tileText, { fontSize: Math.max(14, size * 0.52) }]}>{ch}</Text>
            </Pressable>
          ))}
          <Pressable
            onPress={() => {
              setPicked((p) => p.slice(0, -1));
              setMessage(null);
            }}
            style={[styles.back, { width: size, height }]}
            accessibilityRole="button"
            accessibilityLabel="1文字消す"
          >
            <Text style={styles.backText}>⌫</Text>
          </Pressable>
        </View>
      )}
      {message && <Text style={styles.msg}>{message}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: TILE_GAP },
  tile: {
    backgroundColor: C.clay,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tileUsed: { opacity: 0.2 },
  tileText: { color: C.clayInk, fontFamily: F.ja, fontWeight: '700' },
  back: {
    borderRadius: 4,
    borderWidth: 1,
    borderColor: C.panelEdge,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backText: { color: C.textDim, fontSize: 18 },
  msg: { color: C.danger, fontFamily: F.ja, fontSize: 12, marginTop: 4 },
});
