/**
 * Monotonic milliseconds for session timing.
 *
 * In the JS preview this is performance.now(). On the real tablet, replace it
 * with the native module's SystemClock.elapsedRealtime() so the countdown
 * survives app restarts and ignores manual date/time changes.
 */
export function monotonicNow(): number {
  if (typeof performance !== 'undefined' && typeof performance.now === 'function') {
    return performance.now();
  }
  return Date.now();
}

/** Wall-clock time, used ONLY for sales reports, never for countdowns. */
export function wallNow(): number {
  return Date.now();
}
