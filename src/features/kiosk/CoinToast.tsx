import { useEffect, useState } from 'react';
import { Animated, Platform, StyleSheet, Text } from 'react-native';

import { formatMinutes, formatPeso } from '../../domain/format';
import { useSessionStore } from '../../state/sessionStore';
import { colors, radius, space, type } from '../../theme/tokens';

const NATIVE = Platform.OS !== 'web';
const VISIBLE_MS = 2600;

/** Confirms a coin added during a session: "+₱5 → +30 min". */
export function CoinToast() {
  const toast = useSessionStore((s) => s.toast);
  const dismiss = useSessionStore((s) => s.dismissToast);
  const [anim] = useState(() => new Animated.Value(0));

  useEffect(() => {
    if (!toast) return;
    anim.setValue(0);
    Animated.spring(anim, { toValue: 1, useNativeDriver: NATIVE }).start();
    const id = setTimeout(() => {
      Animated.timing(anim, { toValue: 0, duration: 200, useNativeDriver: NATIVE }).start(() => dismiss());
    }, VISIBLE_MS);
    return () => clearTimeout(id);
  }, [toast, anim, dismiss]);

  if (!toast) return null;
  const translateY = anim.interpolate({ inputRange: [0, 1], outputRange: [-80, 0] });

  return (
    <Animated.View
      pointerEvents="none"
      style={[styles.toast, { opacity: anim, transform: [{ translateY }] }]}
      accessibilityRole="alert"
      accessibilityLiveRegion="polite"
    >
      <Text style={styles.coin}>+{formatPeso(toast.coin)}</Text>
      <Text style={styles.text}>+{formatMinutes(toast.minutes)} added</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  toast: {
    position: 'absolute',
    top: space.lg,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    paddingHorizontal: space.xl,
    paddingVertical: space.md,
    borderRadius: radius.pill,
    backgroundColor: colors.coin,
    zIndex: 980,
  },
  coin: { ...type.h2, color: colors.coinInk },
  text: { ...type.h3, color: colors.coinInk },
});
