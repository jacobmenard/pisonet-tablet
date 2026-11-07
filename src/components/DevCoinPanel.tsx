import { usePathname } from 'expo-router';
import { useEffect, useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';

import { ACCEPTED_COINS } from '../domain/rates';
import { coinAcceptor, type ConnectionStatus } from '../services/coinAcceptor';
import { useSessionStore } from '../state/sessionStore';
import { colors, radius, space, type } from '../theme/tokens';

/** Simulator controls for the preview and dev builds. Never shown in release Android builds. */
export const SHOW_SIMULATOR = __DEV__ || Platform.OS === 'web';

export function DevCoinPanel() {
  const [open, setOpen] = useState(true);
  const [status, setStatus] = useState<ConnectionStatus>(coinAcceptor.getStatus());
  useEffect(() => coinAcceptor.onStatus(setStatus), []);
  const pathname = usePathname();

  // Customers' coins don't belong in staff screens.
  if (!SHOW_SIMULATOR || pathname.startsWith('/admin') || pathname === '/staff-pin') return null;

  const skip = (min: number) => {
    const { phase, endsAt } = useSessionStore.getState();
    if (phase === 'active') useSessionStore.setState({ endsAt: endsAt - min * 60_000 });
  };

  if (!open) {
    return (
      <Pressable style={[styles.panel, styles.collapsed]} onPress={() => setOpen(true)} accessibilityLabel="Open simulator">
        <Text style={styles.title}>SIM ▸</Text>
      </Pressable>
    );
  }

  return (
    <View style={styles.panel}>
      <Pressable onPress={() => setOpen(false)} accessibilityLabel="Hide simulator">
        <Text style={styles.title}>COIN SIMULATOR ▾</Text>
      </Pressable>
      <View style={styles.row}>
        {ACCEPTED_COINS.map((c) => (
          <Pressable key={c} style={styles.coin} onPress={() => coinAcceptor.simulateInsert(c)} accessibilityLabel={`Insert ${c} peso coin`}>
            <Text style={styles.coinText}>₱{c}</Text>
          </Pressable>
        ))}
      </View>
      <View style={styles.row}>
        <Pressable style={styles.chip} onPress={() => skip(1)}>
          <Text style={styles.chipText}>−1 min</Text>
        </Pressable>
        <Pressable style={styles.chip} onPress={() => skip(5)}>
          <Text style={styles.chipText}>−5 min</Text>
        </Pressable>
        <Pressable
          style={[styles.chip, status === 'disconnected' && styles.chipOff]}
          onPress={() => coinAcceptor.simulateStatus(status === 'connected' ? 'disconnected' : 'connected')}
        >
          <Text style={styles.chipText}>Slot {status === 'connected' ? 'on' : 'off'}</Text>
        </Pressable>
      </View>
      <Text style={styles.hint}>Staff: tap shop name 7× · PIN 1234</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    position: 'absolute',
    right: space.lg,
    bottom: space.lg,
    padding: space.md,
    gap: space.sm,
    borderRadius: radius.md,
    backgroundColor: 'rgba(18,26,51,0.96)',
    borderWidth: 1,
    borderColor: colors.border,
    borderStyle: 'dashed',
    zIndex: 1000,
  },
  collapsed: { paddingVertical: space.sm },
  title: { ...type.label, color: colors.textFaint },
  row: { flexDirection: 'row', gap: space.sm },
  coin: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.coin,
    borderWidth: 3,
    borderColor: colors.coinDeep,
    alignItems: 'center',
    justifyContent: 'center',
  },
  coinText: { color: colors.coinInk, fontWeight: '800', fontSize: 15 },
  chip: { paddingHorizontal: space.md, paddingVertical: space.sm, borderRadius: radius.sm, backgroundColor: colors.surfaceHigh },
  chipOff: { backgroundColor: colors.danger },
  chipText: { ...type.small, color: colors.text },
  hint: { ...type.small, fontSize: 11, color: colors.textFaint },
});
