import { remainingMs, warningLevel, type WarningLevel } from '../domain/session';
import { useSessionStore } from '../state/sessionStore';
import { useShopStore } from '../state/shopStore';
import { useNow } from './useKioskRuntime';

export function useRemaining(): { msLeft: number; level: WarningLevel } {
  const now = useNow();
  const endsAt = useSessionStore((s) => s.endsAt);
  const thresholds = useShopStore((s) => s.settings.thresholds);
  const msLeft = remainingMs(endsAt, now);
  return { msLeft, level: warningLevel(msLeft, thresholds) };
}
