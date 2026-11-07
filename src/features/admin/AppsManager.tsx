import { StyleSheet, Switch, Text, View } from 'react-native';

import { CATEGORY_COLOR, CATEGORY_LABEL, monogram } from '../../domain/apps';
import { useShopStore } from '../../state/shopStore';
import { colors, radius, space, type } from '../../theme/tokens';
import { Card, SectionTitle } from './ui';

export function AppsManager() {
  const apps = useShopStore((s) => s.settings.apps);
  const toggle = useShopStore((s) => s.toggleApp);
  const enabledCount = apps.filter((a) => a.enabled).length;

  return (
    <View style={{ gap: space.xl }}>
      <SectionTitle
        title="Allowed apps"
        subtitle={`${enabledCount} of ${apps.length} apps visible to customers. Everything else stays blocked.`}
      />
      <Card style={{ paddingVertical: space.sm }}>
        <View style={styles.headRow}>
          <Text style={[styles.head, { flex: 1 }]}>App</Text>
          <Text style={[styles.head, styles.col]}>Show</Text>
          <Text style={[styles.head, styles.col]}>Log out on end</Text>
        </View>
        {apps.map((app, i) => {
          const tint = CATEGORY_COLOR[app.category];
          return (
            <View key={app.id} style={[styles.row, i > 0 && styles.divider]}>
              <View style={[styles.icon, { borderColor: tint, backgroundColor: tint + '22' }]}>
                <Text style={[styles.mono, { color: tint }]}>{monogram(app.name)}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.name, !app.enabled && { color: colors.textFaint }]}>{app.name}</Text>
                <Text style={styles.meta}>
                  {CATEGORY_LABEL[app.category]} · {app.packageName}
                </Text>
              </View>
              <View style={styles.col}>
                <Switch
                  value={app.enabled}
                  onValueChange={() => toggle(app.id, 'enabled')}
                  accessibilityLabel={`Show ${app.name} to customers`}
                  trackColor={{ false: colors.surfaceHigh, true: colors.time }}
                  thumbColor={colors.text}
                />
              </View>
              <View style={styles.col}>
                <Switch
                  value={app.clearOnEnd}
                  onValueChange={() => toggle(app.id, 'clearOnEnd')}
                  accessibilityLabel={`Log out of ${app.name} when a session ends`}
                  trackColor={{ false: colors.surfaceHigh, true: colors.coin }}
                  thumbColor={colors.text}
                />
              </View>
            </View>
          );
        })}
      </Card>
      <Text style={styles.note}>
        “Log out on end” clears the app’s data when a session ends so the next customer can’t open someone else’s account.
        Turn it off for big games to avoid re-downloading game data every session.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  headRow: { flexDirection: 'row', paddingVertical: space.md, alignItems: 'center' },
  head: { ...type.label, color: colors.textFaint },
  col: { width: 150, alignItems: 'center', textAlign: 'center' },
  row: { flexDirection: 'row', alignItems: 'center', gap: space.md, paddingVertical: space.md },
  divider: { borderTopWidth: 1, borderColor: colors.border },
  icon: { width: 44, height: 44, borderRadius: radius.md, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  mono: { fontWeight: '800', fontSize: 15 },
  name: { ...type.h3, color: colors.text },
  meta: { ...type.small, color: colors.textFaint, marginTop: 2 },
  note: { ...type.small, color: colors.textMuted, lineHeight: 19 },
});
