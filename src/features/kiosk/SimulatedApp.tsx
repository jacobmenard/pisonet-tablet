import { Pressable, StyleSheet, Text, View } from 'react-native';

import { CATEGORY_COLOR, monogram, type KioskApp } from '../../domain/apps';
import { useSessionStore } from '../../state/sessionStore';
import { colors, radius, space, type } from '../../theme/tokens';
import { WarningBanner } from './LauncherScreen';
import { FloatingTimer } from './FloatingTimer';

/**
 * Preview stand-in for a third-party app in the foreground. On the device the
 * real app opens; the floating timer and warnings come from the native overlay.
 */
export function SimulatedApp({ app }: { app: KioskApp }) {
  const openApp = useSessionStore((s) => s.openApp);
  const tint = CATEGORY_COLOR[app.category];

  return (
    <View style={styles.root}>
      <View style={styles.center}>
        <View style={[styles.icon, { borderColor: tint, backgroundColor: tint + '22' }]}>
          <Text style={[styles.mono, { color: tint }]}>{monogram(app.name)}</Text>
        </View>
        <Text style={styles.title}>{app.name} is running</Text>
        <Text style={styles.sub}>Preview placeholder. On the tablet, the real app opens here with the timer bubble on top.</Text>
      </View>

      <View style={styles.bannerSlot}>
        <WarningBanner />
      </View>

      <FloatingTimer />

      {/* Stands in for the Android Home button, which returns to our launcher. */}
      <Pressable style={styles.navBar} onPress={() => openApp(null)} accessibilityRole="button" accessibilityLabel="Home">
        <View style={styles.homePill} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#05070F' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: space.lg, padding: space.xxl },
  icon: { width: 120, height: 120, borderRadius: radius.xl, borderWidth: 3, alignItems: 'center', justifyContent: 'center' },
  mono: { fontSize: 40, fontWeight: '800' },
  title: { ...type.h1, color: colors.text },
  sub: { ...type.body, color: colors.textFaint, textAlign: 'center', maxWidth: 520 },
  bannerSlot: { position: 'absolute', top: 80, left: space.xxl, right: space.xxl },
  navBar: { height: 44, alignItems: 'center', justifyContent: 'center', backgroundColor: '#000' },
  homePill: { width: 120, height: 5, borderRadius: 3, backgroundColor: colors.textFaint },
});
