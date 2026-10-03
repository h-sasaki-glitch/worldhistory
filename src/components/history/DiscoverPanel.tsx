import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { discoverLevel1, discoverLevel2, letterHint } from '@/history/stage/discover';
import type { DiscoverLevel, HistoryTerm } from '@/history/types';

import { C, F, caps } from './theme';

type Props = {
  term: HistoryTerm;
  cells: readonly string[];
  level: DiscoverLevel;
  onReveal: () => void;
};

/** 「調べる」で開いた情報。段階ごとに 1 行ずつ増える。LEVEL 3 の横に「答えを見る」。 */
export function DiscoverPanel({ term, cells, level, onReveal }: Props) {
  if (level === 0) return null;
  return (
    <View style={styles.wrap}>
      {level >= 1 && <Row n={1} text={discoverLevel1(term)} />}
      {level >= 2 && <Row n={2} text={discoverLevel2(term)} />}
      {level >= 3 && (
        <Row
          n={3}
          text={letterHint(cells).join(' ')}
          spaced
          trailing={
            <Pressable onPress={onReveal} hitSlop={8} accessibilityRole="button">
              <Text style={styles.reveal}>答えを見る</Text>
            </Pressable>
          }
        />
      )}
    </View>
  );
}

function Row({ n, text, spaced, trailing }: { n: number; text: string; spaced?: boolean; trailing?: ReactNode }) {
  return (
    <View style={styles.row}>
      <Text style={styles.label}>DISCOVER {n}</Text>
      <Text style={[styles.text, spaced && styles.spaced]}>{text}</Text>
      {trailing}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 2, marginTop: 6 },
  row: { flexDirection: 'row', alignItems: 'baseline', gap: 8 },
  label: { ...caps, fontSize: 8, letterSpacing: 1.5, color: C.lapis, width: 62 },
  text: { flex: 1, color: C.sand, fontFamily: F.ja, fontSize: 12, lineHeight: 17 },
  spaced: { fontSize: 15, letterSpacing: 2 },
  reveal: { color: C.textDim, fontFamily: F.ja, fontSize: 11, textDecorationLine: 'underline' },
});
