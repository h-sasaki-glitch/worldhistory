import { router, useLocalSearchParams } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { Linking, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { ArchiveCard } from '@/components/history/ArchiveCard';
import { Screen } from '@/components/history/Screen';
import { C, F, caps } from '@/components/history/theme';
import { connectionsOf, timeLinksOf } from '@/history/archive/linkResolver';
import { HOME_STAGE_OF, STAGES_BY_ID, TERMS_BY_ID, wikipediaUrl } from '@/history/data';
import { useHistory } from '@/history/store/HistoryProvider';

/** DISCOVERY 詳細。Wikipedia は押した場合のみ外部で開く。 */
export default function TermScreen() {
  const { termId } = useLocalSearchParams<{ termId: string }>();
  const { archive } = useHistory();
  const term = termId ? TERMS_BY_ID[termId] : undefined;
  const discovered = !!(termId && archive.entries[termId]);

  const openWiki = async () => {
    if (!term?.wikipediaTitle) return;
    const url = wikipediaUrl(term.wikipediaTitle);
    if (Platform.OS === 'web') await Linking.openURL(url);
    else await WebBrowser.openBrowserAsync(url);
  };

  return (
    <Screen>
      <View style={styles.header}>
        <Pressable onPress={() => (router.canGoBack() ? router.back() : router.replace('/history/archive'))} hitSlop={12}>
          <Text style={styles.back}>‹</Text>
        </Pressable>
        <Text style={styles.title}>DISCOVERY</Text>
      </View>
      <ScrollView contentContainerStyle={styles.body}>
        {term && discovered ? (
          (() => {
            const c = connectionsOf(term.id, archive, TERMS_BY_ID);
            return (
              <ArchiveCard
                term={term}
                connections={c.connections}
                found={c.found}
                total={c.total}
                termsById={TERMS_BY_ID}
                isDiscovered={(id) => !!archive.entries[id]}
                onOpenTerm={(id) => router.push(`/history/term/${id}`)}
                onWikipedia={term.wikipediaTitle ? openWiki : undefined}
                acrossTime={timeLinksOf(term.id, TERMS_BY_ID, HOME_STAGE_OF).map((t) => ({
                  termId: t.id,
                  era: STAGES_BY_ID[HOME_STAGE_OF[t.id]]?.title ?? '',
                }))}
              />
            );
          })()
        ) : (
          <View style={styles.unknown}>
            <Text style={styles.unknownMark}>？？？</Text>
            <Text style={styles.unknownText}>まだ出会っていない言葉。</Text>
          </View>
        )}
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
  },
  back: { color: C.sand, fontSize: 28, lineHeight: 28 },
  title: { ...caps, fontSize: 13, letterSpacing: 6 },
  body: { padding: 16, paddingBottom: 48 },
  unknown: { alignItems: 'center', paddingVertical: 80, gap: 10 },
  unknownMark: { color: C.textFaint, fontSize: 28, letterSpacing: 6 },
  unknownText: { fontFamily: F.ja, color: C.textDim, fontSize: 14 },
});
