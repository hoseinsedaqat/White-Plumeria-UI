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
  type Preferences,
} from '@white-plumeria/core';
import type { ThemeName } from '@white-plumeria/tokens';
import { capabilities, setModifierManager } from '@ember/modifier';
import { glimmer, registerHelper, str } from './runtime.ts';

export interface ToastInput {
  title: string;
  description?: string;
  variant?: 'neutral' | 'success' | 'warning' | 'danger' | 'info';
  duration?: number;
}

export interface ProviderApi {
  el: HTMLElement;
  preferences: Preferences;
  push: (toast: ToastInput) => string;
  dismiss: (id: string) => void;
  setTheme: (theme: ThemeName) => void;
  setAppearance: (appearance: Preferences['appearance']) => void;
  setLocale: (locale: Locale) => void;
  setDirection: (direction: Preferences['direction']) => void;
}

interface SetupState {
  cleanup?: () => void;
}

const providers = new WeakMap<HTMLElement, ProviderApi>();

function appearanceOf(value: string): Preferences['appearance'] | undefined {
  return value === 'light' || value === 'dark' || value === 'system' ? value : undefined;
}

function directionOf(value: string): Preferences['direction'] | undefined {
  return value === 'ltr' || value === 'rtl' || value === 'auto' ? value : undefined;
}

function localeOfValue(value: string): Locale | undefined {
  return value === 'fa' || value === 'en' ? value : undefined;
}

function reducedMotion(): boolean {
  try {
    return window.matchMedia?.('(prefers-reduced-motion: reduce)').matches === true;
  } catch {
    return false;
  }
}

export function mountProvider(
  host: HTMLElement,
  input: { theme?: string; persist?: boolean; appearance?: string; locale?: string; direction?: string } = {},
): () => void {
  host.setAttribute('data-wpl-provider', '');
  host.classList.add('wpl-root', 'wpl-reset', 'wpl-provider');
  const persist = input.persist !== false;
  const stored = persist ? readStoredPreferences() : { ...defaultPreferences };
  const theme = input.theme && isThemeName(input.theme) ? input.theme : undefined;
  const appearance = input.appearance ? appearanceOf(input.appearance) : undefined;
  const locale = input.locale ? localeOfValue(input.locale) : undefined;
  const direction = input.direction ? directionOf(input.direction) : undefined;
  const preferences = sanitizePreferences({
    ...stored,
    ...(theme ? { theme } : {}),
    ...(appearance ? { appearance } : {}),
    ...(locale ? { locale } : {}),
    ...(direction ? { direction } : {}),
  });
  const region = document.createElement('div');
  region.className = 'wpl-toast-region';
  region.setAttribute('role', 'region');
  region.setAttribute('aria-live', 'polite');
  host.append(region);

  const paint = () => {
    applyPreferences(host, preferences);
    region.setAttribute('aria-label', message(preferences.locale, 'notifications'));
    if (persist) storePreferences(preferences);
  };

  const api: ProviderApi = {
    el: host,
    preferences,
    push(toast) {
      const id = createId('toast');
      const variant = toast.variant ?? 'neutral';
      const article = document.createElement('article');
      article.className = toastClassName(variant === 'info' ? 'neutral' : variant);
      article.setAttribute('role', variant === 'danger' ? 'alert' : 'status');
      article.dataset.toastId = id;
      const title = document.createElement('strong');
      title.className = 'wpl-toast-title';
      title.textContent = toast.title;
      article.append(title);
      if (toast.description) {
        const copy = document.createElement('p');
        copy.className = 'wpl-toast-description';
        copy.textContent = toast.description;
        article.append(copy);
      }
      const dismiss = document.createElement('button');
      dismiss.type = 'button';
      dismiss.className = 'wpl-icon-btn wpl-btn-ghost';
      dismiss.setAttribute('aria-label', message(preferences.locale, 'dismiss'));
      dismiss.innerHTML = iconMarkup('close');
      let timer = 0;
      const close = () => {
        window.clearTimeout(timer);
        article.remove();
        host.dispatchEvent(new CustomEvent('wpl-dismiss', { detail: { id }, bubbles: true }));
      };
      dismiss.addEventListener('click', close);
      article.append(dismiss);
      region.append(article);
      if (!reducedMotion()) timer = window.setTimeout(close, toast.duration ?? 5000);
      return id;
    },
    dismiss(id) {
      host.querySelector(`[data-toast-id="${id}"]`)?.remove();
    },
    setTheme(theme) {
      if (preferences.theme === theme) return;
      preferences.theme = theme;
      paint();
    },
    setAppearance(next) {
      if (preferences.appearance === next) return;
      preferences.appearance = next;
      paint();
    },
    setLocale(next) {
      if (preferences.locale === next) return;
      preferences.locale = next;
      paint();
    },
    setDirection(next) {
      if (preferences.direction === next) return;
      preferences.direction = next;
      paint();
    },
  };

  const onTheme = (event: Event) => {
    const themeName = str((event as CustomEvent<{ theme?: string }>).detail?.theme);
    if (themeName && isThemeName(themeName)) api.setTheme(themeName);
  };
  const onAppearance = (event: Event) => {
    const next = appearanceOf(str((event as CustomEvent<{ appearance?: string }>).detail?.appearance));
    if (next) api.setAppearance(next);
  };
  const onLocale = (event: Event) => {
    const next = localeOfValue(str((event as CustomEvent<{ locale?: string }>).detail?.locale));
    if (next) api.setLocale(next);
  };
  const onDirection = (event: Event) => {
    const next = directionOf(str((event as CustomEvent<{ direction?: string }>).detail?.direction));
    if (next) api.setDirection(next);
  };
  host.addEventListener('wpl-theme', onTheme);
  host.addEventListener('wpl-appearance', onAppearance);
  host.addEventListener('wpl-locale', onLocale);
  host.addEventListener('wpl-direction', onDirection);
  paint();
  providers.set(host, api);
  return () => {
    host.removeEventListener('wpl-theme', onTheme);
    host.removeEventListener('wpl-appearance', onAppearance);
    host.removeEventListener('wpl-locale', onLocale);
    host.removeEventListener('wpl-direction', onDirection);
    providers.delete(host);
    region.remove();
  };
}

