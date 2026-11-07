/**
 * Pure session-timer rules. All times are from a MONOTONIC clock (ms since an
 * arbitrary origin), never wall-clock time, so changing the tablet's date or
 * time cannot add or remove play time.
 */

export type WarningLevel = 'none' | 'low' | 'critical' | 'final';

export type WarningThresholds = {
  /** Show a gentle banner at this many seconds left. */
  lowSec: number;
  /** Show a stronger banner at this many seconds left. */
  criticalSec: number;
  /** Show a full countdown overlay at this many seconds left. */
  finalSec: number;
};

export const DEFAULT_THRESHOLDS: WarningThresholds = {
  lowSec: 5 * 60,
  criticalSec: 60,
  finalSec: 30,
};

export function remainingMs(endsAt: number, now: number): number {
  return Math.max(0, endsAt - now);
}

export function extendEndsAt(endsAt: number, now: number, addMinutes: number): number {
  // If time already ran out, extend from now rather than from the past.
  return Math.max(endsAt, now) + addMinutes * 60_000;
}

export function warningLevel(msLeft: number, t: WarningThresholds): WarningLevel {
  const s = msLeft / 1000;
  if (s <= 0) return 'none';
  if (s <= t.finalSec) return 'final';
  if (s <= t.criticalSec) return 'critical';
  if (s <= t.lowSec) return 'low';
  return 'none';
}
