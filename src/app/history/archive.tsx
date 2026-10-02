import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Screen } from '@/components/history/Screen';
import { C, F, caps } from '@/components/history/theme';
import { connectionsOf } from '@/history/archive/linkResolver';
import { ARCHIVE_SECTIONS, SECTION_OF } from '@/history/archive/types';
import { ALL_TERMS, TERMS_BY_ID } from '@/history/data';
import { useHistory } from '@/history/store/HistoryProvider';

/** ARCHIVE: 発見した人物・場所・出来事の記録。未発見はシルエットで示す。 */
export default function ArchiveScreen() {
  const { archive } = useHistory();
  const discovered = Object.keys(archive.entries).length;
  const links = Object.keys(archive.links).length;

  return (
    <Screen>
      <View style={styles.header}>
        <Pressable onPress={() => (router.canGoBack() ? router.back() : router.replace('/history'))} hitSlop={12}>
          <Text style={styles.back}>‹</Text>
        </Pressable>
        <Text style={styles.title}>ARCHIVE</Text>
        <View style={{ flex: 1 }} />
        <Text style={styles.stat}>
          {discovered} / {ALL_TERMS.length}
        </Text>
        <Text style={styles.statLinks}>{links} LINKS</Text>
      </View>

      <ScrollView contentContainerStyle={styles.body}>
        {ARCHIVE_SECTIONS.map((section) => {
          const terms = ALL_TERMS.filter((t) => SECTION_OF[t.category] === section);
          if (terms.length === 0) return null;
          return (
            <View key={section} style={styles.section}>
              <Text style={styles.sectionTitle}>{section}</Text>
              <View style={styles.grid}>
                {terms.map((t) => {
                  const found = !!archive.entries[t.id];
                  if (!found) {
                    return (
                      <View key={t.id} style={[styles.tile, styles.tileUnknown]}>
                        <Text style={styles.unknown}>？？？</Text>
                        <Text style={styles.unknownSub}>UNDISCOVERED</Text>
                      </View>
                    );
                  }
                  const c = connectionsOf(t.id, archive, TERMS_BY_ID);
                  return (
                    <Pressable
                      key={t.id}
                      onPress={() => router.push(`/history/term/${t.id}`)}
                      style={styles.tile}
                      accessibilityRole="button"
                    >
                      <Text style={styles.en} numberOfLines={1}>
                        {t.nameEn}
                      </Text>
                      <Text style={styles.ja} numberOfLines={1}>
                        {t.display}
                      </Text>
                      <Text style={styles.linkCount}>
                        {c.found} / {c.total} LINKS
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>
          );
        })}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: C.panelEdge,
  },
  back: { color: C.sand, fontSize: 28, lineHeight: 28 },
  title: { ...caps, fontSize: 18, letterSpacing: 6, color: '#f2dfb4' },
  stat: { fontFamily: F.latin, color: C.sand, fontSize: 14 },
  statLinks: { ...caps, fontSize: 10, color: '#9fb3e6' },
  body: { padding: 16, paddingBottom: 40, gap: 22 },
  section: { gap: 10 },
  sectionTitle: { ...caps, fontSize: 11, letterSpacing: 5 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  tile: {
    width: '47%',
    flexGrow: 1,
    padding: 12,
    minHeight: 84,
    borderWidth: 1,
    borderColor: 'rgba(214,174,98,0.35)',
    backgroundColor: 'rgba(30,24,19,0.9)',
  },
  tileUnknown: {
    borderColor: C.panelEdge,
    borderStyle: 'dashed',
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  unknown: { color: C.textFaint, fontSize: 16, letterSpacing: 4 },
  unknownSub: { ...caps, fontSize: 8, color: C.textFaint, letterSpacing: 3, marginTop: 4 },
  en: { ...caps, fontSize: 12, letterSpacing: 3, color: '#f2dfb4' },
  ja: { fontFamily: F.ja, color: C.sand, fontSize: 16, marginTop: 4 },
  linkCount: { ...caps, fontSize: 9, letterSpacing: 2, color: C.textDim, marginTop: 8 },
});
