import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Screen } from '@/components/history/Screen';
import { C, F, caps } from '@/components/history/theme';
import { STAGES } from '@/history/data';
import { currentStop, journey } from '@/history/stage/journey';
import { useHistory } from '@/history/store/HistoryProvider';

/** タイトル画面。説明は置かず、時代へ飛び込む入口だけを示す。 */
export default function TitleScreen() {
  const { archive, stages } = useHistory();
  const stage = currentStop(journey(STAGES, stages)).stage;
  const progress = stages[stage.id];
  const started = Object.values(progress.terms).some((t) => t.result !== null);
  const discovered = Object.keys(archive.entries).length;

  return (
    <Screen>
      <View style={styles.wrap}>
        <View style={styles.top}>
          <Text style={styles.project}>PROJECT</Text>
          <Text style={styles.epoch}>EPOCH</Text>
          <View style={styles.rule} />
          <Text style={styles.tag}>言葉を拾い集める、時間旅行。</Text>
        </View>

        <View style={styles.stageBox}>
          <Text style={styles.stageNo}>STAGE {String(stage.number).padStart(2, '0')}</Text>
          <Text style={styles.stageTitle}>{stage.title}</Text>
          <Text style={styles.stageEra}>
            {stage.place} ・ {stage.eraLabel}
          </Text>
          <Pressable
            onPress={() => router.push(`/history/stage/${stage.id}`)}
            style={styles.go}
            accessibilityRole="button"
          >
            <Text style={styles.goText}>{progress.completed ? 'もう一度訪れる' : started ? '旅を続ける' : '時をさかのぼる'}</Text>
          </Pressable>
        </View>

        <View style={styles.links}>
          <Pressable onPress={() => router.push('/history/timeline')} hitSlop={10}>
            <Text style={styles.link}>TIMELINE</Text>
          </Pressable>
          <Text style={styles.sep}>・</Text>
          <Pressable onPress={() => router.push('/history/archive')} hitSlop={10}>
            <Text style={styles.link}>ARCHIVE {discovered > 0 ? discovered : ''}</Text>
          </Pressable>
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, paddingHorizontal: 32, justifyContent: 'space-between', paddingVertical: 48 },
  top: { alignItems: 'center', marginTop: 40 },
  project: { ...caps, fontSize: 12, letterSpacing: 10, color: C.textDim },
  epoch: { ...caps, fontSize: 52, letterSpacing: 16, color: '#f2dfb4', marginTop: 6 },
  rule: { width: 60, height: StyleSheet.hairlineWidth, backgroundColor: C.gold, marginVertical: 18 },
  tag: { fontFamily: F.ja, color: C.textDim, fontSize: 14, letterSpacing: 2 },
  stageBox: { alignItems: 'center' },
  stageNo: { ...caps, fontSize: 11, letterSpacing: 6 },
  stageTitle: { ...caps, fontSize: 28, letterSpacing: 8, color: C.sand, marginTop: 8 },
  stageEra: { fontFamily: F.latin, color: C.textDim, fontSize: 13, letterSpacing: 2, marginTop: 6 },
  go: {
    marginTop: 28,
    paddingVertical: 14,
    paddingHorizontal: 44,
    borderWidth: 1,
    borderColor: C.gold,
    backgroundColor: 'rgba(214,174,98,0.08)',
  },
  goText: { fontFamily: F.ja, color: '#f2dfb4', fontSize: 16, letterSpacing: 4 },
  links: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 12 },
  link: { ...caps, fontSize: 12, letterSpacing: 4, color: C.textDim },
  sep: { color: C.textFaint },
});
