# Pisonet Tablet: kiosk timer app (UI phase)

A React Native + TypeScript (Expo SDK 58, Expo Router) tablet app. The tablet stays locked until coins are inserted, then unlocks the allowed apps and counts down.

This phase is the **complete UI/UX and session logic**. The coin hardware and the Android kiosk lock are behind interfaces with mock implementations, so the app runs in a browser or dev build today.

## Run it

```bash
npm install
npm run web        # browser preview (landscape, 1280×800 looks like a 10" tablet)
npm test           # rate + session rule tests
npm run typecheck
npx expo lint
```

Use the **Coin simulator** panel (bottom right, dev/web only) to insert ₱1/₱5/₱10/₱20, skip time (−1/−5 min), or unplug the coin slot.

**Staff mode:** tap the shop name on the lock screen **7 times quickly**, then enter PIN **1234** (you'll be asked to change it).

## Screens and flow

```
idle (lock screen) --coin--> crediting --Start / 10s idle--> active (launcher)
                                                              |  coin = more time (+toast)
                                                              v
                     idle <--grace ends / "log me out"-- grace ("Time's up")
                                                              |  coin within 60s
                                                              +--> active (same session)
```

| Screen | File |
|---|---|
| Lock screen (insert coin, rates) | `src/features/kiosk/LockScreen.tsx` |
| Credit / "Start now" + auto-start bar | `LockScreen.tsx` → `CreditPanel` |
| Launcher (allowed apps, time pill, end session) | `src/features/kiosk/LauncherScreen.tsx` |
| Warnings: 5 min banner, 1 min banner, last 30 s countdown | `LauncherScreen.tsx` `WarningBanner`, `FinalCountdown.tsx` |
| Floating timer bubble over apps (draggable) | `FloatingTimer.tsx` (native overlay on device) |
| Coin added toast ("+₱5 · +30 min") | `CoinToast.tsx` |
| Time's up / grace period | `GraceScreen.tsx` |
| Staff PIN (5 tries → 60 s lockout) | `src/app/staff-pin.tsx` |
| Admin: Overview / Rates / Apps / Settings | `src/app/admin/index.tsx`, `src/features/admin/*` |

## Architecture

```
src/
  app/                 Expo Router routes (index = kiosk, staff-pin, admin/*)
  domain/              Pure rules: rates (best-deal calculation), session timer, formatting, app catalog
  state/               Zustand stores: session (in memory), shop settings + sales log (persisted), admin auth
  services/            Hardware/OS boundaries: coinAcceptor, kiosk, clock, pin hashing
  features/kiosk|admin Screens and screen-specific components
  components/          Shared UI (Button, TimePill, PinPad, AppTile, CoinBadge, DevCoinPanel)
  theme/tokens.ts      Colors, spacing, type scale, 56dp minimum touch target
```

Key decisions:
- **Best deal pricing:** coins add up for the whole session and are converted with an unbounded-knapsack over the rate table, so ₱1+₱1+₱1+₱1+₱1 gets the ₱5 promo.
- **Monotonic clock:** countdowns use `performance.now()` here; on device swap in `SystemClock.elapsedRealtime()` so date/time changes can't add time.
- **Privacy:** when a session ends, apps flagged "Log out on end" are cleared via the kiosk service.
- **No brand logos:** app tiles use monograms; the native module can supply real installed icons.

## What the native Android layer still needs (next phase)

Implement `src/services/kiosk.ts` and `src/services/coinAcceptor.ts` as an Expo native module (Kotlin):

1. Device Owner (`adb shell dpm set-device-owner com.pisonet.tablet/.AdminReceiver`), HOME launcher intent filter, `startLockTask` + `setLockTaskPackages`.
2. User restrictions: no safe boot, factory reset, debugging, app installs; `setStatusBarDisabled`.
3. `clearApplicationUserData` for "Log out on end" apps.
4. Overlay service for the floating timer and warnings over other apps.
5. Coin input: USB OTG serial (e.g. ESP32 + CH-926 pulses), BLE or Wi-Fi.
6. Persist the remaining time natively so a reboot or crash doesn't lose the customer's time.
