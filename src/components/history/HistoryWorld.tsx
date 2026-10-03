import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Animated, Easing, Pressable, StyleSheet, Text, View, type LayoutChangeEvent } from 'react-native';

import type { StageDefinition, StageLine } from '@/history/stage/types';

import { artToScreen } from './art/artSpace';
import { BACKDROPS, CHARACTERS } from './art/registry';
import { HistoricalCharacter } from './HistoricalCharacter';
import { TapCue } from './TapCue';
import { C, F, caps } from './theme';

type Props = {
  stage: StageDefinition;
  backgroundDiscovered: string[];
  /** 進捗イベントで登場する人物（ハンムラビなど）を表示するか */
  showArrival: boolean;
  /** 最初からいる人物（書記官など）が控える */
  hostBowed: boolean;
  dimmed: boolean;
  caption: StageLine | null;
  onCaptionPress: () => void;
  /** 台詞がプレイヤーのタップを待っているか（自動では進まない） */
  captionWaiting?: boolean;
  titleCard: { title: string; subtitle: string } | null;
  onHotspot: (termId: string) => void;
  resolved: number;
  total: number;
  archiveCount: number;
  onArchive: () => void;
  onExit: () => void;
  /** 世界の上に重ねる演出 */
  overlay?: ReactNode;
  /** 高さが小さいとき、見出しと字幕を詰めて組む */
  compact?: boolean;
};

export function HistoryWorld(props: Props) {
  const { stage, caption, titleCard, compact = false } = props;
  const [size, setSize] = useState({ w: 0, h: 0 });
  const onLayout = (e: LayoutChangeEvent) => setSize({ w: e.nativeEvent.layout.width, h: e.nativeEvent.layout.height });
  const Backdrop = BACKDROPS[stage.artKey];

  const dim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(dim, { toValue: props.dimmed ? 1 : 0, duration: 600, useNativeDriver: true }).start();
  }, [props.dimmed, dim]);

  return (
    <View style={styles.world} onLayout={onLayout}>
      {Backdrop && <Backdrop />}

      {size.w > 0 &&
        stage.backgroundHotspots.map((h) => {
          const p = artToScreen(h.x, h.y, size.w, size.h);
          return (
            <Hotspot
              key={h.termId}
              x={p.x}
              y={p.y}
              label={h.label}
              worldWidth={size.w}
              found={props.backgroundDiscovered.includes(h.termId)}
              onPress={() => props.onHotspot(h.termId)}
            />
          );
        })}

      {size.w > 0 && (
        <>
          <HistoricalCharacter
            id={stage.openingLine.speaker}
            visible
            worldWidth={size.w}
            worldHeight={size.h}
            bowed={props.hostBowed}
          />
          <HistoricalCharacter
            id={stage.midEvent.character}
            visible={props.showArrival}
            worldWidth={size.w}
            worldHeight={size.h}
          />
        </>
      )}

      <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, styles.dim, { opacity: dim }]} />

      <View style={[styles.header, compact && styles.headerCompact]} pointerEvents="box-none">
        <Pressable onPress={props.onExit} hitSlop={12} accessibilityLabel="タイトルへ戻る">
          <Text style={styles.exit}>‹</Text>
        </Pressable>
        <View style={styles.place}>
          <Text style={[styles.placeName, compact && styles.placeNameCompact]}>{stage.place}</Text>
          <Text style={[styles.era, compact && styles.eraCompact]}>{stage.eraLabel}</Text>
        </View>
        <Pressable onPress={props.onArchive} hitSlop={10} style={styles.archiveBtn} accessibilityLabel="ARCHIVE を開く">
          <Text style={styles.archiveText}>ARCHIVE</Text>
          <Text style={styles.archiveCount}>{props.archiveCount}</Text>
        </Pressable>
      </View>
      <View style={[styles.marks, compact && styles.marksCompact]} pointerEvents="none">
        {Array.from({ length: props.total }, (_, i) => (
          <View key={i} style={[styles.mark, i < props.resolved && styles.markOn]} />
        ))}
      </View>

      {titleCard && <TitleCard title={titleCard.title} subtitle={titleCard.subtitle} compact={compact} />}

      {caption && (
        <Caption line={caption} onPress={props.onCaptionPress} compact={compact} waiting={!!props.captionWaiting} />
      )}

      {props.overlay}
    </View>
  );
}

const LABEL_WIDTH = 120;

function Hotspot({
  x,
  y,
  label,
  worldWidth,
  found,
  onPress,
}: {
  x: number;
  y: number;
  label: string;
  worldWidth: number;
  found: boolean;
  onPress: () => void;
}) {
  // ラベルは画面端で切れないよう、世界の枠内に収める
  const labelLeft = Math.min(Math.max(-(LABEL_WIDTH - 44) / 2, 6 - (x - 22)), worldWidth - 6 - (x - 22) - LABEL_WIDTH);
  const pulse = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (found) return;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 1600, easing: Easing.out(Easing.quad), useNativeDriver: true }),
        Animated.delay(900),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [found, pulse]);

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={found ? label : '何かが光っている'}
      style={[styles.hotspot, { left: x - 22, top: y - 22 }]}
    >
      {!found && (
        <Animated.View
          style={[
            styles.ring,
            {
              opacity: pulse.interpolate({ inputRange: [0, 1], outputRange: [0.9, 0] }),
              transform: [{ scale: pulse.interpolate({ inputRange: [0, 1], outputRange: [0.4, 1.4] }) }],
            },
          ]}
        />
      )}
      <View style={[styles.spark, found && styles.sparkFound]} />
      {found && <Text style={[styles.hotspotLabel, { left: labelLeft }]}>{label}</Text>}
    </Pressable>
  );
}

