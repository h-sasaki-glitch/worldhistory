import { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { hashString } from '@/history/crossword/random';
import { buildLetterTiles, type AnswerCheck } from '@/history/input/answerInput';

import { C, F } from '../theme';
import { feedbackText } from './feedback';

type Props = {
  termKey: string;
  answer: readonly string[];
  known: readonly (string | null)[];
  onSubmit: (cells: string[]) => AnswerCheck;
};

/** 「必要文字＋ダミー文字」の文字盤から選ぶ入力 */
export function TileAnswerInput({ termKey, answer, known, onSubmit }: Props) {
  const tiles = useMemo(() => buildLetterTiles(answer, known, hashString(termKey)), [answer, known, termKey]);
  const [picked, setPicked] = useState<number[]>([]);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    setPicked([]);
    setMessage(null);
  }, [termKey]);

  const openSlots = answer.map((_, i) => i).filter((i) => !known[i]);
  const slots = answer.map((_, i) => {
    if (known[i]) return { ch: known[i]!, fixed: true };
    const order = openSlots.indexOf(i);
    const tileIdx = picked[order];
    return { ch: tileIdx === undefined ? null : tiles[tileIdx], fixed: false };
  });

  const tap = (idx: number) => {
    if (picked.includes(idx) || picked.length >= openSlots.length) return;
    const next = [...picked, idx];
    setPicked(next);
    setMessage(null);
    if (next.length === openSlots.length) {
      const cells = answer.map((_, i) => known[i] ?? tiles[next[openSlots.indexOf(i)]]);
      const r = onSubmit(cells);
      const msg = feedbackText(r);
      if (msg) {
        setMessage(msg);
        setTimeout(() => setPicked([]), 500);
      }
    }
  };

  return (
    <View style={styles.wrap}>
      <View style={styles.slots}>
        {slots.map((s, i) => (
          <Pressable
            key={i}
            onPress={() => !s.fixed && setPicked((p) => p.slice(0, Math.max(0, openSlots.indexOf(i))))}
            style={[styles.slot, s.fixed && styles.slotFixed]}
          >
            <Text style={[styles.slotText, s.fixed && styles.slotTextFixed]}>{s.ch ?? ''}</Text>
          </Pressable>
        ))}
      </View>
      <View style={styles.tiles}>
        {tiles.map((ch, i) => (
          <Pressable
            key={i}
            onPress={() => tap(i)}
            style={[styles.tile, picked.includes(i) && styles.tileUsed]}
            accessibilityRole="button"
            accessibilityLabel={ch}
          >
            <Text style={styles.tileText}>{ch}</Text>
          </Pressable>
        ))}
      </View>
      {message && <Text style={styles.msg}>{message}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 8 },
  slots: { flexDirection: 'row', gap: 4, flexWrap: 'wrap' },
  slot: {
    width: 30,
    height: 32,
    borderBottomWidth: 2,
    borderBottomColor: C.gold,
    alignItems: 'center',
    justifyContent: 'center',
  },
  slotFixed: { borderBottomColor: C.clayDark },
  slotText: { color: C.sand, fontFamily: F.ja, fontSize: 18 },
  slotTextFixed: { color: C.clayDark },
  tiles: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  tile: {
    width: 36,
    height: 36,
    backgroundColor: C.clay,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tileUsed: { opacity: 0.2 },
  tileText: { color: C.clayInk, fontFamily: F.ja, fontSize: 18, fontWeight: '700' },
  msg: { color: C.danger, fontFamily: F.ja, fontSize: 13 },
});
