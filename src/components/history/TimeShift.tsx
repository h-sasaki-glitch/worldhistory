import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';

import { C, caps } from './theme';

type Props = {
  place: string;
  era: string;
  onDone: () => void;
  /** 表示時間（ミリ秒）。仕様は約 1〜2 秒 */
  holdMs?: number;
};

/** 時間移動の暗転。TIME SHIFT / BABYLON / c. 1750 BCE を短く出して消える。 */
export function TimeShift({ place, era, onDone, holdMs = 1300 }: Props) {
  const text = useRef(new Animated.Value(0)).current;
  const veil = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.timing(text, { toValue: 1, duration: 450, useNativeDriver: true }),
      Animated.delay(holdMs),
      Animated.timing(text, { toValue: 0, duration: 300, useNativeDriver: true }),
      Animated.timing(veil, { toValue: 0, duration: 500, useNativeDriver: true }),
    ]).start(() => onDone());
  }, [text, veil, holdMs, onDone]);

  return (
    <Animated.View style={[StyleSheet.absoluteFill, styles.veil, { opacity: veil }]}>
      <Animated.View style={[styles.center, { opacity: text }]}>
        <Text style={styles.shift}>TIME SHIFT</Text>
        <View style={styles.rule} />
        <Text style={styles.place}>{place}</Text>
        <Text style={styles.era}>{era}</Text>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  veil: { backgroundColor: '#000', alignItems: 'center', justifyContent: 'center', zIndex: 50 },
  center: { alignItems: 'center', gap: 8 },
  shift: { ...caps, fontSize: 11, letterSpacing: 8, color: C.textDim },
  rule: { width: 40, height: StyleSheet.hairlineWidth, backgroundColor: C.gold, marginVertical: 6 },
  place: { ...caps, fontSize: 30, letterSpacing: 10, color: '#f2dfb4' },
  era: { ...caps, fontSize: 13, letterSpacing: 4, color: C.textDim },
});
