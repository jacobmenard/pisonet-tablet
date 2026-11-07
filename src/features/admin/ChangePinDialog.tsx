import { useState } from 'react';
import { Modal, StyleSheet, Text, View } from 'react-native';

import { Button } from '../../components/Button';
import { PinDots, PinPad } from '../../components/PinPad';
import { DEFAULT_PIN } from '../../services/pin';
import { useAdminStore } from '../../state/adminStore';
import { colors, radius, space, type } from '../../theme/tokens';

const LEN = 4;

/** New PIN, then confirm. Rejects the default PIN and mismatches. */
export function ChangePinDialog({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.scrim}>
        {/* Mounting only while visible gives every opening a fresh state. */}
        {visible && <ChangePinFlow onClose={onClose} />}
      </View>
    </Modal>
  );
}

function ChangePinFlow({ onClose }: { onClose: () => void }) {
  const changePin = useAdminStore((s) => s.changePin);
  const [first, setFirst] = useState<string | null>(null);
  const [pin, setPin] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const onChange = (next: string) => {
    if (next.length !== LEN) {
      setPin(next);
      return;
    }
    setPin('');
    if (first === null) {
      if (next === DEFAULT_PIN) {
        setMessage('Pick something other than 1234.');
        return;
      }
      setFirst(next);
      setMessage(null);
      return;
    }
    if (next !== first) {
      setMessage("PINs didn’t match. Start again.");
      setFirst(null);
      return;
    }
    void changePin(next).then(() => setDone(true));
  };

  return (
    <View style={styles.dialog}>
      {done ? (
        <>
          <Text style={styles.title}>PIN changed ✓</Text>
          <Text style={styles.sub}>Use the new PIN next time you open staff access.</Text>
          <Button label="Done" variant="time" onPress={onClose} style={{ minWidth: 252 }} />
        </>
      ) : (
        <>
          <Text style={styles.title}>{first === null ? 'New PIN' : 'Confirm new PIN'}</Text>
          <PinDots length={LEN} filled={pin.length} />
          <Text style={styles.msg}>{message ?? ' '}</Text>
          <PinPad value={pin} maxLength={LEN} onChange={onChange} />
          <Button label="Cancel" variant="ghost" onPress={onClose} style={{ minWidth: 252 }} />
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  scrim: { flex: 1, backgroundColor: colors.overlay, alignItems: 'center', justifyContent: 'center' },
  dialog: { backgroundColor: colors.bgRaised, borderRadius: radius.xl, padding: space.xxl, alignItems: 'center', gap: space.lg },
  title: { ...type.h1, color: colors.text },
  sub: { ...type.body, color: colors.textMuted },
  msg: { ...type.body, color: colors.danger, minHeight: 22 },
});
