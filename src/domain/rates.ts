export type Rate = {
  id: string;
  /** Price in whole pesos. */
  price: number;
  /** Minutes granted for that price. */
  minutes: number;
  /** Optional label shown on the lock screen, e.g. "Best value". */
  label?: string;
};

export const DEFAULT_RATES: Rate[] = [
  { id: 'r1', price: 1, minutes: 5 },
  { id: 'r5', price: 5, minutes: 30, label: 'Promo' },
  { id: 'r10', price: 10, minutes: 65 },
  { id: 'r20', price: 20, minutes: 140, label: 'Best value' },
];

/** Philippine coins a typical multi-coin acceptor is calibrated for. */
export const ACCEPTED_COINS = [1, 5, 10, 20] as const;
export type Coin = (typeof ACCEPTED_COINS)[number];

export type RateValidationError =
  | 'empty'
  | 'missing-base-rate'
  | 'invalid-value'
  | 'duplicate-price';

/**
 * Rates must include a ₱1 base rate so that any amount of credit converts to
 * time, and prices/minutes must be positive whole numbers.
 */
export function validateRates(rates: Rate[]): RateValidationError | null {
  if (rates.length === 0) return 'empty';
  const prices = new Set<number>();
  for (const r of rates) {
    if (!Number.isInteger(r.price) || !Number.isInteger(r.minutes) || r.price <= 0 || r.minutes <= 0) {
      return 'invalid-value';
    }
    if (prices.has(r.price)) return 'duplicate-price';
    prices.add(r.price);
  }
  if (!prices.has(1)) return 'missing-base-rate';
  return null;
}

/**
 * Converts a peso amount into the most minutes the customer is entitled to,
 * combining rates freely (unbounded knapsack over exact amounts). Customers
 * always get the best deal, regardless of the order coins were inserted.
 *
 * Example with defaults: ₱6 = ₱5 promo (30) + ₱1 (5) = 35 minutes.
 */
export function minutesForAmount(amount: number, rates: Rate[]): number {
  if (amount <= 0) return 0;
  const best = new Array<number>(amount + 1).fill(-Infinity);
  best[0] = 0;
  for (let a = 1; a <= amount; a++) {
    for (const r of rates) {
      if (r.price <= a && best[a - r.price] !== -Infinity) {
        best[a] = Math.max(best[a], best[a - r.price] + r.minutes);
      }
    }
  }
  return best[amount] === -Infinity ? 0 : best[amount];
}

/** Sorted copy for display (cheapest first). */
export function sortRates(rates: Rate[]): Rate[] {
  return [...rates].sort((a, b) => a.price - b.price);
}
