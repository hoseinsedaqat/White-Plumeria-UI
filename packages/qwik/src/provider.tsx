import {
  applyPreferences,
  defaultPreferences,
  message,
  readStoredPreferences,
  storePreferences,
  type MessageKey,
  type Preferences,
  type ToastVariant,
} from '@white-plumeria/core';
import { $, component$, createContextId, Slot, useContext, useContextProvider, useStore, useVisibleTask$, type QRL } from '@qwik.dev/core';

export interface ToastInput {
  title: string;
  description?: string;
  variant?: ToastVariant;
  duration?: number;
}

export interface ToastRecord extends ToastInput {
  id: string;
}

interface WhitePlumeriaApi {
  state: {
    preferences: Preferences;
    ready: boolean;
    toasts: ToastRecord[];
  };
  setPreferences: QRL<(next: Partial<Preferences>) => void>;
  pushToast: QRL<(toast: ToastInput) => string>;
  dismissToast: QRL<(id: string) => void>;
  onPreferencesChange$?: QRL<(preferences: Preferences) => void>;
}

export const WhitePlumeriaContext = createContextId<WhitePlumeriaApi>('wpl.context');

export const WhitePlumeriaProvider = component$<{
  preferences?: Preferences;
  target?: HTMLElement;
  onPreferencesChange$?: QRL<(preferences: Preferences) => void>;
}>((props) => {
  const state = useStore({
    preferences: props.preferences ?? defaultPreferences,
    ready: false,
    toasts: [] as ToastRecord[],
  });

  const setPreferences = $((next: Partial<Preferences>) => {
    state.preferences = { ...state.preferences, ...next };
    void props.onPreferencesChange$?.(state.preferences);
  });
  const pushToast = $((toast: ToastInput) => {
    const id = `wpl-toast-${Math.random().toString(36).slice(2, 9)}`;
    state.toasts = [...state.toasts, { ...toast, id }];
    return id;
  });
  const dismissToast = $((id: string) => {
    state.toasts = state.toasts.filter((toast) => toast.id !== id);
  });

  useContextProvider(WhitePlumeriaContext, {
    state,
    setPreferences,
    pushToast,
    dismissToast,
    onPreferencesChange$: props.onPreferencesChange$,
  });

  useVisibleTask$(() => {
    if (!props.preferences) state.preferences = readStoredPreferences();
    state.ready = true;
  });

  useVisibleTask$(({ track }) => {
    const preferences = track(() => state.preferences);
    const ready = track(() => state.ready);
    if (!ready || typeof document === 'undefined') return;
    applyPreferences(props.target ?? document.documentElement, preferences);
    if (!props.preferences) storePreferences(preferences);
  });

  useVisibleTask$(({ track, cleanup }) => {
    const toasts = track(() => state.toasts);
    const reduce = track(() => state.preferences.reducedMotion);
    if (reduce) return;
    const timers = toasts.map((toast) => window.setTimeout(() => dismissToast(toast.id), toast.duration ?? 5000));
    cleanup(() => {
      for (const timer of timers) window.clearTimeout(timer);
    });
  });

  return (
    <>
      <Slot />
      <div class="wpl-toasts" aria-live="polite">
        {state.toasts.map((toast) => (
          <article key={toast.id} class={`wpl-toast${toast.variant ? ` wpl-toast-${toast.variant}` : ''}`} role="status">
            <strong>{toast.title}</strong>
            {toast.description ? <p>{toast.description}</p> : null}
            <button type="button" class="wpl-toast-dismiss" onClick$={() => dismissToast(toast.id)}>
              {message(state.preferences.locale, 'dismiss')}
            </button>
          </article>
        ))}
      </div>
    </>
  );
});

export function useWhitePlumeria() {
  const ctx = useContext(WhitePlumeriaContext, null);
  if (!ctx) {
    return {
      preferences: defaultPreferences,
      locale: defaultPreferences.locale,
      t: (key: MessageKey) => message(defaultPreferences.locale, key),
      toasts: [] as ToastRecord[],
      setPreferences: $(async () => undefined),
      pushToast: $(() => {
        throw new Error('WhitePlumeriaProvider is required to push a toast.');
      }),
      dismissToast: $(async () => undefined),
    };
  }
  return {
    preferences: ctx.state.preferences,
    locale: ctx.state.preferences.locale,
    t: (key: MessageKey) => message(ctx.state.preferences.locale, key),
    toasts: ctx.state.toasts,
    setPreferences: ctx.setPreferences,
    pushToast: ctx.pushToast,
    dismissToast: ctx.dismissToast,
  };
}

export function useLocale() {
  return useWhitePlumeria().locale;
}

export function useToast() {
  const wpl = useWhitePlumeria();
  return {
    push: wpl.pushToast,
    dismiss: wpl.dismissToast,
    toasts: wpl.toasts,
  };
}
