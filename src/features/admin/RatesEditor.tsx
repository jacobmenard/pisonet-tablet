import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Button } from '../../components/Button';
import { formatMinutes, formatPeso } from '../../domain/format';
import { minutesForAmount, sortRates, validateRates, type Rate, type RateValidationError } from '../../domain/rates';
import { useShopStore } from '../../state/shopStore';
import { colors, radius, space, type } from '../../theme/tokens';
import { Card, Field, SectionTitle } from './ui';

type Draft = { id: string; price: string; minutes: string; label: string };

const ERROR_TEXT: Record<RateValidationError, string> = {
  empty: 'Add at least one rate.',
  'missing-base-rate': 'You need a ₱1 rate so every coin converts to time.',
  'invalid-value': 'Prices and minutes must be whole numbers above 0.',
  'duplicate-price': 'Two rates have the same price.',
};

const toDraft = (r: Rate): Draft => ({ id: r.id, price: String(r.price), minutes: String(r.minutes), label: r.label ?? '' });
const fromDraft = (d: Draft): Rate => ({
  id: d.id,
  price: Number(d.price),
  minutes: Number(d.minutes),
  ...(d.label.trim() ? { label: d.label.trim() } : {}),
});

let newId = 0;

export function RatesEditor() {
  const saved = useShopStore((s) => s.settings.rates);
  const setRates = useShopStore((s) => s.setRates);
  const [draft, setDraft] = useState<Draft[]>(() => sortRates(saved).map(toDraft));
  const [savedAt, setSavedAt] = useState<number | null>(null);

  const parsed = useMemo(() => draft.map(fromDraft), [draft]);
  const error = validateRates(parsed);
  const dirty = JSON.stringify(parsed) !== JSON.stringify(sortRates(saved));

  const update = (id: string, patch: Partial<Draft>) => {
    setSavedAt(null);
    setDraft((ds) => ds.map((d) => (d.id === id ? { ...d, ...patch } : d)));
  };

  return (
    <View style={{ gap: space.xl }}>
      <SectionTitle title="Rates & promos" subtitle="Customers always get the best combination of these rates." />

      <View style={styles.cols}>
        <Card style={{ flex: 3, minWidth: 420, gap: space.md }}>
          {draft.map((d) => (
            <View key={d.id} style={styles.rateRow}>
              <Field label="Price (₱)" value={d.price} keyboardType="number-pad" onChangeText={(t) => update(d.id, { price: t.replace(/\D/g, '') })} />
              <Field label="Minutes" value={d.minutes} keyboardType="number-pad" onChangeText={(t) => update(d.id, { minutes: t.replace(/\D/g, '') })} />
              <View style={{ flex: 1.4 }}>
                <Field label="Tag (optional)" value={d.label} placeholder="e.g. Promo" maxLength={14} onChangeText={(t) => update(d.id, { label: t })} />
              </View>
              <Pressable
                onPress={() => setDraft((ds) => ds.filter((x) => x.id !== d.id))}
                style={styles.remove}
                accessibilityRole="button"
                accessibilityLabel={`Remove ₱${d.price} rate`}
              >
                <Text style={styles.removeText}>✕</Text>
              </Pressable>
            </View>
          ))}

          <Button
            label="+ Add rate"
            variant="ghost"
            onPress={() => setDraft((ds) => [...ds, { id: `new-${++newId}`, price: '', minutes: '', label: '' }])}
          />

          {error && (
            <Text style={styles.error} accessibilityRole="alert">
              {ERROR_TEXT[error]}
            </Text>
          )}

          <View style={styles.actions}>
            <Button label="Discard" variant="ghost" disabled={!dirty} onPress={() => setDraft(sortRates(saved).map(toDraft))} />
            <Button
              label={savedAt ? 'Saved ✓' : 'Save rates'}
              variant="coin"
              disabled={!!error || !dirty}
              onPress={() => {
                setRates(sortRates(parsed));
                setDraft(sortRates(parsed).map(toDraft));
                setSavedAt(Date.now());
              }}
            />
          </View>
        </Card>

        <Card style={{ flex: 2, minWidth: 280, gap: space.sm }}>
          <Text style={styles.calcTitle}>What customers get</Text>
          <Text style={styles.calcSub}>Preview using the rates on the left{error ? ' (fix errors first)' : ''}.</Text>
          {[1, 3, 5, 10, 15, 20, 50].map((amount) => (
            <View key={amount} style={styles.calcRow}>
              <Text style={styles.calcAmount}>{formatPeso(amount)}</Text>
              <Text style={styles.calcMinutes}>{error ? '—' : formatMinutes(minutesForAmount(amount, parsed))}</Text>
            </View>
          ))}
        </Card>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  cols: { flexDirection: 'row', gap: space.lg, flexWrap: 'wrap', alignItems: 'flex-start' },
  rateRow: { flexDirection: 'row', gap: space.md, alignItems: 'flex-end' },
  remove: { width: 44, height: 48, borderRadius: radius.sm, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.surface },
  removeText: { color: colors.textMuted, fontSize: 16, fontWeight: '700' },
  error: { ...type.body, color: colors.danger },
  actions: { flexDirection: 'row', justifyContent: 'flex-end', gap: space.md, marginTop: space.sm },
  calcTitle: { ...type.h3, color: colors.text },
  calcSub: { ...type.small, color: colors.textFaint, marginBottom: space.sm },
  calcRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: space.sm, borderBottomWidth: 1, borderColor: colors.border },
  calcAmount: { ...type.h3, color: colors.coin },
  calcMinutes: { ...type.h3, color: colors.text, fontVariant: ['tabular-nums'] },
});
