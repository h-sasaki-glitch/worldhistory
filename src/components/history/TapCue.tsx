import { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, Text } from 'react-native';

import { C, F } from './theme';

type Props = {
  /** プレイヤーの操作を待っているとき true（文言つきで目立たせる） */
  waiting?: boolean;
};

/**
 * 「タップすると先に進める」ことを示す合図。
 * ノベルゲームの定番にならい、右下で ▼ がゆっくり上下・明滅する。
 */
export function TapCue({ waiting = false }: Props) {
  const t = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(t, { toValue: 1, duration: 650, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
        Animated.timing(t, { toValue: 0, duration: 650, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [t]);

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.wrap,
        {
          opacity: t.interpolate({ inputRange: [0, 1], outputRange: waiting ? [0.55, 1] : [0.3, 0.7] }),
          transform: [{ translateY: t.interpolate({ inputRange: [0, 1], outputRange: [0, 3] }) }],
        },
      ]}
      accessibilityElementsHidden
    >
      {waiting && <Text style={styles.label}>タップして続ける</Text>}
      <Text style={[styles.arrow, waiting && styles.arrowWaiting]}>▼</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-end', gap: 6 },
  label: { fontFamily: F.ja, color: C.gold, fontSize: 12, letterSpacing: 1 },
  arrow: { color: C.gold, fontSize: 10 },
  arrowWaiting: { fontSize: 12 },
});
