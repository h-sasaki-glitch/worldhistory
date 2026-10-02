import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { C, MAX_APP_WIDTH } from './theme';

/** 全画面の共通枠。Web/タブレットでも縦長スマホ幅に収める。 */
export function Screen({ children, padded = true }: { children: ReactNode; padded?: boolean }) {
  const insets = useSafeAreaInsets();
  return (
    <View style={styles.outer}>
      <View
        style={[
          styles.inner,
          padded && { paddingTop: insets.top, paddingBottom: insets.bottom },
        ]}
      >
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  outer: { flex: 1, backgroundColor: '#050406', alignItems: 'center' },
  inner: { flex: 1, width: '100%', maxWidth: MAX_APP_WIDTH, backgroundColor: C.night, overflow: 'hidden' },
});
