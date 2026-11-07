import { StyleSheet, Text, View } from 'react-native';

import { Button } from '../../components/Button';
import { CoinBadge } from '../../components/CoinBadge';
import { useNow } from '../../hooks/useKioskRuntime';
import { useSessionStore } from '../../state/sessionStore';
import { useShopStore } from '../../state/shopStore';
import { colors, space, type } from '../../theme/tokens';

/** Time is up. The tablet is locked, but a coin within the grace period resumes the same session. */
export function GraceScreen() {
  const now = useNow();
  const graceEndsAt = useSessionStore((s) => s.graceEndsAt);
  const endSession = useSessionStore((s) => s.endSession);
  const graceSec = useShopStore((s) => s.settings.graceSec);
  const secondsLeft = Math.max(0, Math.ceil((graceEndsAt - now) / 1000));
  const progress = graceSec > 0 ? secondsLeft / graceSec : 0;

  return (
    <View style={styles.root}>
      <Text style={styles.title} accessibilityRole="header">
        Time’s up!
      </Text>
      <CoinBadge size={130} label="+" />
      <Text style={styles.body}>
        Insert a coin within <Text style={styles.em}>{secondsLeft}s</Text> to continue.{'\n'}Your apps stay logged in until then.
      </Text>

      <View style={styles.track}>
        <View style={[styles.fill, { width: `${progress * 100}%` }]} />
      </View>

      <Text style={styles.note}>After that, all apps are logged out and cleared for the next customer.</Text>
      <Button label="I'm done, log me out now" variant="ghost" onPress={endSession} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center', gap: space.lg, padding: space.xxl },
  title: { ...type.display, color: colors.text },
  body: { ...type.h2, color: colors.textMuted, textAlign: 'center', lineHeight: 32 },
  em: { color: colors.coin, fontWeight: '800' },
  track: { width: 420, maxWidth: '90%', height: 8, borderRadius: 4, backgroundColor: colors.surface, overflow: 'hidden' },
  fill: { height: '100%', backgroundColor: colors.coin },
  note: { ...type.body, color: colors.textFaint, textAlign: 'center' },
});
