export type AppCategory = 'video' | 'social' | 'games' | 'web' | 'kids' | 'tools';

export type KioskApp = {
  id: string;
  name: string;
  /** Android package name used by the native launcher module. */
  packageName: string;
  category: AppCategory;
  /** Shown to customers only when true. */
  enabled: boolean;
  /** Clear this app's data (log out accounts) when a session ends. */
  clearOnEnd: boolean;
};

/**
 * Starter catalog. Tiles render a neutral monogram rather than brand logos;
 * on device the native module can supply the real installed app icon.
 */
export const DEFAULT_APPS: KioskApp[] = [
  { id: 'youtube', name: 'YouTube', packageName: 'com.google.android.youtube', category: 'video', enabled: true, clearOnEnd: true },
  { id: 'facebook', name: 'Facebook', packageName: 'com.facebook.katana', category: 'social', enabled: true, clearOnEnd: true },
  { id: 'messenger', name: 'Messenger', packageName: 'com.facebook.orca', category: 'social', enabled: true, clearOnEnd: true },
  { id: 'tiktok', name: 'TikTok', packageName: 'com.zhiliaoapp.musically', category: 'video', enabled: true, clearOnEnd: true },
  { id: 'chrome', name: 'Chrome', packageName: 'com.android.chrome', category: 'web', enabled: true, clearOnEnd: true },
  { id: 'mlbb', name: 'Mobile Legends', packageName: 'com.mobile.legends', category: 'games', enabled: true, clearOnEnd: false },
  { id: 'roblox', name: 'Roblox', packageName: 'com.roblox.client', category: 'games', enabled: true, clearOnEnd: true },
  { id: 'codm', name: 'Call of Duty Mobile', packageName: 'com.activision.callofduty.shooter', category: 'games', enabled: false, clearOnEnd: false },
  { id: 'ytkids', name: 'YouTube Kids', packageName: 'com.google.android.apps.youtube.kids', category: 'kids', enabled: true, clearOnEnd: false },
  { id: 'calculator', name: 'Calculator', packageName: 'com.google.android.calculator', category: 'tools', enabled: false, clearOnEnd: false },
];

export const CATEGORY_LABEL: Record<AppCategory, string> = {
  video: 'Video',
  social: 'Social',
  games: 'Games',
  web: 'Web',
  kids: 'Kids',
  tools: 'Tools',
};

export const CATEGORY_COLOR: Record<AppCategory, string> = {
  video: '#FF6B6B',
  social: '#5B8CFF',
  games: '#A78BFA',
  web: '#2DD4BF',
  kids: '#FFC83D',
  tools: '#94A3B8',
};

/** "Mobile Legends" -> "ML", "YouTube" -> "YO" */
export function monogram(name: string): string {
  const words = name.trim().split(/\s+/);
  if (words.length >= 2) return (words[0][0] + words[1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
}
