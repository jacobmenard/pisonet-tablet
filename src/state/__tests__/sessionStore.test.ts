import mockAsyncStorage from '@react-native-async-storage/async-storage/jest/async-storage-mock';

import { useSessionStore } from '../sessionStore';
import { DEFAULT_SETTINGS, useShopStore } from '../shopStore';

jest.mock('@react-native-async-storage/async-storage', () => mockAsyncStorage);

const MIN = 60_000;

beforeEach(() => {
  useShopStore.setState({ settings: DEFAULT_SETTINGS, coinLog: [], sessionLog: [] });
  useSessionStore.setState({
    phase: 'idle',
    creditPesos: 0,
    lastCoinAt: 0,
    endsAt: 0,
    graceEndsAt: 0,
    sessionPesos: 0,
    sessionStartedWall: 0,
    runningAppId: null,
    toast: null,
  });
});

const s = () => useSessionStore.getState();

it('collects credit, then auto-starts after the idle delay', () => {
  s().insertCoin(1, 0);
  s().insertCoin(5, 2000);
  expect(s().phase).toBe('crediting');
  expect(s().creditPesos).toBe(6);

  s().tick(2000 + 9_000);
  expect(s().phase).toBe('crediting');

  s().tick(2000 + 10_000);
  expect(s().phase).toBe('active');
  expect(s().endsAt).toBe(12_000 + 35 * MIN);
  expect(useShopStore.getState().coinLog).toHaveLength(2);
});

it('adds time during a session using the best session-wide deal', () => {
  s().insertCoin(1, 0);
  s().startSession(0); // 5 min
  for (let i = 0; i < 4; i++) s().insertCoin(1, 1000);
  // ₱5 total = 30 min promo, not 25
  expect(s().endsAt).toBe(30 * MIN);
  expect(s().toast?.minutes).toBe(10);
});

it('goes to grace when time is up, resumes on coin, ends after grace', () => {
  s().insertCoin(1, 0);
  s().startSession(0);
  s().tick(5 * MIN);
  expect(s().phase).toBe('grace');

  s().insertCoin(1, 5 * MIN + 1000);
  expect(s().phase).toBe('active');

  s().tick(10 * MIN + 1000);
  expect(s().phase).toBe('grace');
  s().tick(10 * MIN + 1000 + 60_000);
  expect(s().phase).toBe('idle');
  expect(useShopStore.getState().sessionLog).toHaveLength(1);
  expect(useShopStore.getState().sessionLog[0].pesos).toBe(2);
});

it('ignores start without credit', () => {
  s().startSession(0);
  expect(s().phase).toBe('idle');
});
