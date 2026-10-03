import { useEffect, useRef } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';

import type { HistoryTerm } from '@/history/types';

import { TapCue } from './TapCue';
import { C, F, caps } from './theme';

type Props = {
  term: HistoryTerm;
  heading: string;
  newLinks: number;
  /** 自動で閉じるまでの時間。0 ならタップするまで閉じない */
  autoCloseMs: number;
  onClose: () => void;
  onOpen: () => void;
};

/** 正解・発見時の短い演出。詳細は強制せず、タップで ARCHIVE の記録へ。 */
export function DiscoveryCard({ term, heading, newLinks, autoCloseMs, onClose, onOpen }: Props) {
  const a = useRef(new Animated.Value(0)).current;
  const closed = useRef(false);

  const close = () => {
    if (closed.current) return;
    closed.current = true;
    Animated.timing(a, { toValue: 0, duration: 250, useNativeDriver: true }).start(() => onClose());
  };

  useEffect(() => {
    Animated.timing(a, { toValue: 1, duration: 380, useNativeDriver: true }).start();
    if (autoCloseMs > 0) {
      const t = setTimeout(close, autoCloseMs);
      return () => clearTimeout(t);
    }
  }, []);

  return (
    <Animated.View
      style={[
        styles.wrap,
        { opacity: a, transform: [{ translateY: a.interpolate({ inputRange: [0, 1], outputRange: [10, 0] }) }] },
      ]}
    >
      <Pressable style={StyleSheet.absoluteFill} onPress={close} accessibilityLabel="閉じる" />
      <Pressable style={styles.card} onPress={close} accessibilityHint="タップで閉じる">
        <Text style={styles.heading}>{heading}</Text>
        <Text style={styles.en}>{term.nameEn}</Text>
        <Text style={styles.ja}>{term.display}</Text>
        <Text style={styles.summary}>「{term.summary}」</Text>
        <View style={styles.foot}>
          {newLinks > 0 ? <Text style={styles.links}>+{newLinks} LINK{newLinks > 1 ? 'S' : ''}</Text> : <View />}
          <Pressable
            onPress={() => {
              closed.current = true;
              onOpen();
            }}
            hitSlop={8}
            accessibilityRole="button"
          >
            <Text style={styles.open}>記録を見る ›</Text>
          </Pressable>
        </View>
        {autoCloseMs === 0 && (
          <View style={styles.cue}>
            <TapCue waiting />
          </View>
        )}
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(5,4,8,0.35)',
    paddingHorizontal: 22,
  },
  card: {
    width: '100%',
    maxWidth: 380,
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: 'rgba(16,13,12,0.92)',
    borderWidth: 1,
    borderColor: 'rgba(214,174,98,0.55)',
  },
  heading: { ...caps, fontSize: 10, letterSpacing: 5, color: C.gold },
  en: { ...caps, fontSize: 22, letterSpacing: 5, color: '#f2dfb4', marginTop: 6 },
  ja: { fontFamily: F.ja, color: C.sand, fontSize: 18, marginTop: 2 },
  summary: { fontFamily: F.ja, color: C.textDim, fontSize: 13, lineHeight: 20, marginTop: 8 },
  foot: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 },
  links: { ...caps, fontSize: 10, color: '#9fb3e6', letterSpacing: 3 },
  open: { fontFamily: F.ja, color: C.gold, fontSize: 12 },
  cue: { marginTop: 12, paddingTop: 10, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: 'rgba(214,174,98,0.3)' },
});