function providerElement(target: Element): HTMLElement | null {
  const closest = target.closest('[data-wpl-provider]');
  if (closest instanceof HTMLElement && providers.has(closest)) return closest;
  const nested = target.querySelector('[data-wpl-provider]');
  return nested instanceof HTMLElement && providers.has(nested) ? nested : null;
}

export function providerOf(target: Element): ProviderApi | undefined {
  const host = providerElement(target);
  return host ? providers.get(host) : undefined;
}

export function pushToast(target: Element, toast: ToastInput): string {
  const api = providerOf(target);
  if (!api) throw new Error('WhitePlumeriaProvider is required to push a toast.');
  return api.push(toast);
}

export function dismissToast(target: Element, id: string): void {
  providerOf(target)?.dismiss(id);
}

const setup = setModifierManager(
  () => ({
    capabilities: capabilities('3.22'),
    createModifier() {
      return {} as SetupState;
    },
    installModifier(state: SetupState, element: Element, args: { positional: unknown[] }) {
      const [persist, theme, appearance, locale, direction] = args.positional.map((value) => str(value));
      const host = (element.parentElement as HTMLElement | null) ?? (element as HTMLElement);
      state.cleanup = mountProvider(host, {
        persist: persist !== 'false',
        theme,
        appearance,
        locale,
        direction,
      });
    },
    updateModifier() {},
    destroyModifier(state: SetupState) {
      state.cleanup?.();
      state.cleanup = undefined;
    },
  }),
  class SetupModifier {},
);

registerHelper('setup', setup);

export const WhitePlumeriaProvider = glimmer(
  `<div class="wpl-provider" {{setup (if (eq @persist false) "false" "true") (or @theme "") (or @appearance "") (or @locale "") (or @direction "")}}>{{yield}}</div>`,
);
