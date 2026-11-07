import { Pressable, StyleSheet, Text, type PressableProps, type StyleProp, type ViewStyle } from 'react-native';

import { colors, MIN_TOUCH, radius, space, type } from '../theme/tokens';

type Variant = 'coin' | 'time' | 'ghost' | 'danger' | 'surface';
type Size = 'md' | 'lg';

type Props = Omit<PressableProps, 'style' | 'children'> & {
  label: string;
  variant?: Variant;
  size?: Size;
  icon?: string;
  style?: StyleProp<ViewStyle>;
};

const BG: Record<Variant, string> = {
  coin: colors.coin,
  time: colors.time,
  danger: colors.danger,
  surface: colors.surfaceHigh,
  ghost: 'transparent',
};

const FG: Record<Variant, string> = {
  coin: colors.coinInk,
  time: colors.timeInk,
  danger: colors.dangerInk,
  surface: colors.text,
  ghost: colors.textMuted,
};

export function Button({ label, variant = 'surface', size = 'md', icon, style, disabled, ...rest }: Props) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: !!disabled }}
      disabled={disabled}
      style={({ pressed }) => [
        styles.base,
        size === 'lg' && styles.lg,
        { backgroundColor: BG[variant] },
        variant === 'ghost' && styles.ghost,
        pressed && styles.pressed,
        disabled && styles.disabled,
        style,
      ]}
      {...rest}
    >
      <Text style={[styles.label, size === 'lg' && styles.labelLg, { color: FG[variant] }]}>
        {icon ? `${icon}  ` : ''}
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: MIN_TOUCH,
    paddingHorizontal: space.xl,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  lg: { minHeight: 72, paddingHorizontal: space.xxl, borderRadius: radius.lg },
  ghost: { borderWidth: 1, borderColor: colors.border },
  pressed: { opacity: 0.85, transform: [{ scale: 0.98 }] },
  disabled: { opacity: 0.4 },
  label: { ...type.h3 },
  labelLg: { fontSize: 22 },
});
