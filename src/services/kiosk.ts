/**
 * Boundary to the native Android kiosk layer (Kotlin module, Device Owner).
 *
 * Native responsibilities (not implemented in this UI phase):
 * - startLockTask / setLockTaskPackages for the enabled apps
 * - user restrictions: no safe boot, factory reset, debugging, app installs
 * - setStatusBarDisabled, app runs as the HOME launcher
 * - bring the lock screen to front when time is up
 * - clearApplicationUserData for apps flagged clearOnEnd
 * - floating timer overlay while another app is in the foreground
 */
export interface KioskController {
  launchApp(packageName: string): Promise<void>;
  bringLauncherToFront(): Promise<void>;
  clearSessionData(packageNames: string[]): Promise<void>;
  exitKioskMode(): Promise<void>;
}

class MockKioskController implements KioskController {
  async launchApp(packageName: string) {
    if (__DEV__) console.log('[kiosk] launch', packageName);
  }
  async bringLauncherToFront() {
    if (__DEV__) console.log('[kiosk] bring launcher to front');
  }
  async clearSessionData(packageNames: string[]) {
    if (__DEV__) console.log('[kiosk] clear data for', packageNames.join(', ') || '(none)');
  }
  async exitKioskMode() {
    if (__DEV__) console.log('[kiosk] exit kiosk mode');
  }
}

export const kiosk: KioskController = new MockKioskController();
