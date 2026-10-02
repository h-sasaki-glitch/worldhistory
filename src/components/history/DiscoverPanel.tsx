import { StyleSheet, Text, View } from 'react-native';

import { discoverLevel1, discoverLevel2, letterHint } from '@/history/stage/discover';
import type { DiscoverLevel, HistoryTerm } from '@/history/types';

import { C, F, caps } from './theme';

type Props = {
  term: HistoryTerm;
  cells: readonly string[];
  level: DiscoverLevel;
};

/** 「調べる」で開いた情報。段階ごとに 1 行ずつ増える。 */
export function DiscoverPanel({ term, cells, level }: Props) {
  if (level === 0) return null;
  return (
    <View style={styles.wrap}>
      {level >= 1 && <Row n={1} text={discoverLevel1(term)} />}
      {level >= 2 && <Row n={2} text={discoverLevel2(term)} />}
      {level >= 3 && <Row n={3} text={letterHint(cells).join(' ')} spaced />}
    </View>
  );
}

function Row({ n, text, spaced }: { n: number; text: string; spaced?: boolean }) {
  return (
    <View style={styles.row}>
      <Text style={styles.label}>DISCOVER {n}</Text>
      <Text style={[styles.text, spaced && styles.spaced]}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: 4,
    paddingTop: 8,
    marginTop: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: C.panelEdge,
  },
  row: { flexDirection: 'row', alignItems: 'baseline', gap: 10 },
  label: { ...caps, fontSize: 9, letterSpacing: 2, color: C.lapis, width: 74 },
  text: { flex: 1, color: C.sand, fontFamily: F.ja, fontSize: 13, lineHeight: 19 },
  spaced: { fontSize: 16, letterSpacing: 2 },
});