function TitleCard({ title, subtitle, compact }: { title: string; subtitle: string; compact: boolean }) {
  const a = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(a, { toValue: 1, duration: 700, useNativeDriver: true }).start();
  }, [a]);
  return (
    <Animated.View pointerEvents="none" style={[styles.titleCard, { opacity: a }]}>
      <View style={styles.rule} />
      <Text style={[styles.titleText, compact && styles.titleTextCompact]}>{title}</Text>
      <Text style={styles.subtitleText}>{subtitle}</Text>
      <View style={styles.rule} />
    </Animated.View>
  );
}

function Caption({
  line,
  onPress,
  compact,
  waiting,
}: {
  line: StageLine;
  onPress: () => void;
  compact: boolean;
  waiting: boolean;
}) {
  const a = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    a.setValue(0);
    Animated.timing(a, { toValue: 1, duration: 450, useNativeDriver: true }).start();
  }, [line, a]);
  const who = CHARACTERS[line.speaker];
  return (
    <Animated.View style={[styles.captionWrap, { opacity: a }]}>
      <Pressable
        onPress={onPress}
        style={[styles.caption, compact && styles.captionCompact]}
        accessibilityRole="button"
        accessibilityHint="タップして続ける"
      >
        {compact ? (
          // 小さい世界では、話し手と台詞を 1 つの段落にまとめる
          <Text style={styles.lineCompact} numberOfLines={3}>
            {who && <Text style={styles.speakerInline}>{who.nameJa}　</Text>}「{line.text.replace(/\n/g, '')}」
          </Text>
        ) : (
          <>
            {who && (
              <Text style={styles.speaker}>
                {who.nameEn} <Text style={styles.speakerJa}>{who.nameJa}</Text>
              </Text>
            )}
            <Text style={styles.line}>「{line.text}」</Text>
          </>
        )}
        <TapCue waiting={waiting} />
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  world: {
    flex: 1,
    overflow: 'hidden',
    backgroundColor: C.night,
  },
  dim: { backgroundColor: 'rgba(5,4,10,0.62)' },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingTop: 10,
  },
  exit: { color: C.sand, fontSize: 28, lineHeight: 28, paddingRight: 10, opacity: 0.8 },
  place: { flex: 1, flexDirection: 'row', alignItems: 'baseline', gap: 8 },
  placeName: { ...caps, fontSize: 15, color: C.sand, letterSpacing: 4 },
  era: { fontFamily: F.latin, fontSize: 12, color: C.textDim, letterSpacing: 1 },
  archiveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: 'rgba(214,174,98,0.45)',
    paddingHorizontal: 9,
    paddingVertical: 4,
    backgroundColor: 'rgba(13,11,16,0.45)',
  },
  archiveText: { ...caps, fontSize: 10, letterSpacing: 2 },
  archiveCount: { fontFamily: F.latin, color: C.sand, fontSize: 12 },
  marks: {
    position: 'absolute',
    top: 44,
    left: 16,
    flexDirection: 'row',
    gap: 4,
  },
  mark: { width: 10, height: 3, backgroundColor: 'rgba(233,220,192,0.22)' },
  markOn: { backgroundColor: C.gold },
  hotspot: {
    position: 'absolute',
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ring: {
    position: 'absolute',
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 1.5,
    borderColor: '#ffe3a8',
  },
  spark: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#ffe9b8',
    shadowColor: '#ffd27a',
    shadowOpacity: 0.9,
    shadowRadius: 6,
  },
  sparkFound: { width: 4, height: 4, opacity: 0.6 },
  hotspotLabel: {
    position: 'absolute',
    top: 28,
    width: LABEL_WIDTH,
    textAlign: 'center',
    ...caps,
    fontSize: 9,
    color: '#f3dcae',
    opacity: 0.85,
  },
  titleCard: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: '28%',
    alignItems: 'center',
    gap: 6,
  },
  rule: { width: 120, height: StyleSheet.hairlineWidth, backgroundColor: C.gold, opacity: 0.7 },
  titleText: { ...caps, fontSize: 30, letterSpacing: 8, color: '#f2dfb4' },
  subtitleText: { ...caps, fontSize: 11, letterSpacing: 5 },
  captionWrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
  },
  caption: {
    paddingHorizontal: 18,
    paddingTop: 10,
    paddingBottom: 12,
    backgroundColor: 'rgba(10,8,12,0.78)',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(214,174,98,0.5)',
  },
  speaker: { ...caps, fontSize: 10, letterSpacing: 3, marginBottom: 3 },
  speakerJa: { fontFamily: F.ja, color: C.textDim, fontSize: 10, letterSpacing: 1 },
  line: { fontFamily: F.ja, color: C.sand, fontSize: 15, lineHeight: 22 },
  headerCompact: { paddingTop: 6 },
  placeNameCompact: { fontSize: 13, letterSpacing: 3 },
  eraCompact: { fontSize: 11 },
  marksCompact: { top: 34 },
  titleTextCompact: { fontSize: 22, letterSpacing: 6 },
  captionCompact: { paddingHorizontal: 12, paddingTop: 6, paddingBottom: 7 },
  lineCompact: { fontFamily: F.ja, color: C.sand, fontSize: 13, lineHeight: 18 },
  speakerInline: { fontFamily: F.ja, color: C.gold, fontSize: 11 },
});
