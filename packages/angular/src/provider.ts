import {
  ChangeDetectionStrategy,
  Component,
  Injectable,
  effect,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
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
import { ToastRegion } from './toast';

export interface ToastInput {
  title: string;
  description?: string;
  variant?: ToastVariant;
  duration?: number;
}

export interface ToastRecord extends ToastInput {
  id: string;
}

@Injectable()
export class WhitePlumeriaState {
  readonly preferences = signal<Preferences>(defaultPreferences);
  readonly ready = signal(false);
  readonly toasts = signal<ToastRecord[]>([]);
  private controlled = false;
  private emitChange: ((value: Preferences) => void) | null = null;

  t(key: MessageKey): string {
    return message(this.preferences().locale, key);
  }

  markReady(controlled: boolean, initial?: Preferences) {
    this.controlled = controlled;
    if (!controlled) this.preferences.set(readStoredPreferences());
    else if (initial) this.preferences.set(initial);
    this.ready.set(true);
  }

  bindChange(emit: (value: Preferences) => void) {
    this.emitChange = emit;
  }

  setPreferences(next: Partial<Preferences>) {
    const merged = sanitizePreferences({ ...this.preferences(), ...next });
    this.emitChange?.(merged);
    if (!this.controlled) this.preferences.set(merged);
  }

  replacePreferences(next: Preferences) {
    this.preferences.set(next);
  }

  pushToast(toast: ToastInput): string {
    const id = `wpl-toast-${Math.random().toString(36).slice(2, 9)}`;
    this.toasts.update((current) => [...current, { ...toast, id }]);
    return id;
  }

  dismissToast(id: string) {
    this.toasts.update((current) => current.filter((item) => item.id !== id));
  }
}

const fallback: Pick<WhitePlumeriaState, 'preferences' | 'toasts' | 't' | 'setPreferences' | 'pushToast' | 'dismissToast' | 'ready'> = {
  preferences: signal(defaultPreferences),
  ready: signal(true),
  toasts: signal<ToastRecord[]>([]),
  t: (key) => message('en', key),
  setPreferences: () => {
    throw new Error('WhitePlumeriaProvider is required to change preferences.');
  },
  pushToast: () => {
    throw new Error('WhitePlumeriaProvider is required to push a toast.');
  },
  dismissToast: () => undefined,
};

export function injectWhitePlumeria(): WhitePlumeriaState {
  return inject(WhitePlumeriaState, { optional: true }) ?? (fallback as WhitePlumeriaState);
}

export function useWhitePlumeria(): WhitePlumeriaState {
  return injectWhitePlumeria();
}

export function useToast() {
  const state = injectWhitePlumeria();
  return {
    push: (toast: ToastInput) => state.pushToast(toast),
    dismiss: (id: string) => state.dismissToast(id),
    toasts: state.toasts,
  };
}

export function useLocale(): Locale {
  return injectWhitePlumeria().preferences().locale;
}

@Component({
  selector: 'wpl-provider',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ToastRegion],
  providers: [WhitePlumeriaState],
  template: `<ng-content /><wpl-toast-region />`,
})
export class WhitePlumeriaProvider {
  readonly preferences = input<Preferences>();
  readonly preferencesChange = output<Preferences>();
  readonly target = input<HTMLElement | null>(null);
  private readonly state = inject(WhitePlumeriaState);

  constructor() {
    this.state.bindChange((value) => this.preferencesChange.emit(value));
    effect(() => {
      const controlled = this.preferences();
      if (!this.state.ready()) return;
      if (controlled) this.state.replacePreferences(controlled);
      if (typeof document === 'undefined') return;
      const element = this.target() ?? document.documentElement;
      applyPreferences(element, this.state.preferences());
      if (!controlled) storePreferences(this.state.preferences());
    });
    queueMicrotask(() => {
      const controlled = this.preferences();
      this.state.markReady(controlled !== undefined, controlled);
    });
  }

  setPreferences(next: Partial<Preferences>) {
    this.state.setPreferences(next);
  }
}
