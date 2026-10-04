import { useEffect, useRef } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';

import type { StageSummary } from '@/history/archive/archiveStore';
import type { StageDefinition } from '@/history/stage/types';

import { C, F, caps } from './theme';

type Props = {
  stage: StageDefinition;
  summary: StageSummary;
  /** 次の目的地（visitYear で決まる。最後の時代なら予告、なければ省略） */
  next?: { title: string; timelineLabel: string };
  onNext: () => void;
  onArchive: () => void;
};

/** ステージ終了画面。スコアや星ではなく「何を発見したか」だけを残す。 */
export function StageComplete({ stage, summary, next, onNext, onArchive }: Props) {
  const a = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(a, { toValue: 1, duration: 900, useNativeDriver: true }).start();
  }, [a]);

  return (
    <Animated.View style={[StyleSheet.absoluteFill, styles.wrap, { opacity: a }]}>
      <View style={styles.inner}>
        <Text style={styles.place}>{stage.place}</Text>
        <Text style={styles.era}>{stage.eraLabel}</Text>

        <View style={styles.rule} />

        <View style={styles.row}>
          <Text style={styles.key}>DISCOVERED</Text>
          <Text style={styles.big}>{summary.discovered}</Text>
        </View>
        {summary.groups.map((g) => (
          <View key={g.label} style={styles.row}>
            <Text style={styles.keySmall}>{g.label}</Text>
            <Text style={styles.val}>{g.count}</Text>
          </View>
        ))}
        <View style={[styles.row, { marginTop: 10 }]}>
          <Text style={styles.key}>NEW LINKS</Text>
          <Text style={styles.big}>{summary.newLinks}</Text>
        </View>

        <View style={styles.rule} />

        <Text style={styles.farewell}>{stage.completion.farewell}</Text>

        <Pressable onPress={onNext} style={styles.next} accessibilityRole="button">
          <Text style={styles.nextText}>次の時代へ</Text>
          {next && (
            <Text style={styles.nextDest}>
              {next.title} ・ {next.timelineLabel}
            </Text>
          )}
        </Pressable>
        <Pressable onPress={onArchive} hitSlop={8} accessibilityRole="button">
          <Text style={styles.archive}>ARCHIVE を見る</Text>
        </Pressable>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: { backgroundColor: 'rgba(6,5,8,0.96)', alignItems: 'center', justifyContent: 'center', zIndex: 40 },
  inner: { width: '100%', maxWidth: 360, paddingHorizontal: 32 },
  place: { ...caps, fontSize: 28, letterSpacing: 9, color: '#f2dfb4', textAlign: 'center' },
  era: { ...caps, fontSize: 13, color: C.textDim, textAlign: 'center', marginTop: 4 },
  rule: { height: StyleSheet.hairlineWidth, backgroundColor: C.gold, opacity: 0.6, marginVertical: 22 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', paddingVertical: 3 },
  key: { ...caps, fontSize: 13, letterSpacing: 4 },
  keySmall: { ...caps, fontSize: 11, letterSpacing: 3, color: C.textDim, paddingLeft: 14 },
  big: { fontFamily: F.latin, fontSize: 24, color: C.sand },
  val: { fontFamily: F.latin, fontSize: 15, color: C.sand },
  farewell: { fontFamily: F.ja, color: C.sand, fontSize: 15, textAlign: 'center', lineHeight: 24 },
  next: {
    marginTop: 28,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: C.gold,
    backgroundColor: 'rgba(214,174,98,0.08)',
  },
  nextText: { fontFamily: F.ja, color: '#f2dfb4', fontSize: 16, letterSpacing: 4 },
  nextDest: { ...caps, fontSize: 10, letterSpacing: 3, color: C.textDim, marginTop: 4 },
  archive: { ...caps, fontSize: 11, color: C.textDim, textAlign: 'center', marginTop: 16 },
});
