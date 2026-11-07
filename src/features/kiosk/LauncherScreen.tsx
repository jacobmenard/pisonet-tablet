import { useMemo, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';

import { AppTile } from '../../components/AppTile';
import { Button } from '../../components/Button';
import { LEVEL_COLOR, TimePill } from '../../components/TimePill';
import { CATEGORY_LABEL, type AppCategory } from '../../domain/apps';
import { formatClock } from '../../domain/format';
import { useRemaining } from '../../hooks/useRemaining';
import { kiosk } from '../../services/kiosk';
import { useSessionStore } from '../../state/sessionStore';
import { useShopStore } from '../../state/shopStore';
import { colors, radius, space, type } from '../../theme/tokens';

type Filter = 'all' | AppCategory;

/** Unlocked home screen: allowed apps + countdown. Phase "active". */
export function LauncherScreen() {
  const { width } = useWindowDimensions();
  const { shopName, tabletLabel, apps } = useShopStore((s) => s.settings);
  const openApp = useSessionStore((s) => s.openApp);
  const { msLeft, level } = useRemaining();
  const [filter, setFilter] = useState<Filter>('all');
  const [confirmEnd, setConfirmEnd] = useState(false);

  const enabled = useMemo(() => apps.filter((a) => a.enabled), [apps]);
  const categories = useMemo(() => Array.from(new Set(enabled.map((a) => a.category))), [enabled]);
  const visible = filter === 'all' ? enabled : enabled.filter((a) => a.category === filter);

  const columns = width >= 1200 ? 6 : width >= 900 ? 5 : width >= 600 ? 4 : 3;
  const gap = space.lg;
  const tileSize = Math.floor((width - space.xxl * 2 - gap * (columns - 1)) / columns);

  const launch = (id: string, pkg: string) => {
    void kiosk.launchApp(pkg);
    openApp(id);
  };

  return (
    <View style={styles.root}>
      <View style={styles.topBar}>
        <View>
          <Text style={styles.brand}>{shopName}</Text>
          <Text style={styles.sub}>{tabletLabel} · Insert coins anytime to add time</Text>
        </View>
        <View style={styles.topRight}>
          <TimePill msLeft={msLeft} level={level} />
          <Button label="End session" variant="ghost" onPress={() => setConfirmEnd(true)} />
        </View>
      </View>

      <WarningBanner />

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips} style={styles.chipsWrap}>
        <Chip label="All apps" active={filter === 'all'} onPress={() => setFilter('all')} />
        {categories.map((c) => (
          <Chip key={c} label={CATEGORY_LABEL[c]} active={filter === c} onPress={() => setFilter(c)} />
        ))}
      </ScrollView>

      <ScrollView contentContainerStyle={[styles.grid, { gap }]}>
        {visible.map((app) => (
          <AppTile key={app.id} app={app} size={tileSize} onPress={() => launch(app.id, app.packageName)} />
        ))}
        {visible.length === 0 && <Text style={styles.empty}>No apps in this category yet.</Text>}
      </ScrollView>

      <EndSessionDialog visible={confirmEnd} msLeft={msLeft} onClose={() => setConfirmEnd(false)} />
    </View>
  );
}

function Chip({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="tab"
      accessibilityState={{ selected: active }}
      style={[styles.chip, active && styles.chipActive]}
    >
      <Text style={[styles.chipText, active && styles.chipTextActive]}>{label}</Text>
    </Pressable>
  );
}

export function WarningBanner() {
  const { msLeft, level } = useRemaining();
  if (level === 'none' || level === 'final') return null;
  const color = LEVEL_COLOR[level];
  return (
    <View style={[styles.banner, { backgroundColor: color + '22', borderColor: color }]} accessibilityRole="alert">
      <Text style={[styles.bannerText, { color }]}>
        {level === 'low' ? 'Less than 5 minutes left. ' : `Only ${formatClock(msLeft)} left! `}
        Insert a coin to keep playing.
      </Text>
    </View>
  );
}

function EndSessionDialog({ visible, msLeft, onClose }: { visible: boolean; msLeft: number; onClose: () => void }) {
  const endSession = useSessionStore((s) => s.endSession);
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.scrim}>
        <View style={styles.dialog} accessibilityViewIsModal>
          <Text style={styles.dialogTitle}>End your session?</Text>
          <Text style={styles.dialogBody}>
            You still have <Text style={{ color: colors.time, fontWeight: '800' }}>{formatClock(msLeft)}</Text>. Unused time
            can’t be refunded. We’ll log you out of all apps for your privacy.
          </Text>
          <View style={styles.dialogActions}>
            <Button label="Keep playing" variant="time" onPress={onClose} style={{ flex: 1 }} />
            <Button
              label="End & log out"
              variant="danger"
              onPress={() => {
                onClose();
                endSession();
              }}
              style={{ flex: 1 }}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg, paddingHorizontal: space.xxl, paddingTop: space.xl },
  topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: space.lg, flexWrap: 'wrap' },
  brand: { ...type.h2, color: colors.text },
  sub: { ...type.body, color: colors.textMuted, marginTop: 2 },
  topRight: { flexDirection: 'row', alignItems: 'center', gap: space.lg },

  banner: { marginTop: space.lg, borderWidth: 1, borderRadius: radius.md, padding: space.md, alignItems: 'center' },
  bannerText: { ...type.h3 },

  chipsWrap: { flexGrow: 0, marginTop: space.xl },
  chips: { gap: space.sm },
  chip: { paddingHorizontal: space.lg, minHeight: 44, justifyContent: 'center', borderRadius: radius.pill, backgroundColor: colors.surface },
  chipActive: { backgroundColor: colors.text },
  chipText: { ...type.body, color: colors.textMuted },
  chipTextActive: { color: colors.bg, fontWeight: '700' },

  grid: { flexDirection: 'row', flexWrap: 'wrap', paddingVertical: space.xl },
  empty: { ...type.body, color: colors.textFaint },

  scrim: { flex: 1, backgroundColor: colors.overlay, alignItems: 'center', justifyContent: 'center', padding: space.xl },
  dialog: { width: '100%', maxWidth: 520, backgroundColor: colors.bgRaised, borderRadius: radius.xl, padding: space.xxl, gap: space.lg },
  dialogTitle: { ...type.h1, color: colors.text },
  dialogBody: { ...type.body, fontSize: 18, lineHeight: 26, color: colors.textMuted },
  dialogActions: { flexDirection: 'row', gap: space.md, marginTop: space.sm },
});
