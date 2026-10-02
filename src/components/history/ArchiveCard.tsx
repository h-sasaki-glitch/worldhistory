import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { Connection } from '@/history/archive/linkResolver';
import { CATEGORY_LABEL_JA } from '@/history/stage/discover';
import type { HistoryTerm } from '@/history/types';

import { C, F, caps } from './theme';

type Props = {
  term: HistoryTerm;
  connections: Connection[];
  found: number;
  total: number;
  termsById: Record<string, HistoryTerm>;
  isDiscovered: (id: string) => boolean;
  onOpenTerm: (id: string) => void;
  onWikipedia?: () => void;
  /** 時代をまたいで同じ概念でつながる用語（TIME LINK） */
  acrossTime?: { termId: string; era: string }[];
};

/** ARCHIVE の記録カード（DISCOVERY 詳細） */
export function ArchiveCard({
  term,
  connections,
  found,
  total,
  termsById,
  isDiscovered,
  onOpenTerm,
  onWikipedia,
  acrossTime = [],
}: Props) {
  return (
    <View style={styles.card}>
      <Text style={styles.category}>{CATEGORY_LABEL_JA[term.category]}</Text>
      <Text style={styles.en}>{term.nameEn}</Text>
      <Text style={styles.ja}>{term.display}</Text>
      <Text style={styles.meta}>{term.region}</Text>
      {term.eraLabel && <Text style={styles.meta}>{term.eraLabel}</Text>}

      <Text style={styles.summary}>{term.summary}</Text>

      {total > 0 && (
        <View style={styles.links}>
          <Text style={styles.section}>CONNECTED</Text>
          {connections.map((c) => {
            const t = termsById[c.termId];
            const open = isDiscovered(c.termId);
            return (
              <Pressable
                key={c.termId}
                disabled={!open}
                onPress={() => onOpenTerm(c.termId)}
                style={styles.linkRow}
                accessibilityRole="button"
              >
                <Text style={[styles.bullet, c.found && styles.bulletOn]}>{c.found ? '●' : '○'}</Text>
                <Text style={[styles.linkName, !c.found && styles.linkDim]}>{t.display}</Text>
                {open && <Text style={styles.chev}>›</Text>}
              </Pressable>
            );
          })}
          <Text style={styles.count}>
            {found} / {total} LINKS FOUND
          </Text>
        </View>
      )}

      {acrossTime.length > 0 && (
        <View style={styles.links}>
          <Text style={[styles.section, styles.sectionTime]}>ACROSS TIME</Text>
          {acrossTime.map((x) => {
            const open = isDiscovered(x.termId);
            return (
              <Pressable
                key={x.termId}
                disabled={!open}
                onPress={() => onOpenTerm(x.termId)}
                style={styles.linkRow}
                accessibilityRole="button"
              >
                <Text style={[styles.bullet, open && styles.bulletTime]}>◆</Text>
                <Text style={[styles.linkName, !open && styles.linkDim]}>
                  {open ? termsById[x.termId].display : '？？？'}
                </Text>
                <Text style={styles.era}>{x.era}</Text>
              </Pressable>
            );
          })}
        </View>
      )}

      {onWikipedia && (
        <Pressable onPress={onWikipedia} style={styles.wiki} accessibilityRole="link">
          <Text style={styles.wikiText}>Wikipediaで詳しく読む</Text>
          <Text style={styles.wikiSub}>外部サイトが開きます</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 22,
    borderWidth: 1,
    borderColor: 'rgba(214,174,98,0.4)',
    backgroundColor: 'rgba(22,18,15,0.9)',
  },
  category: { fontFamily: F.ja, color: C.textFaint, fontSize: 11, letterSpacing: 2 },
  en: { ...caps, fontSize: 26, letterSpacing: 5, color: '#f2dfb4', marginTop: 8 },
  ja: { fontFamily: F.ja, color: C.sand, fontSize: 20, marginTop: 4 },
  meta: { fontFamily: F.latin, color: C.textDim, fontSize: 13, marginTop: 4, letterSpacing: 1 },
  summary: { fontFamily: F.ja, color: C.sand, fontSize: 15, lineHeight: 25, marginTop: 16 },
  links: { marginTop: 22, gap: 6 },
  section: { ...caps, fontSize: 11, letterSpacing: 4, marginBottom: 4 },
  linkRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 3 },
  bullet: { color: C.textFaint, fontSize: 12, width: 14 },
  bulletOn: { color: C.gold },
  linkName: { fontFamily: F.ja, color: C.sand, fontSize: 15, flex: 1 },
  linkDim: { color: C.textFaint },
  chev: { color: C.gold, fontSize: 16 },
  sectionTime: { color: '#9fb3e6' },
  bulletTime: { color: '#9fb3e6' },
  era: { ...caps, fontSize: 9, letterSpacing: 2, color: C.textDim },
  count: { ...caps, fontSize: 10, letterSpacing: 3, color: C.textDim, marginTop: 6 },
  wiki: {
    marginTop: 24,
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: C.panelEdge,
  },
  wikiText: { fontFamily: F.ja, color: C.sand, fontSize: 14, letterSpacing: 1 },
  wikiSub: { fontFamily: F.ja, color: C.textFaint, fontSize: 10, marginTop: 2 },
});
