import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { DevCoinPanel } from '../components/DevCoinPanel';
import { useKioskRuntime } from '../hooks/useKioskRuntime';
import { colors } from '../theme/tokens';

export default function RootLayout() {
  useKioskRuntime();

  return (
    <SafeAreaProvider>
      <StatusBar hidden />
      <View style={{ flex: 1, backgroundColor: colors.bg }}>
        <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.bg }, animation: 'fade' }} />
        <DevCoinPanel />
      </View>
    </SafeAreaProvider>
  );
}
