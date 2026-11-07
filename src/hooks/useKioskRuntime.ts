import { useEffect, useRef, useState } from 'react';

import { monotonicNow } from '../services/clock';
import { coinAcceptor } from '../services/coinAcceptor';
import { kiosk } from '../services/kiosk';
import { useSessionStore, type Phase } from '../state/sessionStore';
import { useShopStore } from '../state/shopStore';

/**
 * Wires hardware and the clock into the session store, and performs kiosk
 * side effects on phase changes. Mount once at the root.
 */
export function useKioskRuntime() {
  // Coins -> store
  useEffect(() => coinAcceptor.subscribe((coin) => useSessionStore.getState().insertCoin(coin)), []);

  // 4 ticks/sec keeps the countdown smooth without visible skips.
  useEffect(() => {
    const id = setInterval(() => useSessionStore.getState().tick(), 250);
    return () => clearInterval(id);
  }, []);

  // Phase side effects
  const prevPhase = useRef<Phase>(useSessionStore.getState().phase);
  useEffect(
    () =>
      useSessionStore.subscribe((state) => {
        const prev = prevPhase.current;
        const next = state.phase;
        if (prev === next) return;
        prevPhase.current = next;

        if (next === 'grace') {
          void kiosk.bringLauncherToFront();
        }
        if ((prev === 'active' || prev === 'grace') && (next === 'idle' || next === 'crediting')) {
          const pkgs = useShopStore
            .getState()
            .settings.apps.filter((a) => a.clearOnEnd)
            .map((a) => a.packageName);
          void kiosk.clearSessionData(pkgs);
        }
      }),
    [],
  );
}

/** Monotonic "now" that re-renders the caller at a fixed rate (countdowns). */
export function useNow(intervalMs = 250): number {
  const [now, setNow] = useState(monotonicNow);
  useEffect(() => {
    const id = setInterval(() => setNow(monotonicNow()), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);
  return now;
}
