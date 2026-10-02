import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { C, F, caps } from './theme';

export type TimelineNode = {
  id: string;
  label: string;
  title: string;
  status: 'COMPLETE' | 'ARRIVED' | 'NEXT DESTINATION' | 'LOCKED';
  playable: boolean;
  /** 旅立てない時代をタップしたときの一言 */
  teaser?: string;
};

type Props = {
  nodes: TimelineNode[];
  onSelect: (id: string) => void;
};

/** 時代の年表。未実装の時代は COMING NEXT とだけ示す。 */
export function Timeline({ nodes, onSelect }: Props) {
  const [teaser, setTeaser] = useState<string | null>(null);
  return (
    <View style={styles.wrap}>
      {nodes.map((n, i) => (
        <View key={n.id}>
          <Pressable
            onPress={() => (n.playable ? onSelect(n.id) : setTeaser(n.id))}
            style={styles.node}
            accessibilityRole="button"
          >
            <View style={[styles.dot, n.status === 'COMPLETE' && styles.dotDone, n.status === 'NEXT DESTINATION' && styles.dotNext]} />
            <View style={{ flex: 1 }}>
              <Text style={styles.year}>{n.label}</Text>
              <Text style={[styles.title, !n.playable && styles.titleDim]}>{n.title}</Text>
              <Text style={[styles.status, n.status === 'NEXT DESTINATION' && styles.statusNext]}>{n.status}</Text>
              {teaser === n.id && <Text style={styles.teaser}>{n.teaser ?? 'COMING NEXT'}</Text>}
            </View>
          </Pressable>
          {i < nodes.length - 1 && (
            <View style={styles.arrowWrap}>
              <View style={styles.line} />
              <Text style={styles.arrow}>↓</Text>
              <View style={styles.line} />
            </View>
          )}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { paddingVertical: 8 },
  node: { flexDirection: 'row', gap: 18, alignItems: 'flex-start', paddingVertical: 10 },
  dot: { width: 12, height: 12, borderRadius: 6, borderWidth: 1, borderColor: C.textDim, marginTop: 6, marginLeft: 6 },
  dotDone: { backgroundColor: C.gold, borderColor: C.gold },
  dotNext: { borderColor: '#9fb3e6', borderWidth: 2 },
  year: { fontFamily: F.latin, color: C.textDim, fontSize: 13, letterSpacing: 2 },
  title: { ...caps, fontSize: 24, letterSpacing: 6, color: '#f2dfb4', marginTop: 2 },
  titleDim: { color: C.textDim },
  status: { ...caps, fontSize: 10, letterSpacing: 4, color: C.gold, marginTop: 4 },
  statusNext: { color: '#9fb3e6' },
  teaser: { ...caps, fontSize: 12, letterSpacing: 5, color: C.sand, marginTop: 10 },
  arrowWrap: { alignItems: 'flex-start', paddingLeft: 7 },
  line: { width: 1, height: 14, backgroundColor: C.panelEdge, marginLeft: 4 },
  arrow: { color: C.textFaint, fontSize: 12, marginLeft: -1 },
});
