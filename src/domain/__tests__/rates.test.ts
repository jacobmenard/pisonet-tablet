import { DEFAULT_RATES, minutesForAmount, validateRates, type Rate } from '../rates';
import { extendEndsAt, warningLevel, DEFAULT_THRESHOLDS } from '../session';
import { formatClock, formatMinutes } from '../format';

describe('minutesForAmount', () => {
  it('uses the base rate for single pesos', () => {
    expect(minutesForAmount(1, DEFAULT_RATES)).toBe(5);
    expect(minutesForAmount(3, DEFAULT_RATES)).toBe(15);
  });

  it('applies promos regardless of coin order', () => {
    expect(minutesForAmount(5, DEFAULT_RATES)).toBe(30);
    expect(minutesForAmount(6, DEFAULT_RATES)).toBe(35);
    expect(minutesForAmount(20, DEFAULT_RATES)).toBe(140);
    expect(minutesForAmount(25, DEFAULT_RATES)).toBe(170);
  });

  it('returns 0 for no credit', () => {
    expect(minutesForAmount(0, DEFAULT_RATES)).toBe(0);
  });

  it('never gives fewer minutes when more is paid', () => {
    for (let a = 1; a < 60; a++) {
      expect(minutesForAmount(a + 1, DEFAULT_RATES)).toBeGreaterThan(minutesForAmount(a, DEFAULT_RATES));
    }
  });
});

describe('validateRates', () => {
  const base: Rate = { id: 'a', price: 1, minutes: 5 };
  it('accepts defaults', () => expect(validateRates(DEFAULT_RATES)).toBeNull());
  it('requires a ₱1 rate', () => expect(validateRates([{ id: 'b', price: 5, minutes: 30 }])).toBe('missing-base-rate'));
  it('rejects duplicates', () => expect(validateRates([base, { ...base, id: 'c' }])).toBe('duplicate-price'));
  it('rejects zero/negative', () => expect(validateRates([{ ...base, minutes: 0 }])).toBe('invalid-value'));
  it('rejects empty', () => expect(validateRates([])).toBe('empty'));
});

describe('session rules', () => {
  it('extends from now when time already ran out', () => {
    expect(extendEndsAt(1000, 5000, 1)).toBe(65_000);
    expect(extendEndsAt(10_000, 5000, 1)).toBe(70_000);
  });

  it('escalates warnings', () => {
    expect(warningLevel(10 * 60_000, DEFAULT_THRESHOLDS)).toBe('none');
    expect(warningLevel(4 * 60_000, DEFAULT_THRESHOLDS)).toBe('low');
    expect(warningLevel(45_000, DEFAULT_THRESHOLDS)).toBe('critical');
    expect(warningLevel(10_000, DEFAULT_THRESHOLDS)).toBe('final');
    expect(warningLevel(0, DEFAULT_THRESHOLDS)).toBe('none');
  });
});

describe('format', () => {
  it('formats clocks', () => {
    expect(formatClock(65_000)).toBe('01:05');
    expect(formatClock(3_725_000)).toBe('1:02:05');
    expect(formatClock(-5)).toBe('00:00');
  });
  it('formats minutes', () => {
    expect(formatMinutes(45)).toBe('45 min');
    expect(formatMinutes(60)).toBe('1 hr');
    expect(formatMinutes(125)).toBe('2h 5m');
  });
});
