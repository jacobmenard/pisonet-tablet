import { create } from 'zustand';

import { minutesForAmount, type Coin } from '../domain/rates';
import { extendEndsAt, remainingMs } from '../domain/session';
import { monotonicNow, wallNow } from '../services/clock';
import { useShopStore } from './shopStore';

/**
 * idle      -> lock screen, waiting for a coin
 * crediting -> coins inserted, waiting for "Start" or auto-start
 * active    -> unlocked, countdown running
 * grace     -> time is up, locked; a coin within graceSec resumes the session
 */
export type Phase = 'idle' | 'crediting' | 'active' | 'grace';

export type CoinToast = { id: number; coin: Coin; minutes: number };

type SessionState = {
  phase: Phase;
  /** Pesos inserted before the session starts. */
  creditPesos: number;
  lastCoinAt: number;
  /** Monotonic ms when the session ends. */
  endsAt: number;
  graceEndsAt: number;
  /** Total pesos for the whole session (for best-deal calculation and reports). */
  sessionPesos: number;
  sessionStartedWall: number;
  /** Preview only: which app the customer "opened". */
  runningAppId: string | null;
  toast: CoinToast | null;

  insertCoin: (coin: Coin, now?: number) => void;
  startSession: (now?: number) => void;
  tick: (now?: number) => void;
  endSession: () => void;
  /** Staff-granted time; not counted as sales. */
  addFreeMinutes: (minutes: number, now?: number) => void;
  openApp: (id: string | null) => void;
  dismissToast: () => void;
};

const INITIAL = {
  phase: 'idle' as Phase,
  creditPesos: 0,
  lastCoinAt: 0,
  endsAt: 0,
  graceEndsAt: 0,
  sessionPesos: 0,
  sessionStartedWall: 0,
  runningAppId: null,
  toast: null,
};

let toastSeq = 0;

export const useSessionStore = create<SessionState>()((set, get) => ({
  ...INITIAL,

  insertCoin: (coin, now = monotonicNow()) => {
    const shop = useShopStore.getState();
    const { rates } = shop.settings;
    shop.logCoin({ at: wallNow(), coin });
    const s = get();

    switch (s.phase) {
      case 'idle':
      case 'crediting':
        set({ phase: 'crediting', creditPesos: s.creditPesos + coin, lastCoinAt: now });
        return;
      case 'active':
      case 'grace': {
        // Customers get the best deal for the session's running total.
        const added = minutesForAmount(s.sessionPesos + coin, rates) - minutesForAmount(s.sessionPesos, rates);
        set({
          phase: 'active',
          sessionPesos: s.sessionPesos + coin,
          endsAt: extendEndsAt(s.endsAt, now, added),
          graceEndsAt: 0,
          toast: { id: ++toastSeq, coin, minutes: added },
        });
        return;
      }
    }
  },

  startSession: (now = monotonicNow()) => {
    const s = get();
    if (s.phase !== 'crediting' || s.creditPesos <= 0) return;
    const minutes = minutesForAmount(s.creditPesos, useShopStore.getState().settings.rates);
    set({
      phase: 'active',
      endsAt: now + minutes * 60_000,
      sessionPesos: s.creditPesos,
      sessionStartedWall: wallNow(),
      creditPesos: 0,
    });
  },

  tick: (now = monotonicNow()) => {
    const s = get();
    const { autoStartSec, graceSec } = useShopStore.getState().settings;
    if (s.phase === 'crediting' && now - s.lastCoinAt >= autoStartSec * 1000) {
      get().startSession(now);
    } else if (s.phase === 'active' && remainingMs(s.endsAt, now) === 0) {
      set({ phase: 'grace', graceEndsAt: now + graceSec * 1000, runningAppId: null });
    } else if (s.phase === 'grace' && now >= s.graceEndsAt) {
      get().endSession();
    }
  },

  endSession: () => {
    const s = get();
    if (s.sessionPesos > 0) {
      const { rates } = useShopStore.getState().settings;
      useShopStore.getState().logSession({
        startedAt: s.sessionStartedWall,
        endedAt: wallNow(),
        pesos: s.sessionPesos,
        minutes: minutesForAmount(s.sessionPesos, rates),
      });
    }
    // Credit inserted but never started stays on the tablet for the next start.
    set({ ...INITIAL, phase: s.creditPesos > 0 ? 'crediting' : 'idle', creditPesos: s.creditPesos, lastCoinAt: s.lastCoinAt });
  },

  addFreeMinutes: (minutes, now = monotonicNow()) => {
    if (minutes <= 0) return;
    // Pending coin credit is started first so the customer never loses it.
    if (get().phase === 'crediting') get().startSession(now);
    const s = get();
    if (s.phase === 'active' || s.phase === 'grace') {
      set({ phase: 'active', endsAt: extendEndsAt(s.endsAt, now, minutes), graceEndsAt: 0 });
    } else {
      set({ phase: 'active', endsAt: now + minutes * 60_000, sessionStartedWall: wallNow() });
    }
  },

  openApp: (id) => set({ runningAppId: id }),
  dismissToast: () => set({ toast: null }),
}));
