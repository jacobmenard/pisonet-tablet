import { Redirect } from 'expo-router';

/** A kiosk never shows a "page not found" screen; always fall back to the lock screen. */
export default function NotFound() {
  return <Redirect href="/" />;
}
