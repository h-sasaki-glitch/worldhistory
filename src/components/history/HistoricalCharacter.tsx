import { useEffect, useRef } from 'react';
import { Animated, StyleSheet } from 'react-native';

import type { StageCharacterId } from '@/history/stage/types';

import { CHARACTERS } from './art/registry';

type Props = {
  id: StageCharacterId;
  visible: boolean;
  worldWidth: number;
  worldHeight: number;
  /** 頭を下げる・控えるなどの反応（少し沈む） */
  bowed?: boolean;
};

/** 背景の中に立つ人物。登場時はゆっくりと現れる。 */
export function HistoricalCharacter({ id, visible, worldWidth, worldHeight, bowed }: Props) {
  const art = CHARACTERS[id];
  const appear = useRef(new Animated.Value(visible ? 1 : 0)).current;
  const bow = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(appear, { toValue: visible ? 1 : 0, duration: 1100, useNativeDriver: true }).start();
  }, [visible, appear]);

  useEffect(() => {
    Animated.timing(bow, { toValue: bowed ? 1 : 0, duration: 500, useNativeDriver: true }).start();
  }, [bowed, bow]);

  if (!art) return null;
  const h = worldHeight * art.heightRatio;
  const w = h * 0.5;
  const { Figure } = art;

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.wrap,
        {
          width: w,
          height: h,
          left: worldWidth * art.x - w / 2,
          bottom: worldHeight * 0.02,
          opacity: appear,
          transform: [
            { translateX: appear.interpolate({ inputRange: [0, 1], outputRange: [18, 0] }) },
            { translateY: bow.interpolate({ inputRange: [0, 1], outputRange: [0, h * 0.04] }) },
          ],
        },
      ]}
    >
      <Figure />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: { position: 'absolute' },
});
