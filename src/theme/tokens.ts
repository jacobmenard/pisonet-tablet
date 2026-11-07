/**
 * Design tokens for the Pisonet tablet UI.
 *
 * Direction: a dark "arcade cabinet" surface so screens stay readable in dim
 * shops and save battery, with a warm coin-gold accent for anything money
 * related and teal for "you have time". Warning colors escalate amber -> red.
 */
export const colors = {
  bg: '#0B1020',
  bgRaised: '#121A33',
  surface: '#18223F',
  surfaceHigh: '#22305A',
  border: '#2B3A66',

  text: '#F4F6FF',
  textMuted: '#A9B3D6',
  textFaint: '#6E7AA6',

  coin: '#FFC83D', // primary accent: coins, prices, insert prompts
  coinDeep: '#E0A100',
  coinInk: '#2A1E00', // text on coin backgrounds

  time: '#2DD4BF', // active session time
  timeInk: '#03211D',

  warn: '#FFA53D',
  danger: '#FF5470',
  dangerInk: '#2B0009',
  success: '#4ADE80',

  overlay: 'rgba(5, 8, 18, 0.82)',
} as const;

export const space = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 48,
} as const;

export const radius = {
  sm: 8,
  md: 14,
  lg: 20,
  xl: 28,
  pill: 999,
} as const;

export const type = {
  display: { fontSize: 72, fontWeight: '800' as const, letterSpacing: -1 },
  timer: { fontSize: 56, fontWeight: '800' as const, fontVariant: ['tabular-nums' as const] },
  h1: { fontSize: 32, fontWeight: '800' as const },
  h2: { fontSize: 22, fontWeight: '700' as const },
  h3: { fontSize: 18, fontWeight: '700' as const },
  body: { fontSize: 16, fontWeight: '500' as const },
  small: { fontSize: 13, fontWeight: '600' as const },
  label: {
    fontSize: 12,
    fontWeight: '700' as const,
    letterSpacing: 1.2,
    textTransform: 'uppercase' as const,
  },
} as const;

/** Minimum touch target for kiosk use (fingers, kids, gloves). */
export const MIN_TOUCH = 56;
