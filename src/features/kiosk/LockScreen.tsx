import { router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';

import { Button } from '../../components/Button';
import { CoinBadge } from '../../components/CoinBadge';
import { formatMinutes, formatPeso } from '../../domain/format';
import { ACCEPTED_COINS, minutesForAmount } from '../../domain/rates';
import { useCoinStatus } from '../../hooks/useCoinStatus';
import { useNow } from '../../hooks/useKioskRuntime';
import { useSessionStore } from '../../state/sessionStore';
import { useShopStore } from '../../state/shopStore';
import { colors, radius, space, type } from '../../theme/tokens';
import { RatesCard } from './RatesCard';

const ADMIN_TAPS = 7;
const ADMIN_TAP_WINDOW_MS = 3000;

/** Lock screen: phase "idle" (insert coin) and "crediting" (coins in, ready to start). */
export function LockScreen() {
  const { width } = useWindowDimensions();
  const wide = width >= 900;
  const settings = useShopStore((s) => s.settings);
  const phase = useSessionStore((s) => s.phase);
  const coinStatus = useCoinStatus();

  return (
    <View style={styles.root}>
      <Header shopName={settings.shopName} tabletLabel={settings.tabletLabel} />

      {coinStatus === 'disconnected' && (
        <View style={styles.alert} accessibilityRole="alert">
          <Text style={styles.alertText}>Coin slot offline. Please call the staff.</Text>
        </View>
      )}

      <View style={[styles.body, !wide && styles.bodyStacked]}>
        <View style={styles.hero}>{phase === 'crediting' ? <CreditPanel /> : <InsertPrompt />}</View>
        <RatesCard rates={settings.rates} />
      </View>

      <Text style={styles.footer}>
        Accepts {ACCEPTED_COINS.map((c) => formatPeso(c)).join(' · ')} coins. Your apps are logged out automatically when time ends.
      </Text>
    </View>
  );
}

function Header({ shopName, tabletLabel }: { shopName: string; tabletLabel: string }) {
  const taps = useRef<number[]>([]);
  const onBrandPress = () => {
    const now = Date.now();
    taps.current = [...taps.current.filter((t) => now - t < ADMIN_TAP_WINDOW_MS), now];
    if (taps.current.length >= ADMIN_TAPS) {
      taps.current = [];
      router.push('/staff-pin');
    }
  };

  return (
    <View style={styles.header}>
      {/* Hidden staff entry: tap the shop name 7 times quickly. No visual affordance on purpose. */}
      <Pressable onPress={onBrandPress} accessible={false} hitSlop={12}>
        <Text style={styles.brand}>{shopName}</Text>
      </Pressable>
      <View style={styles.headerRight}>
        <View style={styles.tabletChip}>
          <Text style={styles.tabletChipText}>{tabletLabel}</Text>
        </View>
        <WallClock />
      </View>
    </View>
  );
}

function WallClock() {
  const [time, setTime] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 10_000);
    return () => clearInterval(id);
  }, []);
  return (
    <Text style={styles.clock}>{time.toLocaleTimeString('en-PH', { hour: 'numeric', minute: '2-digit' })}</Text>
  );
}

function InsertPrompt() {
  return (
    <View style={styles.heroInner}>
      <CoinBadge size={170} />
      <Text style={styles.heroTitle}>Insert coin to play</Text>
      <Text style={styles.heroSub}>Drop a coin in the slot and the tablet unlocks.</Text>
    </View>
  );
}

function CreditPanel() {
  const now = useNow();
  const credit = useSessionStore((s) => s.creditPesos);
  const lastCoinAt = useSessionStore((s) => s.lastCoinAt);
  const startSession = useSessionStore((s) => s.startSession);
  const { rates, autoStartSec } = useShopStore((s) => s.settings);
  const minutes = minutesForAmount(credit, rates);
  const secondsLeft = Math.max(0, Math.ceil(autoStartSec - (now - lastCoinAt) / 1000));
  const progress = 1 - secondsLeft / autoStartSec;

  return (
    <View style={styles.heroInner}>
      <Text style={styles.creditLabel}>YOUR CREDIT</Text>
      <Text style={styles.creditAmount} accessibilityLiveRegion="polite">
        {formatPeso(credit)}
      </Text>
      <Text style={styles.creditMinutes}>= {formatMinutes(minutes)} of play</Text>

      <Button label="Start now" variant="time" size="lg" onPress={() => startSession()} style={styles.startBtn} />

      <View style={styles.progressTrack} accessibilityLabel={`Starting automatically in ${secondsLeft} seconds`}>
        <View style={[styles.progressFill, { width: `${Math.min(100, progress * 100)}%` }]} />
      </View>
      <Text style={styles.heroSub}>Starting in {secondsLeft}s. Add more coins for more time.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg, padding: space.xxl, gap: space.xl },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  brand: { ...type.h2, color: colors.text },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: space.lg },
  tabletChip: { backgroundColor: colors.surface, borderRadius: radius.pill, paddingHorizontal: space.md, paddingVertical: space.xs },
  tabletChipText: { ...type.small, color: colors.textMuted },
  clock: { ...type.h3, color: colors.textMuted, fontVariant: ['tabular-nums'] },

  alert: { backgroundColor: colors.danger, borderRadius: radius.md, padding: space.md, alignItems: 'center' },
  alertText: { ...type.h3, color: colors.dangerInk },

  body: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-evenly', gap: space.xxl },
  bodyStacked: { flexDirection: 'column', justifyContent: 'center' },
  hero: { alignItems: 'center', minWidth: 380 },
  heroInner: { alignItems: 'center', gap: space.md },
  heroTitle: { ...type.h1, fontSize: 44, color: colors.text, marginTop: space.md },
  heroSub: { ...type.body, color: colors.textMuted, textAlign: 'center' },

  creditLabel: { ...type.label, color: colors.textFaint },
  creditAmount: { ...type.display, fontSize: 96, color: colors.coin, lineHeight: 104 },
  creditMinutes: { ...type.h2, fontSize: 28, color: colors.text },
  startBtn: { marginTop: space.lg, minWidth: 320 },
  progressTrack: { width: 320, height: 6, borderRadius: 3, backgroundColor: colors.surface, overflow: 'hidden', marginTop: space.sm },
  progressFill: { height: '100%', backgroundColor: colors.time },

  footer: { ...type.small, color: colors.textFaint, textAlign: 'center' },
});
