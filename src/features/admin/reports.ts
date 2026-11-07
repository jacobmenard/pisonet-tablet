import { ACCEPTED_COINS, type Coin } from '../../domain/rates';
import type { CoinRecord, SessionRecord } from '../../state/shopStore';

const DAY = 86_400_000;

export function startOfDay(ts: number): number {
  const d = new Date(ts);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

export type DayTotal = { dayStart: number; pesos: number };

/** Sales totals for the last `days` days, oldest first, including empty days. */
export function dailyTotals(coins: CoinRecord[], now: number, days = 7): DayTotal[] {
  const today = startOfDay(now);
  const out: DayTotal[] = Array.from({ length: days }, (_, i) => ({ dayStart: today - (days - 1 - i) * DAY, pesos: 0 }));
  const first = out[0].dayStart;
  for (const c of coins) {
    if (c.at < first) continue;
    const idx = Math.floor((startOfDay(c.at) - first) / DAY);
    if (idx >= 0 && idx < days) out[idx].pesos += c.coin;
  }
  return out;
}

export function coinBreakdown(coins: CoinRecord[], since: number): Record<Coin, number> {
  const out = Object.fromEntries(ACCEPTED_COINS.map((c) => [c, 0])) as Record<Coin, number>;
  for (const c of coins) if (c.at >= since) out[c.coin] += 1;
  return out;
}

export function todaySummary(coins: CoinRecord[], sessions: SessionRecord[], now: number) {
  const since = startOfDay(now);
  const todayCoins = coins.filter((c) => c.at >= since);
  const todaySessions = sessions.filter((s) => s.endedAt >= since);
  const pesos = todayCoins.reduce((sum, c) => sum + c.coin, 0);
  const avgMinutes = todaySessions.length
    ? todaySessions.reduce((sum, s) => sum + s.minutes, 0) / todaySessions.length
    : 0;
  return { pesos, coinCount: todayCoins.length, sessions: todaySessions.length, avgMinutes };
}

/** Demo data so the preview dashboard isn't empty. Simulator only. */
export function sampleLogs(now: number): { coins: CoinRecord[]; sessions: SessionRecord[] } {
  const coins: CoinRecord[] = [];
  const sessions: SessionRecord[] = [];
  let seed = 7;
  const rand = () => ((seed = (seed * 9301 + 49297) % 233280) / 233280);
  for (let d = 6; d >= 0; d--) {
    const base = startOfDay(now) - d * DAY + 9 * 3_600_000;
    const n = 20 + Math.floor(rand() * 40);
    for (let i = 0; i < n; i++) {
      const coin = ACCEPTED_COINS[Math.floor(rand() * rand() * ACCEPTED_COINS.length)];
      const at = Math.min(now - 60_000, base + Math.floor(rand() * 12 * 3_600_000));
      coins.push({ at, coin });
      if (i % 3 === 0) sessions.push({ startedAt: at - 1_800_000, endedAt: at, pesos: coin * 2, minutes: 20 + Math.floor(rand() * 60) });
    }
  }
  coins.sort((a, b) => a.at - b.at);
  return { coins, sessions };
}
