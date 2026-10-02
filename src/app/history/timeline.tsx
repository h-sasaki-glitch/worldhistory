import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Screen } from '@/components/history/Screen';
import { C, F, caps } from '@/components/history/theme';
import { Timeline, type TimelineNode } from '@/components/history/Timeline';
import { STAGES } from '@/history/data';
import { useHistory } from '@/history/store/HistoryProvider';

/** タイムライン。実装済みの時代と、次の目的地（未実装）を並べる。 */
export default function TimelineScreen() {
  const { stages } = useHistory();

  const nodes: TimelineNode[] = [];
  for (const s of STAGES) {
    const p = stages[s.id];
    const started = Object.values(p.terms).some((t) => t.result !== null);
    nodes.push({
      id: s.id,
      label: s.timelineLabel,
      title: s.title,
      status: p.completed ? 'COMPLETE' : started ? 'ARRIVED' : 'NEXT DESTINATION',
      playable: true,
    });
    if (s.nextStage && !STAGES.some((x) => x.id === s.nextStage!.id)) {
      nodes.push({
        id: s.nextStage.id,
        label: s.nextStage.timelineLabel,
        title: s.nextStage.title,
        status: p.completed ? 'NEXT DESTINATION' : 'LOCKED',
        playable: false,
      });
    }
  }

  return (
    <Screen>
      <View style={styles.header}>
        <Pressable onPress={() => router.replace('/history')} hitSlop={12}>
          <Text style={styles.back}>‹</Text>
        </Pressable>
        <Text style={styles.title}>TIMELINE</Text>
      </View>
      <ScrollView contentContainerStyle={styles.body}>
        <Text style={styles.lead}>WORLD HISTORY</Text>
        <Timeline nodes={nodes} onSelect={(id) => router.push(`/history/stage/${id}`)} />
        <Pressable onPress={() => router.push('/history/archive')} style={styles.archive}>
          <Text style={styles.archiveText}>ARCHIVE</Text>
        </Pressable>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingVertical: 14 },
  back: { color: C.sand, fontSize: 28, lineHeight: 28 },
  title: { ...caps, fontSize: 13, letterSpacing: 6 },
  body: { paddingHorizontal: 28, paddingVertical: 24 },
  lead: { fontFamily: F.latin, color: C.textFaint, fontSize: 11, letterSpacing: 6, marginBottom: 18 },
  archive: { marginTop: 40, alignSelf: 'flex-start', borderWidth: 1, borderColor: C.panelEdge, paddingVertical: 8, paddingHorizontal: 16 },
  archiveText: { ...caps, fontSize: 11, color: C.textDim },
});
