import type { ThemeName } from '@white-plumeria/tokens';
import { themeNames } from '@white-plumeria/tokens';
import { brand } from './brand.ts';

export type Appearance = 'light' | 'dark' | 'system';
export type Locale = 'en' | 'fa';
export type DirectionPreference = 'ltr' | 'rtl' | 'auto';
export type MotionPreference = 'system' | 'reduce' | 'no-preference';

export interface Preferences {
  theme: ThemeName;
  appearance: Appearance;
  locale: Locale;
  direction: DirectionPreference;
  reducedMotion: MotionPreference;
}

export const defaultPreferences: Preferences = {
  theme: 'ivory',
  appearance: 'system',
  locale: 'en',
  direction: 'auto',
  reducedMotion: 'system',
};

export function isThemeName(value: string): value is ThemeName {
  return (themeNames as readonly string[]).includes(value);
}

export function resolveDirection(preferences: Preferences): 'ltr' | 'rtl' {
  if (preferences.direction === 'auto') return preferences.locale === 'fa' ? 'rtl' : 'ltr';
  return preferences.direction;
}

export function applyPreferences(element: HTMLElement, preferences: Preferences): void {
  element.setAttribute('data-wpl-theme', preferences.theme);
  element.setAttribute('data-wpl-appearance', preferences.appearance);
  if (preferences.appearance === 'system') element.removeAttribute('data-wpl-scheme');
  else element.setAttribute('data-wpl-scheme', preferences.appearance);
  element.dir = resolveDirection(preferences);
  element.lang = preferences.locale === 'fa' ? 'fa' : 'en';
  if (preferences.reducedMotion === 'system') element.removeAttribute('data-wpl-motion');
  else element.setAttribute('data-wpl-motion', preferences.reducedMotion);
}

export function readStoredPreferences(): Preferences {
  if (typeof localStorage === 'undefined') return { ...defaultPreferences };
  try {
    const raw = localStorage.getItem(brand.storageKey);
    if (!raw) return { ...defaultPreferences };
    const parsed = JSON.parse(raw) as Partial<Preferences>;
    return sanitizePreferences(parsed);
  } catch {
    return { ...defaultPreferences };
  }
}

export function storePreferences(preferences: Preferences): void {
  if (typeof localStorage === 'undefined') return;
  try {
    localStorage.setItem(brand.storageKey, JSON.stringify(preferences));
  } catch {
    // Private mode and blocked storage are non-fatal.
  }
}

export function sanitizePreferences(value: Partial<Preferences> | null | undefined): Preferences {
  const theme = value?.theme && isThemeName(value.theme) ? value.theme : defaultPreferences.theme;
  const appearance =
    value?.appearance === 'light' || value?.appearance === 'dark' || value?.appearance === 'system'
      ? value.appearance
      : defaultPreferences.appearance;
  const locale = value?.locale === 'fa' ? 'fa' : 'en';
  const direction =
    value?.direction === 'ltr' || value?.direction === 'rtl' || value?.direction === 'auto'
      ? value.direction
      : 'auto';
  const reducedMotion =
    value?.reducedMotion === 'reduce' ||
    value?.reducedMotion === 'no-preference' ||
    value?.reducedMotion === 'system'
      ? value.reducedMotion
      : 'system';
  return { theme, appearance, locale, direction, reducedMotion };
}

export const themeFlashScript = `(function(){try{var k=${JSON.stringify(brand.storageKey)};var raw=localStorage.getItem(k);var p=raw?JSON.parse(raw):{};var theme=p.theme||"ivory";var appearance=p.appearance||"system";var locale=p.locale==="fa"?"fa":"en";var dir=p.direction==="rtl"||p.direction==="ltr"?p.direction:(locale==="fa"?"rtl":"ltr");var root=document.documentElement;root.setAttribute("data-wpl-theme",theme);root.setAttribute("data-wpl-appearance",appearance);if(appearance==="system"){root.removeAttribute("data-wpl-scheme");}else{root.setAttribute("data-wpl-scheme",appearance);}root.lang=locale;root.dir=dir;if(p.reducedMotion&&p.reducedMotion!=="system"){root.setAttribute("data-wpl-motion",p.reducedMotion);}}catch(e){}})();`;
