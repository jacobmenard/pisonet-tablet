import { Pressable, StyleSheet, Text, View } from 'react-native';

import { CATEGORY_COLOR, monogram, type KioskApp } from '../domain/apps';
import { colors, radius, space, type } from '../theme/tokens';

type Props = { app: KioskApp; onPress: () => void; size: number };

export function AppTile({ app, onPress, size }: Props) {
  const tint = CATEGORY_COLOR[app.category];
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Open ${app.name}`}
      style={({ pressed }) => [styles.tile, { width: size }, pressed && styles.pressed]}
    >
      <View style={[styles.icon, { width: size * 0.62, height: size * 0.62, backgroundColor: tint + '26', borderColor: tint }]}>
        <Text style={[styles.mono, { color: tint, fontSize: size * 0.2 }]}>{monogram(app.name)}</Text>
      </View>
      <Text style={styles.name} numberOfLines={2}>
        {app.name}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  tile: {
    alignItems: 'center',
    paddingVertical: space.lg,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    gap: space.md,
  },
  pressed: { backgroundColor: colors.surfaceHigh, transform: [{ scale: 0.97 }] },
  icon: { borderRadius: radius.lg, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  mono: { fontWeight: '800' },
  name: { ...type.body, color: colors.text, textAlign: 'center', paddingHorizontal: space.sm },
});
