import { create } from 'zustand';

import { monotonicNow } from '../services/clock';
import { DEFAULT_PIN, hashPin } from '../services/pin';
import { useShopStore } from './shopStore';

export const MAX_PIN_ATTEMPTS = 5;
export const LOCKOUT_MS = 60_000;

export type PinResult = 'ok' | 'wrong' | 'locked';

type AdminState = {
  unlocked: boolean;
  failedAttempts: number;
  lockedUntil: number;
  verifyPin: (pin: string, now?: number) => Promise<PinResult>;
  changePin: (newPin: string) => Promise<void>;
  lock: () => void;
};

export const useAdminStore = create<AdminState>()((set, get) => ({
  unlocked: false,
  failedAttempts: 0,
  lockedUntil: 0,

  verifyPin: async (pin, now = monotonicNow()) => {
    if (now < get().lockedUntil) return 'locked';
    const stored = useShopStore.getState().settings.pinHash ?? (await hashPin(DEFAULT_PIN));
    if ((await hashPin(pin)) === stored) {
      set({ unlocked: true, failedAttempts: 0, lockedUntil: 0 });
      return 'ok';
    }
    const failed = get().failedAttempts + 1;
    if (failed >= MAX_PIN_ATTEMPTS) {
      set({ failedAttempts: 0, lockedUntil: now + LOCKOUT_MS });
      return 'locked';
    }
    set({ failedAttempts: failed });
    return 'wrong';
  },

  changePin: async (newPin) => {
    useShopStore.getState().updateSettings({ pinHash: await hashPin(newPin) });
  },

  lock: () => set({ unlocked: false }),
}));
