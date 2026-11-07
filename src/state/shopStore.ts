import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { DEFAULT_APPS, type KioskApp } from '../domain/apps';
import { DEFAULT_RATES, type Coin, type Rate } from '../domain/rates';
import { DEFAULT_THRESHOLDS, type WarningThresholds } from '../domain/session';

export type CoinRecord = { at: number; coin: Coin };
export type SessionRecord = { startedAt: number; endedAt: number; pesos: number; minutes: number };

export type ShopSettings = {
  shopName: string;
  tabletLabel: string;
  rates: Rate[];
  apps: KioskApp[];
  thresholds: WarningThresholds;
  /** Seconds a customer has to insert another coin after time runs out. */
  graceSec: number;
  /** Seconds of no new coins before a credited session starts by itself. */
  autoStartSec: number;
  /** null = still on the default PIN; the dashboard nags until changed. */
  pinHash: string | null;
};

const MAX_LOG = 5000;

export const DEFAULT_SETTINGS: ShopSettings = {
  shopName: 'Pisonet Tablet',
  tabletLabel: 'Tablet 01',
  rates: DEFAULT_RATES,
  apps: DEFAULT_APPS,
  thresholds: DEFAULT_THRESHOLDS,
  graceSec: 60,
  autoStartSec: 10,
  pinHash: null,
};

type ShopState = {
  settings: ShopSettings;
  coinLog: CoinRecord[];
  sessionLog: SessionRecord[];
  updateSettings: (patch: Partial<ShopSettings>) => void;
  setRates: (rates: Rate[]) => void;
  toggleApp: (id: string, field: 'enabled' | 'clearOnEnd') => void;
  logCoin: (record: CoinRecord) => void;
  logSession: (record: SessionRecord) => void;
  resetSettings: () => void;
};

const trim = <T,>(list: T[]) => (list.length > MAX_LOG ? list.slice(list.length - MAX_LOG) : list);

export const useShopStore = create<ShopState>()(
  persist(
    (set) => ({
      settings: DEFAULT_SETTINGS,
      coinLog: [],
      sessionLog: [],
      updateSettings: (patch) => set((s) => ({ settings: { ...s.settings, ...patch } })),
      setRates: (rates) => set((s) => ({ settings: { ...s.settings, rates } })),
      toggleApp: (id, field) =>
        set((s) => ({
          settings: {
            ...s.settings,
            apps: s.settings.apps.map((a) => (a.id === id ? { ...a, [field]: !a[field] } : a)),
          },
        })),
      logCoin: (record) => set((s) => ({ coinLog: trim([...s.coinLog, record]) })),
      logSession: (record) => set((s) => ({ sessionLog: trim([...s.sessionLog, record]) })),
      resetSettings: () => set((s) => ({ settings: { ...DEFAULT_SETTINGS, pinHash: s.settings.pinHash } })),
    }),
    {
      name: 'pisonet-shop',
      version: 1,
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (s) => ({ settings: s.settings, coinLog: s.coinLog, sessionLog: s.sessionLog }),
    },
  ),
);
