import {
  applyPreferences,
  createId,
  defaultPreferences,
  isThemeName,
  message,
  readStoredPreferences,
  sanitizePreferences,
  storePreferences,
  iconMarkup,
  toastClassName,
  type Locale,
  type MessageKey,
  type Preferences,
} from '@white-plumeria/core';
import type { ThemeName } from '@white-plumeria/tokens';

export interface ToastInput {
  title: string;
  description?: string;
  variant?: 'neutral' | 'success' | 'warning' | 'danger';
  duration?: number;
}

export interface ProviderApi {
  el: HTMLElement;
  preferences: Preferences;
  t: (key: MessageKey) => string;
  push: (toast: ToastInput) => string;
  setTheme: (theme: ThemeName) => void;
  setAppearance: (appearance: Preferences['appearance']) => void;
  setLocale: (locale: Locale) => void;
  setDirection: (direction: Preferences['direction']) => void;
}

export interface ProviderInput {
  theme?: string;
  appearance?: Preferences['appearance'];
  locale?: Locale;
  direction?: Preferences['direction'];
  persist?: boolean;
}

const providers = new WeakMap<HTMLElement, ProviderApi>();

export function providerOf(node: Node | null): ProviderApi | null {
  const start = node instanceof Element ? node : (node?.parentElement ?? null);
  const host = start?.closest('[data-wpl-provider]');
  if (!(host instanceof HTMLElement)) return null;
  return providers.get(host) ?? null;
}

export function pushToast(node: Node, toast: ToastInput): string {
  const api = providerOf(node);
  if (!api) throw new Error('WhitePlumeriaProvider is required to push a toast.');
  return api.push(toast);
}

export function useWhitePlumeria(node: Node): ProviderApi {
  const api = providerOf(node);
  if (!api) throw new Error('WhitePlumeriaProvider is required.');
  return api;
}

export function localeOf(node: Node | null): Locale {
  return providerOf(node)?.preferences.locale ?? 'en';
}

function appearanceOf(value: unknown): Preferences['appearance'] | undefined {
  return value === 'light' || value === 'dark' || value === 'system' ? value : undefined;
}

function directionOf(value: unknown): Preferences['direction'] | undefined {
  return value === 'ltr' || value === 'rtl' || value === 'auto' ? value : undefined;
}

function localeOfInput(value: unknown): Locale | undefined {
  return value === 'fa' || value === 'en' ? value : undefined;
}

export function mountProvider(host: HTMLElement, input: ProviderInput = {}): () => void {
  host.setAttribute('data-wpl-provider', '');
  host.classList.add('wpl-root', 'wpl-reset', 'wpl-provider');
  const persist = input.persist !== false;
  const stored = persist ? readStoredPreferences() : { ...defaultPreferences };
  const theme = input.theme;
  const appearance = appearanceOf(input.appearance);
  const locale = localeOfInput(input.locale);
  const direction = directionOf(input.direction);
  const preferences = sanitizePreferences({
    ...stored,
    ...(theme && isThemeName(theme) ? { theme } : {}),
    ...(appearance ? { appearance } : {}),
    ...(locale ? { locale } : {}),
    ...(direction ? { direction } : {}),
  });
  const region =
    host.querySelector<HTMLElement>('[data-wpl-toasts]') ??
    host.appendChild(document.createElement('div'));
  region.className = 'wpl-toast-region';
  region.setAttribute('data-wpl-toasts', '');
  region.setAttribute('role', 'region');
  region.setAttribute('aria-live', 'polite');

  const paint = () => {
    applyPreferences(host, preferences);
    region.setAttribute('aria-label', message(preferences.locale, 'notifications'));
    if (persist) storePreferences(preferences);
  };

  const api: ProviderApi = {
    el: host,
    preferences,
    t: (key) => message(preferences.locale, key),
    push(toast) {
      const id = createId('toast');
      const variant = toast.variant ?? 'neutral';
      const article = document.createElement('article');
      article.className = toastClassName(variant);
      article.setAttribute('role', variant === 'danger' ? 'alert' : 'status');
      article.dataset.toastId = id;
      const title = document.createElement('strong');
      title.className = 'wpl-toast-title';
      title.textContent = toast.title;
      article.append(title);
      if (toast.description) {
        const description = document.createElement('p');
        description.className = 'wpl-toast-description';
        description.textContent = toast.description;
        article.append(description);
      }
      const dismiss = document.createElement('button');
      dismiss.type = 'button';
      dismiss.className = 'wpl-icon-btn wpl-btn-ghost';
      dismiss.setAttribute('aria-label', message(preferences.locale, 'dismiss'));
      dismiss.innerHTML = iconMarkup('close');
      const remove = () => {
        window.clearTimeout(timer);
        article.remove();
        host.dispatchEvent(new CustomEvent('wpl-dismiss', { bubbles: true, detail: { id } }));
      };
      dismiss.addEventListener('click', remove);
      article.append(dismiss);
      region.append(article);
      const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches === true;
      const timer = reduced ? 0 : window.setTimeout(remove, toast.duration ?? 5000);
      if (reduced) article.remove();
      return id;
    },
    setTheme(theme) {
      if (preferences.theme === theme) return;
      preferences.theme = theme;
      paint();
    },
    setAppearance(appearance) {
      if (preferences.appearance === appearance) return;
      preferences.appearance = appearance;
      paint();
    },
    setLocale(locale) {
      if (preferences.locale === locale) return;
      preferences.locale = locale;
      paint();
      host.dispatchEvent(new CustomEvent('wpl-locale', { bubbles: true, detail: { locale } }));
    },
    setDirection(direction) {
      if (preferences.direction === direction) return;
      preferences.direction = direction;
      paint();
    },
  };

  const onTheme = (event: Event) => {
    const theme = (event as CustomEvent<{ theme?: string }>).detail?.theme;
    if (theme && isThemeName(theme)) api.setTheme(theme);
  };
  const onAppearance = (event: Event) => {
    const appearance = appearanceOf(
      (event as CustomEvent<{ appearance?: string }>).detail?.appearance,
    );
    if (appearance) api.setAppearance(appearance);
  };
  const onLocale = (event: Event) => {
    const locale = localeOfInput((event as CustomEvent<{ locale?: string }>).detail?.locale);
    if (locale) api.setLocale(locale);
  };
  host.addEventListener('wpl-theme', onTheme);
  host.addEventListener('wpl-appearance', onAppearance);
  host.addEventListener('wpl-locale', onLocale);
  paint();
  providers.set(host, api);
  return () => {
    host.removeEventListener('wpl-theme', onTheme);
    host.removeEventListener('wpl-appearance', onAppearance);
    host.removeEventListener('wpl-locale', onLocale);
    providers.delete(host);
  };
}
