import { and, eq, fn, gt, gte, lt, lte, not, or } from '@ember/helper';
import { capabilities, on, setModifierManager } from '@ember/modifier';
import { trackedObject } from '@ember/reactive/collections';
import { template } from '@ember/template-compiler';
import Component from '@glimmer/component';
import type { Locale } from '@white-plumeria/core';

export interface Host {
  args: Record<string, unknown>;
  state: Record<string, unknown>;
  [key: string]: any;
}

export interface GlimmerSpec {
  state?: (args: Record<string, unknown>) => Record<string, unknown>;
  methods?: Record<string, (this: Host, ...args: any[]) => unknown>;
  getters?: Record<string, (this: Host, host: Host) => unknown>;
}

const extras: Record<string, unknown> = {};

export function registerHelper(name: string, value: unknown): void {
  extras[name] = value;
}

const flagAttr = setModifierManager(
  () => ({
    capabilities: capabilities('3.22'),
    createModifier() {
      return {};
    },
    installModifier(_state: object, element: Element, args: { positional: unknown[] }) {
      applyFlag(element, args.positional);
    },
    updateModifier(_state: object, element: Element, args: { positional: unknown[] }) {
      applyFlag(element, args.positional);
    },
    destroyModifier() {},
  }),
  class FlagModifier {},
);

function applyFlag(element: Element, positional: unknown[]): void {
  const name = str(positional[0]);
  const value = positional[1];
  const onValue = value === true || value === 'true' || (typeof value === 'string' && value !== '' && value !== 'false');
  if (name === 'disabled' && element instanceof HTMLButtonElement) {
    element.disabled = Boolean(value);
    return;
  }
  if (!name) return;
  if (value === false || value == null || value === '') element.removeAttribute(name);
  else element.setAttribute(name, onValue && value === true ? 'true' : String(value));
}

export function scope(): Record<string, unknown> {
  return { on, eq, fn, not, or, and, gt, gte, lt, lte, flag, ...extras };
}

export type EmberComponent = new (owner: unknown, args: Record<string, unknown>) => Host;

export function glimmer(source: string, spec: GlimmerSpec = {}): EmberComponent {
  const methods = spec.methods ?? {};
  const getters = spec.getters ?? {};

  class View extends Component<Record<string, unknown>> {
    state = trackedObject<Record<string, unknown>>({});

    constructor(owner: unknown, args: Record<string, unknown>) {
      super(owner as never, args);
      const initial = spec.state?.(args) ?? {};
      for (const [key, value] of Object.entries(initial)) this.state[key] = value;
      for (const [key, method] of Object.entries(methods)) {
        Object.defineProperty(this, key, { value: method.bind(this), enumerable: false });
      }
    }
  }

  for (const [key, getter] of Object.entries(getters)) {
    Object.defineProperty(View.prototype, key, {
      enumerable: false,
      get() {
        return getter.call(this as Host, this);
      },
    });
  }

  template(source, { component: View, scope });
  return View as EmberComponent;
}

export function bubble(event: Event, name: string, detail: unknown): void {
  const node = event.currentTarget instanceof Element ? event.currentTarget : event.target;
  if (!(node instanceof Element)) return;
  node.dispatchEvent(new CustomEvent(name, { detail, bubbles: true, composed: true }));
}

export function str(value: unknown, fallback = ''): string {
  return typeof value === 'string' ? value : fallback;
}

export function flag(value: unknown): boolean {
  return value === true || value === 'true';
}

export function num(value: unknown, fallback: number): number {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string' && value.trim() !== '') {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return fallback;
}

export function list<T>(value: unknown): T[] {
  return Array.isArray(value) ? (value as T[]) : [];
}

export function localeOf(element: Element | null | undefined): Locale {
  const lang = element?.closest('[lang]')?.getAttribute('lang') ?? element?.ownerDocument?.documentElement.lang;
  return lang === 'fa' ? 'fa' : 'en';
}

export function rowId(row: object): string {
  const id = 'id' in row ? row.id : undefined;
  return id == null ? '' : String(id);
}
