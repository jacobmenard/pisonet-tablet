import { useState } from 'react';
import { Modal, StyleSheet, Text, View } from 'react-native';

import { Button } from '../../components/Button';
import { formatMinutes } from '../../domain/format';
import { kiosk } from '../../services/kiosk';
import { useShopStore } from '../../state/shopStore';
import { colors, radius, space, type } from '../../theme/tokens';
import { Card, Field, SectionTitle, Stepper } from './ui';

const secs = (v: number) => `${v}s`;
const mins = (v: number) => formatMinutes(v / 60);

export function SettingsPanel({ onChangePin }: { onChangePin: () => void }) {
  const settings = useShopStore((s) => s.settings);
  const update = useShopStore((s) => s.updateSettings);
  const [shopName, setShopName] = useState(settings.shopName);
  const [tabletLabel, setTabletLabel] = useState(settings.tabletLabel);
  const [confirmExit, setConfirmExit] = useState(false);
  const t = settings.thresholds;
  const namesDirty = shopName.trim() !== settings.shopName || tabletLabel.trim() !== settings.tabletLabel;

  return (
    <View style={{ gap: space.xl }}>
      <SectionTitle title="Settings" subtitle="Changes apply right away on this tablet." />

      <Card style={{ gap: space.lg }}>
        <Text style={styles.cardTitle}>Shop & tablet</Text>
        <View style={styles.row}>
          <Field label="Shop name (lock screen)" value={shopName} maxLength={28} onChangeText={setShopName} />
          <Field label="Tablet name" value={tabletLabel} maxLength={16} onChangeText={setTabletLabel} />
        </View>
        <View style={styles.end}>
          <Button
            label="Save names"
            variant="coin"
            disabled={!namesDirty || !shopName.trim() || !tabletLabel.trim()}
            onPress={() => update({ shopName: shopName.trim(), tabletLabel: tabletLabel.trim() })}
          />
        </View>
      </Card>

      <View style={styles.row}>
        <Card style={{ flex: 1, minWidth: 320 }}>
          <Text style={styles.cardTitle}>Time warnings</Text>
          <Stepper label="First warning" value={t.lowSec} step={60} min={120} max={900} format={mins}
            onChange={(v) => update({ thresholds: { ...t, lowSec: Math.max(v, t.criticalSec + 60) } })} />
          <Stepper label="Urgent warning" value={t.criticalSec} step={30} min={60} max={300} format={mins}
            onChange={(v) => update({ thresholds: { ...t, criticalSec: Math.min(v, t.lowSec - 60) } })} />
          <Stepper label="Big countdown" value={t.finalSec} step={10} min={10} max={60} format={secs}
            onChange={(v) => update({ thresholds: { ...t, finalSec: Math.min(v, t.criticalSec) } })} />
        </Card>
        <Card style={{ flex: 1, minWidth: 320 }}>
          <Text style={styles.cardTitle}>Session behavior</Text>
          <Stepper label="Auto-start after last coin" value={settings.autoStartSec} step={5} min={5} max={60} format={secs}
            onChange={(v) => update({ autoStartSec: v })} />
          <Stepper label="Grace period after time's up" value={settings.graceSec} step={15} min={0} max={300} format={secs}
            onChange={(v) => update({ graceSec: v })} />
        </Card>
      </View>

      <Card style={{ gap: space.md }}>
        <Text style={styles.cardTitle}>Security</Text>
        <View style={styles.secRow}>
          <Text style={styles.secText}>Staff PIN {settings.pinHash ? 'is set' : 'is still the default (1234)'}</Text>
          <Button label="Change PIN" variant="surface" onPress={onChangePin} />
        </View>
        <View style={styles.secRow}>
          <Text style={styles.secText}>Exit kiosk mode to update Android or install apps. The tablet is unprotected until you re-open this app.</Text>
          <Button label="Exit kiosk mode" variant="danger" onPress={() => setConfirmExit(true)} />
        </View>
      </Card>

      <Modal visible={confirmExit} transparent animationType="fade" onRequestClose={() => setConfirmExit(false)}>
        <View style={styles.scrim}>
          <View style={styles.dialog}>
            <Text style={styles.dialogTitle}>Exit kiosk mode?</Text>
            <Text style={styles.secText}>Customers will be able to use the whole tablet without paying until kiosk mode is back on.</Text>
            <View style={styles.row}>
              <Button label="Stay protected" variant="time" style={{ flex: 1 }} onPress={() => setConfirmExit(false)} />
              <Button
                label="Exit kiosk"
                variant="danger"
                style={{ flex: 1 }}
                onPress={() => {
                  setConfirmExit(false);
                  void kiosk.exitKioskMode();
                }}
              />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: space.lg, flexWrap: 'wrap' },
  end: { flexDirection: 'row', justifyContent: 'flex-end' },
  cardTitle: { ...type.h3, color: colors.text, marginBottom: space.xs },
  secRow: { flexDirection: 'row', alignItems: 'center', gap: space.lg },
  secText: { ...type.body, color: colors.textMuted, flex: 1, lineHeight: 22 },
  scrim: { flex: 1, backgroundColor: colors.overlay, alignItems: 'center', justifyContent: 'center', padding: space.xl },
  dialog: { width: '100%', maxWidth: 520, backgroundColor: colors.bgRaised, borderRadius: radius.xl, padding: space.xxl, gap: space.lg },
  dialogTitle: { ...type.h1, color: colors.text },
});
