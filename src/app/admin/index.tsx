import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';

import { AppsManager } from '../../features/admin/AppsManager';
import { ChangePinDialog } from '../../features/admin/ChangePinDialog';
import { Overview } from '../../features/admin/Overview';
import { RatesEditor } from '../../features/admin/RatesEditor';
import { SettingsPanel } from '../../features/admin/SettingsPanel';
import { useAdminStore } from '../../state/adminStore';
import { useShopStore } from '../../state/shopStore';
import { colors, radius, space, type } from '../../theme/tokens';

type Section = 'overview' | 'rates' | 'apps' | 'settings';

const NAV: { key: Section; label: string; icon: string }[] = [
  { key: 'overview', label: 'Overview', icon: '◎' },
  { key: 'rates', label: 'Rates', icon: '₱' },
  { key: 'apps', label: 'Apps', icon: '▦' },
  { key: 'settings', label: 'Settings', icon: '⚙' },
];

/** Auto-lock staff mode if nobody touches the screen for a while. */
const IDLE_LOCK_MS = 3 * 60_000;

export default function AdminScreen() {
  const [section, setSection] = useState<Section>('overview');
  const [pinOpen, setPinOpen] = useState(false);
  const [lastTouch, setLastTouch] = useState(() => Date.now());
  const lock = useAdminStore((s) => s.lock);
  const { shopName, tabletLabel } = useShopStore((s) => s.settings);
  const { width } = useWindowDimensions();
  const compact = width < 900;

  const exit = () => {
    // Navigate first so the admin guard doesn't redirect to the PIN screen.
    router.replace('/');
    setTimeout(lock, 0);
  };

  useEffect(() => {
    const id = setTimeout(exit, IDLE_LOCK_MS);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lastTouch]);

  return (
    <View style={[styles.root, compact && { flexDirection: 'column' }]} onTouchStart={() => setLastTouch(Date.now())}>
      <View style={[styles.sidebar, compact && styles.sidebarCompact]}>
        {!compact && (
          <View style={styles.brandBox}>
            <Text style={styles.brandLabel}>STAFF MODE</Text>
            <Text style={styles.brand}>{shopName}</Text>
            <Text style={styles.brandSub}>{tabletLabel}</Text>
          </View>
        )}
        <View style={[styles.nav, compact && { flexDirection: 'row', flex: 1 }]}>
          {NAV.map((n) => {
            const active = n.key === section;
            return (
              <Pressable
                key={n.key}
                onPress={() => setSection(n.key)}
                accessibilityRole="tab"
                accessibilityState={{ selected: active }}
                style={[styles.navItem, active && styles.navItemActive, compact && { flex: 1, justifyContent: 'center' }]}
              >
                <Text style={[styles.navIcon, active && { color: colors.coin }]}>{n.icon}</Text>
                <Text style={[styles.navText, active && { color: colors.text }]}>{n.label}</Text>
              </Pressable>
            );
          })}
        </View>
        <Pressable onPress={exit} style={styles.exit} accessibilityRole="button" accessibilityLabel="Lock staff mode and return to kiosk">
          <Text style={styles.exitText}>🔒  Lock & exit</Text>
        </Pressable>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.content}>
        {section === 'overview' && <Overview onChangePin={() => setPinOpen(true)} />}
        {section === 'rates' && <RatesEditor />}
        {section === 'apps' && <AppsManager />}
        {section === 'settings' && <SettingsPanel onChangePin={() => setPinOpen(true)} />}
      </ScrollView>

      <ChangePinDialog visible={pinOpen} onClose={() => setPinOpen(false)} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, flexDirection: 'row', backgroundColor: colors.bg },
  sidebar: { width: 240, backgroundColor: colors.bgRaised, borderRightWidth: 1, borderColor: colors.border, padding: space.lg, gap: space.xl },
  sidebarCompact: { width: '100%', flexDirection: 'row', alignItems: 'center', borderRightWidth: 0, borderBottomWidth: 1, paddingVertical: space.sm },
  brandBox: { gap: 2, paddingHorizontal: space.sm, paddingTop: space.sm },
  brandLabel: { ...type.label, color: colors.coin },
  brand: { ...type.h3, color: colors.text },
  brandSub: { ...type.small, color: colors.textFaint },
  nav: { gap: space.xs, flex: 1 },
  navItem: { flexDirection: 'row', alignItems: 'center', gap: space.md, minHeight: 52, paddingHorizontal: space.md, borderRadius: radius.md },
  navItemActive: { backgroundColor: colors.surface },
  navIcon: { width: 22, fontSize: 18, color: colors.textFaint, textAlign: 'center' },
  navText: { ...type.body, color: colors.textMuted },
  exit: { minHeight: 52, justifyContent: 'center', paddingHorizontal: space.md, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border },
  exitText: { ...type.body, color: colors.textMuted },
  content: { padding: space.xxl, maxWidth: 1200, width: '100%' },
});
