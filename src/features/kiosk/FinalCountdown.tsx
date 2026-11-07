import { StyleSheet, Text, View } from 'react-native';

import { useRemaining } from '../../hooks/useRemaining';
import { colors, radius, space, type } from '../../theme/tokens';

/**
 * Last-30-seconds overlay. It does not block touches (pointerEvents="none"),
 * so a match or video isn't interrupted, but the countdown can't be missed.
 */
export function FinalCountdown() {
  const { msLeft, level } = useRemaining();
  if (level !== 'final') return null;
  const seconds = Math.ceil(msLeft / 1000);

  return (
    <View pointerEvents="none" style={styles.wrap} accessibilityRole="alert" accessibilityLiveRegion="assertive">
      <View style={styles.card}>
        <Text style={styles.number}>{seconds}</Text>
        <Text style={styles.text}>seconds left · insert a coin to continue</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { ...StyleSheet.absoluteFill, alignItems: 'center', justifyContent: 'flex-end', paddingBottom: 72, zIndex: 950 },
  card: {
    alignItems: 'center',
    paddingHorizontal: space.xxl,
    paddingVertical: space.lg,
    borderRadius: radius.xl,
    backgroundColor: 'rgba(43,0,9,0.88)',
    borderWidth: 2,
    borderColor: colors.danger,
  },
  number: { ...type.display, color: colors.danger, fontVariant: ['tabular-nums'], lineHeight: 80 },
  text: { ...type.h3, color: colors.text },
});
