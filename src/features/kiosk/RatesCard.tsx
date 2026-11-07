import { StyleSheet, Text, View } from 'react-native';

import { formatMinutes, formatPeso } from '../../domain/format';
import { sortRates, type Rate } from '../../domain/rates';
import { colors, radius, space, type } from '../../theme/tokens';

export function RatesCard({ rates }: { rates: Rate[] }) {
  return (
    <View style={styles.card} accessibilityLabel="Rates">
      <Text style={styles.heading}>RATES</Text>
      {sortRates(rates).map((r) => (
        <View key={r.id} style={[styles.row, r.label ? styles.rowPromo : null]}>
          <Text style={styles.price}>{formatPeso(r.price)}</Text>
          <View style={styles.dots} />
          <Text style={styles.minutes}>{formatMinutes(r.minutes)}</Text>
          {r.label ? (
            <View style={styles.tag}>
              <Text style={styles.tagText}>{r.label}</Text>
            </View>
          ) : null}
        </View>
      ))}
      <Text style={styles.foot}>Coins add up. You always get the best combination.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.bgRaised,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    padding: space.xl,
    gap: space.sm,
    minWidth: 340,
  },
  heading: { ...type.label, color: colors.textFaint, marginBottom: space.xs },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: space.md,
    paddingHorizontal: space.md,
    borderRadius: radius.md,
    gap: space.md,
  },
  rowPromo: { backgroundColor: colors.coin + '14' },
  price: { ...type.h2, color: colors.coin, minWidth: 64 },
  dots: { flex: 1, borderBottomWidth: 2, borderStyle: 'dotted', borderColor: colors.border, marginTop: 8 },
  minutes: { ...type.h2, color: colors.text },
  tag: { backgroundColor: colors.coin, borderRadius: radius.pill, paddingHorizontal: space.sm, paddingVertical: 2 },
  tagText: { ...type.small, color: colors.coinInk },
  foot: { ...type.small, color: colors.textFaint, marginTop: space.sm },
});
