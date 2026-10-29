import {
  applyPreferences,
  defaultPreferences,
  message,
  readStoredPreferences,
  sanitizePreferences,
  storePreferences,
  type Locale,
  type MessageKey,
  type Preferences,
  type ToastVariant,
} from '@white-plumeria/core';
import { createContext, createEffect, createSignal, onMount, useContext, type JSX } from 'solid-js';
import { ToastRegion } from './toast.tsx';

export interface ToastInput {
  title: string;
  description?: string;
  variant?: ToastVariant;
  duration?: number;
}

export interface ToastRecord extends ToastInput {
  id: string;
}

interface WhitePlumeriaContextValue {
  preferences: () => Preferences;
  setPreferences: (next: Partial<Preferences>) => void;
  locale: () => Locale;
  t: (key: MessageKey) => string;
  toasts: () => ToastRecord[];
  pushToast: (toast: ToastInput) => string;
  dismissToast: (id: string) => void;
}

const WhitePlumeriaContext = createContext<WhitePlumeriaContextValue>();

export function WhitePlumeriaProvider(props: {
  children: JSX.Element;
  preferences?: Preferences;
  onPreferencesChange?: (next: Preferences) => void;
  target?: HTMLElement | null;
}) {
  const [internal, setInternal] = createSignal<Preferences>({ ...defaultPreferences });
  const [ready, setReady] = createSignal(false);
  const [toasts, setToasts] = createSignal<ToastRecord[]>([]);
  const preferences = () => props.preferences ?? internal();

  onMount(() => {
    if (!props.preferences) setInternal(readStoredPreferences());
    setReady(true);
  });

  createEffect(() => {
    if (!ready() || typeof document === 'undefined') return;
    const current = preferences();
    applyPreferences(props.target ?? document.documentElement, current);
    if (!props.preferences) storePreferences(current);
  });

  function setPreferences(next: Partial<Preferences>) {
    const merged = sanitizePreferences({ ...preferences(), ...next });
    props.onPreferencesChange?.(merged);
    if (!props.preferences) setInternal(merged);
  }

  function dismissToast(id: string) {
    setToasts((current) => current.filter((item) => item.id !== id));
  }

  function pushToast(toast: ToastInput) {
    const id = `wpl-toast-${Math.random().toString(36).slice(2, 9)}`;
    setToasts((current) => [...current, { ...toast, id }]);
    return id;
  }

  const value: WhitePlumeriaContextValue = {
    preferences,
    setPreferences,
    locale: () => preferences().locale,
    t: (key) => message(preferences().locale, key),
    toasts,
    pushToast,
    dismissToast,
  };

  return (
    <WhitePlumeriaContext.Provider value={value}>
      {props.children}
      <ToastRegion />
    </WhitePlumeriaContext.Provider>
  );
}

function fallback(): WhitePlumeriaContextValue {
  return {
    preferences: () => ({ ...defaultPreferences }),
    setPreferences: () => {
      throw new Error('WhitePlumeriaProvider is required to change preferences.');
    },
    locale: () => 'en',
    t: (key) => message('en', key),
    toasts: () => [],
    pushToast: () => {
      throw new Error('WhitePlumeriaProvider is required to push a toast.');
    },
    dismissToast: () => undefined,
  };
}

export function useWhitePlumeria(): WhitePlumeriaContextValue {
  return useContext(WhitePlumeriaContext) ?? fallback();
}

export function useToast() {
  const { pushToast, dismissToast, toasts } = useWhitePlumeria();
  return { push: pushToast, dismiss: dismissToast, toasts };
}

export function useLocale(): Locale {
  return useWhitePlumeria().locale();
}
