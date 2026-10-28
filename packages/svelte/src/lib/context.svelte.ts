import {
  applyPreferences,
  defaultPreferences,
  message,
  readStoredPreferences,
  sanitizePreferences,
  storePreferences,
  type MessageKey,
  type Preferences,
  type ToastVariant,
} from '@white-plumeria/core';
import { getContext, setContext } from 'svelte';

export interface ToastInput {
  title: string;
  description?: string;
  variant?: ToastVariant;
}

export interface WplContext {
  preferences: Preferences;
  setPreferences: (next: Partial<Preferences>) => void;
  t: (key: MessageKey) => string;
  toasts: ToastInput[];
  pushToast: (toast: ToastInput) => void;
  dismissToast: (index: number) => void;
}

const key = Symbol('white-plumeria');

export function createPreferences(): Preferences {
  return { ...defaultPreferences };
}

export function setWpl(value: WplContext): void {
  setContext(key, value);
}

export function useWhitePlumeria(): WplContext {
  const value = getContext<WplContext | undefined>(key);
  if (value) return value;
  return {
    preferences: createPreferences(),
    setPreferences() {
      throw new Error('WhitePlumeriaProvider is required to change preferences.');
    },
    t: (messageKey) => message('en', messageKey),
    toasts: [],
    pushToast() {
      throw new Error('WhitePlumeriaProvider is required to push a toast.');
    },
    dismissToast() {
      return undefined;
    },
  };
}

export function persistPreferences(preferences: Preferences): void {
  if (typeof document === 'undefined') return;
  applyPreferences(document.documentElement, preferences);
  storePreferences(preferences);
}

export function storedPreferences(): Preferences {
  return readStoredPreferences();
}

export function mergePreferences(current: Preferences, next: Partial<Preferences>): Preferences {
  return sanitizePreferences({ ...current, ...next });
}
