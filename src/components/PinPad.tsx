import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, radius, space, type } from '../theme/tokens';

const KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', 'clear', '0', 'back'] as const;

type Props = {
  value: string;
  maxLength?: number;
  onChange: (next: string) => void;
  disabled?: boolean;
};

export function PinPad({ value, maxLength = 8, onChange, disabled }: Props) {
  const press = (k: (typeof KEYS)[number]) => {
    if (disabled) return;
    if (k === 'clear') onChange('');
    else if (k === 'back') onChange(value.slice(0, -1));
    else if (value.length < maxLength) onChange(value + k);
  };

  return (
    <View style={styles.grid}>
      {KEYS.map((k) => (
        <Pressable
          key={k}
          onPress={() => press(k)}
          disabled={disabled}
          accessibilityRole="button"
          accessibilityLabel={k === 'clear' ? 'Clear' : k === 'back' ? 'Delete' : k}
          style={({ pressed }) => [styles.key, pressed && styles.keyPressed, disabled && styles.keyDisabled]}
        >
          <Text style={[styles.keyText, k.length > 1 && styles.keyTextSmall]}>
            {k === 'clear' ? 'Clear' : k === 'back' ? '⌫' : k}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}

export function PinDots({ length, filled, error }: { length: number; filled: number; error?: boolean }) {
  return (
    <View style={styles.dots} accessibilityLabel={`${filled} digits entered`}>
      {Array.from({ length }).map((_, i) => (
        <View
          key={i}
          style={[styles.dot, i < filled && styles.dotFilled, error && styles.dotError]}
        />
      ))}
    </View>
  );
}

const KEY = 76;

const styles = StyleSheet.create({
  grid: { width: KEY * 3 + space.md * 2, flexDirection: 'row', flexWrap: 'wrap', gap: space.md },
  key: {
    width: KEY,
    height: KEY,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  keyPressed: { backgroundColor: colors.surfaceHigh },
  keyDisabled: { opacity: 0.4 },
  keyText: { fontSize: 28, fontWeight: '700', color: colors.text },
  keyTextSmall: { ...type.body },
  dots: { flexDirection: 'row', gap: space.md, minHeight: 20 },
  dot: { width: 16, height: 16, borderRadius: 8, borderWidth: 2, borderColor: colors.textFaint },
  dotFilled: { backgroundColor: colors.coin, borderColor: colors.coin },
  dotError: { borderColor: colors.danger, backgroundColor: colors.danger },
});
