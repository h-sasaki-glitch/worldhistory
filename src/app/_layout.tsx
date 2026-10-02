import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { C } from '@/components/history/theme';
import { HistoryProvider } from '@/history/store/HistoryProvider';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <HistoryProvider>
        <StatusBar style="light" />
        <Stack
          screenOptions={{
            headerShown: false,
            animation: 'fade',
            contentStyle: { backgroundColor: C.night },
          }}
        />
      </HistoryProvider>
    </SafeAreaProvider>
  );
}
