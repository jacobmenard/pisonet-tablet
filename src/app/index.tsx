import { View } from 'react-native';

import { CoinToast } from '../features/kiosk/CoinToast';
import { FinalCountdown } from '../features/kiosk/FinalCountdown';
import { GraceScreen } from '../features/kiosk/GraceScreen';
import { LauncherScreen } from '../features/kiosk/LauncherScreen';
import { LockScreen } from '../features/kiosk/LockScreen';
import { SimulatedApp } from '../features/kiosk/SimulatedApp';
import { useSessionStore } from '../state/sessionStore';
import { useShopStore } from '../state/shopStore';
import { colors } from '../theme/tokens';

/** The kiosk: one route whose content follows the session phase. */
export default function KioskScreen() {
  const phase = useSessionStore((s) => s.phase);
  const runningAppId = useSessionStore((s) => s.runningAppId);
  const runningApp = useShopStore((s) => s.settings.apps.find((a) => a.id === runningAppId));

  let content;
  if (phase === 'active') content = runningApp ? <SimulatedApp app={runningApp} /> : <LauncherScreen />;
  else if (phase === 'grace') content = <GraceScreen />;
  else content = <LockScreen />;

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      {content}
      {phase === 'active' && <FinalCountdown />}
      <CoinToast />
    </View>
  );
}
