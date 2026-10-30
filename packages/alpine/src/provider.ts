import {
  applyPreferences,
  defaultPreferences,
  isThemeName,
  message,
  readStoredPreferences,
  sanitizePreferences,
  storePreferences,
  toastClassName,
  type Locale,
  type Preferences,
} from '@white-plumeria/core';
import type { ThemeName } from '@white-plumeria/tokens';
import {
  h,
  onDestroy,
  registerProvider,
  text,
  translate,
  uid,
  unregisterProvider,
  type Config,
  type Magic,
  type ProviderApi,
} from './runtime.ts';

function appearanceOf(value: unknown): Preferences['appearance'] | undefined {
  return value === 'light' || value === 'dark' || value === 'system' ? value : undefined;
}

function directionOf(value: unknown): Preferences['direction'] | undefined {
  return value === 'ltr' || value === 'rtl' || value === 'auto' ? value : undefined;
}

function localeOfConfig(value: unknown): Locale | undefined {
  return value === 'fa' || value === 'en' ? value : undefined;
}

export function WhitePlumeriaProvider(config: Config = {}) {
  return {
    init(this: Magic) {
      const host = this.$el;
      host.setAttribute('data-wpl-provider', '');
      host.classList.add('wpl-root', 'wpl-reset', 'wpl-provider');
      const persist = config.persist !== false;
      const stored = persist ? readStoredPreferences() : defaultPreferences;
      const preferences = sanitizePreferences({
        ...stored,
        ...(isThemeName(text(config.theme)) ? { theme: text(config.theme) as ThemeName } : {}),
        ...(appearanceOf(config.appearance) ? { appearance: appearanceOf(config.appearance) } : {}),
        ...(localeOfConfig(config.locale) ? { locale: localeOfConfig(config.locale) } : {}),
        ...(directionOf(config.direction) ? { direction: directionOf(config.direction) } : {}),
      });
      const region = h('div', {
        className: 'wpl-toast-region',
        attrs: { role: 'region', 'aria-label': message(preferences.locale, 'notifications'), 'aria-live': 'polite' },
      });
      host.append(region);

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
          const id = uid('toast');
          const variant = toast.variant ?? 'neutral';
          let timer = 0;
          const article = h(
            'article',
            {
              className: toastClassName(variant),
              attrs: { role: variant === 'danger' ? 'alert' : 'status', 'data-toast-id': id },
            },
            [
              h('strong', { className: 'wpl-toast-title', text: toast.title }),
              toast.description ? h('p', { className: 'wpl-toast-description', text: toast.description }) : null,
              h('button', {
                className: 'wpl-btn wpl-btn-ghost wpl-btn-sm',
                text: translate(host, 'dismiss'),
                attrs: { type: 'button' },
                on: {
                  click: () => {
                    window.clearTimeout(timer);
                    article.remove();
                    host.dispatchEvent(new CustomEvent('wpl-dismiss', { detail: { id }, bubbles: true }));
                  },
                },
              }),
            ],
          );
          region.append(article);
          const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches === true;
          timer = reduced ? 0 : window.setTimeout(() => article.remove(), toast.duration ?? 5000);
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
          host.dispatchEvent(new CustomEvent('wpl-locale', { detail: { locale }, bubbles: true }));
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
        const appearance = appearanceOf((event as CustomEvent<{ appearance?: string }>).detail?.appearance);
        if (appearance) api.setAppearance(appearance);
      };
      const onLocale = (event: Event) => {
        const locale = localeOfConfig((event as CustomEvent<{ locale?: string }>).detail?.locale);
        if (locale && locale !== preferences.locale) api.setLocale(locale);
      };
      host.addEventListener('wpl-theme', onTheme);
      host.addEventListener('wpl-appearance', onAppearance);
      host.addEventListener('wpl-locale', onLocale);
      onDestroy(host, () => {
        host.removeEventListener('wpl-theme', onTheme);
        host.removeEventListener('wpl-appearance', onAppearance);
        host.removeEventListener('wpl-locale', onLocale);
        unregisterProvider(host);
      });
      paint();
      registerProvider(host, api);
    },
  };
}
