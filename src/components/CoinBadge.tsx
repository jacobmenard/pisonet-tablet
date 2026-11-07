import { useEffect, useState } from 'react';
import { Animated, Easing, Platform, StyleSheet, Text, View } from 'react-native';

import { colors } from '../theme/tokens';

const NATIVE = Platform.OS !== 'web';

/** Big pulsing coin used as the lock screen's focal point. */
export function CoinBadge({ size = 180, label = '₱' }: { size?: number; label?: string }) {
  const [pulse] = useState(() => new Animated.Value(0));

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 1100, easing: Easing.out(Easing.quad), useNativeDriver: NATIVE }),
        Animated.timing(pulse, { toValue: 0, duration: 900, easing: Easing.in(Easing.quad), useNativeDriver: NATIVE }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [pulse]);

  const ringScale = pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.28] });
  const ringOpacity = pulse.interpolate({ inputRange: [0, 1], outputRange: [0.5, 0] });
  const coinScale = pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.04] });

  return (
    <View style={{ width: size * 1.35, height: size * 1.35, alignItems: 'center', justifyContent: 'center' }} accessible={false}>
      <Animated.View
        style={[
          styles.ring,
          { width: size, height: size, borderRadius: size / 2, opacity: ringOpacity, transform: [{ scale: ringScale }] },
        ]}
      />
      <Animated.View
        style={[styles.coin, { width: size, height: size, borderRadius: size / 2, transform: [{ scale: coinScale }] }]}
      >
        <View style={[styles.inner, { width: size * 0.78, height: size * 0.78, borderRadius: size * 0.39 }]}>
          <Text style={[styles.symbol, { fontSize: size * 0.42 }]}>{label}</Text>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  ring: { position: 'absolute', borderWidth: 6, borderColor: colors.coin },
  coin: {
    backgroundColor: colors.coin,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 6,
    borderColor: colors.coinDeep,
  },
  inner: { borderWidth: 3, borderColor: colors.coinDeep, alignItems: 'center', justifyContent: 'center' },
  symbol: { color: colors.coinInk, fontWeight: '900' },
});
