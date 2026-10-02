import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { Placement } from '@/history/crossword/types';
import type { AnswerCheck, AnswerInputMode } from '@/history/input/answerInput';
import type { TermProgress } from '@/history/stage/types';
import type { HistoryTerm } from '@/history/types';

import { DiscoverPanel } from './DiscoverPanel';
import { KeyboardAnswerInput } from './input/KeyboardAnswerInput';
import { TileAnswerInput } from './input/TileAnswerInput';
import { C, F, caps } from './theme';

type Props = {
  term: HistoryTerm;
  placement: Placement;
  progress: TermProgress;
  known: (string | null)[];
  inputMode: AnswerInputMode;
  onToggleMode: () => void;
  onSubmit: (raw: string | string[]) => AnswerCheck;
  onDiscover: () => void;
  onReveal: () => void;
  onOpenTerm: () => void;
};

export function CluePanel(props: Props) {
  const { term, placement, progress } = props;
  const number = String(placement.number).padStart(2, '0');
  const dir = placement.direction === 'across' ? '横' : '縦';
  const resolved = progress.result !== null;

  return (
    <View style={styles.panel}>
      <View style={styles.head}>
        <Text style={styles.clueNo}>CLUE {number}</Text>
        <Text style={styles.dir}>{dir} ・ {placement.cells.length}文字</Text>
        <View style={{ flex: 1 }} />
        {!resolved && (
          <Pressable onPress={props.onToggleMode} hitSlop={8} accessibilityRole="button">
            <Text style={styles.mode}>{props.inputMode === 'keyboard' ? '文字盤で記す' : 'キーボードで記す'}</Text>
          </Pressable>
        )}
      </View>

      {resolved ? (
        <Pressable onPress={props.onOpenTerm} style={styles.resolved} accessibilityRole="button">
          <Text style={styles.resolvedEn}>{term.nameEn}</Text>
          <Text style={styles.resolvedJa}>{term.display}</Text>
          <Text style={styles.summary} numberOfLines={2}>
            {term.summary}
          </Text>
          <Text style={styles.more}>記録を見る ›</Text>
        </Pressable>
      ) : (
        <>
          <Text style={styles.clue}>{term.clues.normal}</Text>
          <View style={styles.input}>
            {props.inputMode === 'keyboard' ? (
              <KeyboardAnswerInput termKey={term.id} length={placement.cells.length} onSubmit={props.onSubmit} />
            ) : (
              <TileAnswerInput termKey={term.id} answer={placement.cells} known={props.known} onSubmit={props.onSubmit} />
            )}
          </View>
          <View style={styles.actions}>
            <Pressable
              onPress={props.onDiscover}
              disabled={progress.discoverLevel >= 3}
              style={[styles.discoverBtn, progress.discoverLevel >= 3 && styles.disabled]}
              accessibilityRole="button"
            >
              <Text style={styles.discoverText}>調べる</Text>
              <View style={styles.dots}>
                {[1, 2, 3].map((n) => (
                  <View key={n} style={[styles.dot, progress.discoverLevel >= n && styles.dotOn]} />
                ))}
              </View>
            </Pressable>
            {progress.discoverLevel >= 3 && (
              <Pressable onPress={props.onReveal} style={styles.revealBtn} accessibilityRole="button">
                <Text style={styles.revealText}>答えを見る</Text>
              </Pressable>
            )}
          </View>
          <DiscoverPanel term={term} cells={placement.cells} level={progress.discoverLevel} />
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 12,
    backgroundColor: C.panel,
    borderTopWidth: 1,
    borderTopColor: C.panelEdge,
  },
  head: { flexDirection: 'row', alignItems: 'baseline', gap: 10, marginBottom: 4 },
  clueNo: { ...caps, fontSize: 12, letterSpacing: 3 },
  dir: { fontFamily: F.ja, color: C.textDim, fontSize: 11 },
  mode: { fontFamily: F.ja, color: C.textDim, fontSize: 11, textDecorationLine: 'underline' },
  clue: { fontFamily: F.ja, color: C.sand, fontSize: 15, lineHeight: 22 },
  input: { marginTop: 8 },
  actions: { flexDirection: 'row', gap: 10, marginTop: 8, alignItems: 'center' },
  discoverBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: C.lapis,
    backgroundColor: 'rgba(60,90,166,0.12)',
  },
  disabled: { opacity: 0.45 },
  discoverText: { color: '#c9d3ef', fontFamily: F.ja, fontSize: 13, letterSpacing: 2 },
  dots: { flexDirection: 'row', gap: 3 },
  dot: { width: 5, height: 5, borderRadius: 3, borderWidth: 1, borderColor: '#8a9bd0' },
  dotOn: { backgroundColor: '#8a9bd0' },
  revealBtn: { paddingHorizontal: 10, paddingVertical: 6 },
  revealText: { color: C.textDim, fontFamily: F.ja, fontSize: 12, textDecorationLine: 'underline' },
  resolved: { paddingVertical: 4 },
  resolvedEn: { ...caps, fontSize: 13, letterSpacing: 4 },
  resolvedJa: { fontFamily: F.ja, color: C.sand, fontSize: 18, marginTop: 2 },
  summary: { fontFamily: F.ja, color: C.textDim, fontSize: 13, lineHeight: 19, marginTop: 4 },
  more: { fontFamily: F.ja, color: C.gold, fontSize: 12, marginTop: 6 },
});
