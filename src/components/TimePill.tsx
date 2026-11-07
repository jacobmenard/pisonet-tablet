import { StyleSheet, Text, View } from 'react-native';

import { formatClock } from '../domain/format';
import type { WarningLevel } from '../domain/session';
import { colors, radius, space, type } from '../theme/tokens';

export const LEVEL_COLOR: Record<WarningLevel, string> = {
  none: colors.time,
  low: colors.warn,
  critical: colors.danger,
  final: colors.danger,
};

type Props = { msLeft: number; level: WarningLevel; compact?: boolean };

export function TimePill({ msLeft, level, compact }: Props) {
  const color = LEVEL_COLOR[level];
  return (
    <View
      style={[styles.pill, compact && styles.compact, { borderColor: color }]}
      accessibilityRole="timer"
      accessibilityLabel={`Time remaining ${formatClock(msLeft)}`}
      accessibilityLiveRegion={level === 'none' ? 'none' : 'polite'}
    >
      {!compact && <Text style={[styles.caption, { color }]}>TIME LEFT</Text>}
      <Text style={[compact ? styles.clockCompact : styles.clock, { color }]}>{formatClock(msLeft)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    borderWidth: 2,
    borderRadius: radius.lg,
    paddingHorizontal: space.xl,
    paddingVertical: space.sm,
    backgroundColor: colors.bgRaised,
    alignItems: 'center',
    minWidth: 220,
  },
  compact: { minWidth: 0, paddingHorizontal: space.md, paddingVertical: space.xs, borderRadius: radius.pill },
  caption: { ...type.label },
  clock: { ...type.timer, fontSize: 44, lineHeight: 52 },
  clockCompact: { fontSize: 18, fontWeight: '800', fontVariant: ['tabular-nums'] },
});
