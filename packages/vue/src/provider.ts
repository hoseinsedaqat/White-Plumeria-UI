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
import {
  defineComponent,
  h,
  inject,
  onMounted,
  provide,
  ref,
  watch,
  type InjectionKey,
  type Ref,
} from 'vue';
import { ToastRegion } from './toast.ts';

export interface ToastInput {
  title: string;
  description?: string;
  variant?: ToastVariant;
  duration?: number;
}

export interface ToastRecord extends ToastInput {
  id: string;
}

export interface WhitePlumeriaContext {
  preferences: Ref<Preferences>;
  setPreferences: (next: Partial<Preferences>) => void;
  locale: Ref<Locale>;
  t: (key: MessageKey) => string;
  toasts: Ref<ToastRecord[]>;
  pushToast: (toast: ToastInput) => string;
  dismissToast: (id: string) => void;
}

export const whitePlumeriaKey: InjectionKey<WhitePlumeriaContext> = Symbol('white-plumeria');

export function useWhitePlumeria(): WhitePlumeriaContext {
  const value = inject(whitePlumeriaKey);
  if (!value) {
    const preferences = ref<Preferences>({ ...defaultPreferences });
    return {
      preferences,
      setPreferences: () => {
        throw new Error('WhitePlumeriaProvider is required to change preferences.');
      },
      locale: ref(preferences.value.locale),
      t: (key) => message('en', key),
      toasts: ref([]),
      pushToast: () => {
        throw new Error('WhitePlumeriaProvider is required to push a toast.');
      },
      dismissToast: () => undefined,
    };
  }
  return value;
}

export const WhitePlumeriaProvider = defineComponent({
  name: 'WhitePlumeriaProvider',
  setup(_, { slots }) {
    const preferences = ref<Preferences>({ ...defaultPreferences });
    const ready = ref(false);
    const toasts = ref<ToastRecord[]>([]);

    onMounted(() => {
      preferences.value = readStoredPreferences();
      ready.value = true;
    });

    watch(
      preferences,
      (value) => {
        if (!ready.value || typeof document === 'undefined') return;
        applyPreferences(document.documentElement, value);
        storePreferences(value);
      },
      { deep: true },
    );

    function setPreferences(next: Partial<Preferences>) {
      preferences.value = sanitizePreferences({ ...preferences.value, ...next });
    }

    function dismissToast(id: string) {
      toasts.value = toasts.value.filter((item) => item.id !== id);
    }

    function pushToast(toast: ToastInput) {
      const id = `wpl-toast-${Math.random().toString(36).slice(2, 9)}`;
      toasts.value = [...toasts.value, { ...toast, id }];
      return id;
    }

    const locale = ref<Locale>(preferences.value.locale);
    watch(preferences, (value) => {
      locale.value = value.locale;
    });

    provide(whitePlumeriaKey, {
      preferences,
      setPreferences,
      locale,
      t: (key) => message(preferences.value.locale, key),
      toasts,
      pushToast,
      dismissToast,
    });

    return () => [slots.default?.(), h(ToastRegion)];
  },
});
