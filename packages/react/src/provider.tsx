import {
  defaultPreferences,
  message,
  readStoredPreferences,
  sanitizePreferences,
  storePreferences,
  applyPreferences,
  type Locale,
  type MessageKey,
  type Preferences,
  type ToastVariant,
} from '@white-plumeria/core';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
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
  preferences: Preferences;
  setPreferences: (next: Partial<Preferences>) => void;
  locale: Locale;
  t: (key: MessageKey) => string;
  toasts: ToastRecord[];
  pushToast: (toast: ToastInput) => string;
  dismissToast: (id: string) => void;
}

const WhitePlumeriaContext = createContext<WhitePlumeriaContextValue | null>(null);

export function WhitePlumeriaProvider({
  children,
  preferences: controlled,
  onPreferencesChange,
  target,
  documentDirection,
}: {
  children: ReactNode;
  preferences?: Preferences;
  onPreferencesChange?: (next: Preferences) => void;
  target?: HTMLElement | null;
  /** Keep the document element on this direction even when preview preferences differ. */
  documentDirection?: 'ltr' | 'rtl';
}) {
  const [internal, setInternal] = useState<Preferences>(defaultPreferences);
  const [ready, setReady] = useState(false);
  const [toasts, setToasts] = useState<ToastRecord[]>([]);
  const preferences = controlled ?? internal;

  useEffect(() => {
    if (!controlled) setInternal(readStoredPreferences());
    setReady(true);
  }, [controlled]);

  useEffect(() => {
    if (!ready || typeof document === 'undefined') return;
    const element = target ?? document.documentElement;
    applyPreferences(element, preferences);
    if (documentDirection) element.dir = documentDirection;
    if (!controlled) storePreferences(preferences);
  }, [documentDirection, preferences, ready, target, controlled]);

  const setPreferences = useCallback(
    (next: Partial<Preferences>) => {
      const merged = sanitizePreferences({ ...preferences, ...next });
      onPreferencesChange?.(merged);
      if (!controlled) setInternal(merged);
    },
    [controlled, onPreferencesChange, preferences],
  );

  const dismissToast = useCallback((id: string) => {
    setToasts((current) => current.filter((item) => item.id !== id));
  }, []);

  const pushToast = useCallback((toast: ToastInput) => {
    const id = `wpl-toast-${Math.random().toString(36).slice(2, 9)}`;
    setToasts((current) => [...current, { ...toast, id }]);
    return id;
  }, []);

  const value = useMemo<WhitePlumeriaContextValue>(
    () => ({
      preferences,
      setPreferences,
      locale: preferences.locale,
      t: (key) => message(preferences.locale, key),
      toasts,
      pushToast,
      dismissToast,
    }),
    [dismissToast, preferences, pushToast, setPreferences, toasts],
  );

  return (
    <WhitePlumeriaContext.Provider value={value}>
      {children}
      <ToastRegion />
    </WhitePlumeriaContext.Provider>
  );
}

export function useWhitePlumeria(): WhitePlumeriaContextValue {
  const value = useContext(WhitePlumeriaContext);
  if (!value) {
    return {
      preferences: defaultPreferences,
      setPreferences: () => {
        throw new Error('WhitePlumeriaProvider is required to change preferences.');
      },
      locale: 'en',
      t: (key) => message('en', key),
      toasts: [],
      pushToast: () => {
        throw new Error('WhitePlumeriaProvider is required to push a toast.');
      },
      dismissToast: () => undefined,
    };
  }
  return value;
}

export function useToast() {
  const { pushToast, dismissToast, toasts } = useWhitePlumeria();
  return { push: pushToast, dismiss: dismissToast, toasts };
}

export function useLocale(): Locale {
  return useWhitePlumeria().locale;
}
