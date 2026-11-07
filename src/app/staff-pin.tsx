import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Button } from '../components/Button';
import { PinDots, PinPad } from '../components/PinPad';
import { useNow } from '../hooks/useKioskRuntime';
import { MAX_PIN_ATTEMPTS, useAdminStore } from '../state/adminStore';
import { colors, space, type } from '../theme/tokens';

const PIN_LENGTH = 4;

export default function StaffPinScreen() {
  const [pin, setPin] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [checking, setChecking] = useState(false);
  const verifyPin = useAdminStore((s) => s.verifyPin);
  const lockedUntil = useAdminStore((s) => s.lockedUntil);
  const failed = useAdminStore((s) => s.failedAttempts);
  const now = useNow(500);
  const lockedSec = Math.max(0, Math.ceil((lockedUntil - now) / 1000));

  const onChange = (next: string) => {
    setPin(next);
    if (next.length !== PIN_LENGTH) return;
    setChecking(true);
    void verifyPin(next).then((result) => {
      setChecking(false);
      setPin('');
      if (result === 'ok') {
        setError(null);
        router.replace('/admin');
      } else if (result === 'locked') {
        setError('Too many attempts.');
      } else {
        setError(`Wrong PIN. ${MAX_PIN_ATTEMPTS - useAdminStore.getState().failedAttempts} tries left.`);
      }
    });
  };

  return (
    <View style={styles.root}>
      <Text style={styles.label}>STAFF ACCESS</Text>
      <Text style={styles.title}>Enter PIN</Text>
      <PinDots length={PIN_LENGTH} filled={pin.length} error={!!error && pin.length === 0 && failed > 0} />
      <Text style={styles.error} accessibilityLiveRegion="polite">
        {lockedSec > 0 ? `Locked. Try again in ${lockedSec}s.` : error ?? ' '}
      </Text>
      <PinPad value={pin} maxLength={PIN_LENGTH} onChange={onChange} disabled={lockedSec > 0 || checking} />
      <Button label="Cancel" variant="ghost" onPress={() => router.back()} style={{ marginTop: space.lg, minWidth: 252 }} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center', gap: space.lg },
  label: { ...type.label, color: colors.textFaint },
  title: { ...type.h1, color: colors.text },
  error: { ...type.body, color: colors.danger, minHeight: 22 },
});
