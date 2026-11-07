import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Switch, Text, TextInput, View, type TextInputProps } from 'react-native';

import { colors, radius, space, type } from '../../theme/tokens';

export function Card({ children, style }: { children: ReactNode; style?: object }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

export function SectionTitle({ title, subtitle, right }: { title: string; subtitle?: string; right?: ReactNode }) {
  return (
    <View style={styles.titleRow}>
      <View style={{ flex: 1 }}>
        <Text style={styles.title} accessibilityRole="header">
          {title}
        </Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>
      {right}
    </View>
  );
}

export function Stat({ label, value, hint, accent }: { label: string; value: string; hint?: string; accent?: string }) {
  return (
    <Card style={styles.stat}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={[styles.statValue, accent ? { color: accent } : null]}>{value}</Text>
      {hint ? <Text style={styles.statHint}>{hint}</Text> : null}
    </Card>
  );
}

export function Field({ label, ...input }: { label: string } & TextInputProps) {
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput placeholderTextColor={colors.textFaint} style={styles.input} accessibilityLabel={label} {...input} />
    </View>
  );
}

export function ToggleRow({ label, hint, value, onChange }: { label: string; hint?: string; value: boolean; onChange: () => void }) {
  return (
    <View style={styles.toggleRow}>
      <View style={{ flex: 1 }}>
        <Text style={styles.toggleLabel}>{label}</Text>
        {hint ? <Text style={styles.toggleHint}>{hint}</Text> : null}
      </View>
      <Switch
        value={value}
        onValueChange={onChange}
        accessibilityLabel={label}
        trackColor={{ false: colors.surfaceHigh, true: colors.time }}
        thumbColor={colors.text}
      />
    </View>
  );
}

export function Stepper({
  label,
  value,
  step,
  min,
  max,
  format,
  onChange,
}: {
  label: string;
  value: number;
  step: number;
  min: number;
  max: number;
  format: (v: number) => string;
  onChange: (v: number) => void;
}) {
  return (
    <View style={styles.toggleRow}>
      <Text style={[styles.toggleLabel, { flex: 1 }]}>{label}</Text>
      <View style={styles.stepper}>
        <StepBtn label="−" onPress={() => onChange(Math.max(min, value - step))} a11y={`Decrease ${label}`} />
        <Text style={styles.stepValue}>{format(value)}</Text>
        <StepBtn label="+" onPress={() => onChange(Math.min(max, value + step))} a11y={`Increase ${label}`} />
      </View>
    </View>
  );
}

function StepBtn({ label, onPress, a11y }: { label: string; onPress: () => void; a11y: string }) {
  return (
    <Pressable onPress={onPress} style={styles.stepBtn} accessibilityRole="button" accessibilityLabel={a11y}>
      <Text style={styles.stepBtnText}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: colors.bgRaised, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, padding: space.xl },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: space.lg, marginBottom: space.lg },
  title: { ...type.h1, color: colors.text },
  subtitle: { ...type.body, color: colors.textMuted, marginTop: 2 },
  stat: { flex: 1, minWidth: 180, gap: space.xs },
  statLabel: { ...type.label, color: colors.textFaint },
  statValue: { ...type.h1, color: colors.text, fontVariant: ['tabular-nums'] },
  statHint: { ...type.small, color: colors.textMuted },
  field: { gap: space.xs, flex: 1 },
  fieldLabel: { ...type.small, color: colors.textMuted },
  input: {
    minHeight: 48,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.bg,
    color: colors.text,
    paddingHorizontal: space.md,
    fontSize: 16,
  },
  toggleRow: { flexDirection: 'row', alignItems: 'center', gap: space.lg, paddingVertical: space.md },
  toggleLabel: { ...type.body, color: colors.text },
  toggleHint: { ...type.small, color: colors.textFaint, marginTop: 2 },
  stepper: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  stepBtn: { width: 44, height: 44, borderRadius: radius.sm, backgroundColor: colors.surfaceHigh, alignItems: 'center', justifyContent: 'center' },
  stepBtnText: { fontSize: 22, fontWeight: '700', color: colors.text },
  stepValue: { ...type.h3, color: colors.text, minWidth: 80, textAlign: 'center', fontVariant: ['tabular-nums'] },
});
