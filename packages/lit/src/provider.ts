import {
  applyPreferences,
  defaultPreferences,
  message,
  readStoredPreferences,
  sanitizePreferences,
  storePreferences,
  toastClassName,
  type MessageKey,
  type Preferences,
  type ToastVariant,
} from '@white-plumeria/core';
import { render, type PropertyValues } from 'lit';
import { emit, html, nothing, WplHost } from './element';
import { iconSvg } from './icon';

export interface ToastInput {
  title: string;
  description?: string;
  variant?: ToastVariant;
  duration?: number;
}

export interface ToastRecord extends ToastInput {
  id: string;
}

export class WhitePlumeriaProvider extends WplHost {
  static override properties = {
    theme: { type: String },
    appearance: { type: String },
    locale: { type: String },
    direction: { type: String },
    reducedMotion: { type: String, attribute: 'reduced-motion' },
    persist: { type: Boolean },
  };

  declare theme: Preferences['theme'];
  declare appearance: Preferences['appearance'];
  declare locale: Preferences['locale'];
  declare direction: Preferences['direction'];
  declare reducedMotion: Preferences['reducedMotion'];
  declare persist: boolean;

  private readonly region = document.createElement('div');
  private records: ToastRecord[] = [];
  private timers = new Map<string, number>();
  private seeded = false;
  target: HTMLElement | null = null;

  constructor() {
    super();
    this.theme = defaultPreferences.theme;
    this.appearance = defaultPreferences.appearance;
    this.locale = defaultPreferences.locale;
    this.direction = defaultPreferences.direction;
    this.reducedMotion = defaultPreferences.reducedMotion;
    this.persist = true;
  }

  override connectedCallback(): void {
    if (!this.seeded && !this.hasAttribute('theme') && !this.hasAttribute('locale')) {
      const stored = readStoredPreferences();
      this.theme = stored.theme;
      this.appearance = stored.appearance;
      this.locale = stored.locale;
      this.direction = stored.direction;
      this.reducedMotion = stored.reducedMotion;
    }
    this.seeded = true;
    super.connectedCallback();
  }

  override disconnectedCallback(): void {
    for (const timer of this.timers.values()) window.clearTimeout(timer);
    this.timers.clear();
    super.disconnectedCallback();
  }

  get toasts(): readonly ToastRecord[] {
    return this.records;
  }

  preferences(): Preferences {
    return sanitizePreferences({
      theme: this.theme,
      appearance: this.appearance,
      locale: this.locale,
      direction: this.direction,
      reducedMotion: this.reducedMotion,
    });
  }

  setPreferences(next: Partial<Preferences>): void {
    const merged = sanitizePreferences({ ...this.preferences(), ...next });
    this.theme = merged.theme;
    this.appearance = merged.appearance;
    this.locale = merged.locale;
    this.direction = merged.direction;
    this.reducedMotion = merged.reducedMotion;
    if (this.persist) storePreferences(merged);
    emit(this, 'wpl-preferences-change', { preferences: merged });
  }

  pushToast(input: ToastInput): string {
    const id = `wpl-toast-${Math.random().toString(36).slice(2, 9)}`;
    this.records = [...this.records, { ...input, id }];
    if (this.reducedMotion !== 'reduce') {
      const timer = window.setTimeout(() => this.dismissToast(id), input.duration ?? 5000);
      this.timers.set(id, timer);
    }
    this.requestUpdate();
    return id;
  }

  dismissToast(id: string): void {
    const timer = this.timers.get(id);
    if (timer) window.clearTimeout(timer);
    this.timers.delete(id);
    this.records = this.records.filter((toast) => toast.id !== id);
    this.requestUpdate();
    emit(this, 'wpl-dismiss', { id });
  }

  protected override syncHost(_changed: PropertyValues): void {
    const preferences = this.preferences();
    const target = this.target ?? (typeof document === 'undefined' ? null : document.documentElement);
    if (target) applyPreferences(target, preferences);
    this.region.className = 'wpl-toasts';
    this.region.setAttribute('aria-live', 'polite');
    this.region.setAttribute('aria-label', message(preferences.locale, 'notifications'));
    if (this.region.parentNode !== this) this.append(this.region);
    const dismissLabel = message(preferences.locale, 'dismiss');
    render(
      html`${this.records.map(
        (toast) => html`
          <article class=${toastClassName(toast.variant)} role=${toast.variant === 'danger' ? 'alert' : 'status'}>
            <strong>${toast.title}</strong>
            ${toast.description ? html`<p>${toast.description}</p>` : nothing}
            <button type="button" class="wpl-icon-btn wpl-btn-ghost" aria-label=${dismissLabel} @click=${() => this.dismissToast(toast.id)}>${iconSvg('close')}</button>
          </article>
        `,
      )}`,
      this.region,
    );
  }
}

export function providerFrom(node: Node | null): WhitePlumeriaProvider | null {
  const element = node instanceof Element ? node : (node?.parentElement ?? null);
  const found = element?.closest('wpl-provider');
  return found instanceof WhitePlumeriaProvider ? found : null;
}

export function requireProvider(node: Node): WhitePlumeriaProvider {
  const found = providerFrom(node);
  if (!found) throw new Error('WhitePlumeriaProvider is required to push a toast.');
  return found;
}

export function pushToast(from: Node, toast: ToastInput): string {
  return requireProvider(from).pushToast(toast);
}

export function localeOf(node: Node | null): Preferences['locale'] {
  return providerFrom(node)?.locale ?? defaultPreferences.locale;
}

export function translate(node: Node | null, key: MessageKey): string {
  return message(localeOf(node), key);
}

export function useLocale(from: Node): Preferences['locale'] {
  return localeOf(from);
}

export function useToast(from: Node): {
  push: (toast: ToastInput) => string;
  dismiss: (id: string) => void;
  toasts: readonly ToastRecord[];
} {
  const provider = providerFrom(from);
  if (!provider) {
    return {
      push: () => {
        throw new Error('WhitePlumeriaProvider is required to push a toast.');
      },
      dismiss: () => undefined,
      toasts: [],
    };
  }
  return {
    push: (toast) => provider.pushToast(toast),
    dismiss: (id) => provider.dismissToast(id),
    get toasts() {
      return provider.toasts;
    },
  };
}

export function useWhitePlumeria(from: Node): {
  preferences: Preferences;
  locale: Preferences['locale'];
  t: (key: MessageKey) => string;
  setPreferences: (next: Partial<Preferences>) => void;
  pushToast: (toast: ToastInput) => string;
  dismissToast: (id: string) => void;
} {
  const provider = providerFrom(from);
  if (!provider) {
    return {
      preferences: defaultPreferences,
      locale: defaultPreferences.locale,
      t: (key) => message(defaultPreferences.locale, key),
      setPreferences: () => undefined,
      pushToast: () => {
        throw new Error('WhitePlumeriaProvider is required to push a toast.');
      },
      dismissToast: () => undefined,
    };
  }
  return {
    preferences: provider.preferences(),
    locale: provider.locale,
    t: (key) => message(provider.locale, key),
    setPreferences: (next) => provider.setPreferences(next),
    pushToast: (toast) => provider.pushToast(toast),
    dismissToast: (id) => provider.dismissToast(id),
  };
}
