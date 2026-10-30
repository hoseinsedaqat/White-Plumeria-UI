import {
  createId,
  iconPaths,
  message,
  type IconName,
  type Locale,
  type MessageKey,
} from '@white-plumeria/core';
import type { Preferences } from '@white-plumeria/core';
import type { ThemeName } from '@white-plumeria/tokens';

export interface Magic {
  $el: HTMLElement;
  $dispatch: (name: string, detail?: unknown) => void;
  $watch: (property: string, callback: (value: unknown) => void) => void;
  $nextTick: (callback: () => void) => void;
}

export interface AlpineData {
  init?(this: Magic): void;
  destroy?(this: Magic): void;
}

export type Config = Record<string, unknown>;

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

const providers = new WeakMap<HTMLElement, ProviderApi>();
const cleanups = new WeakMap<HTMLElement, () => void>();

export function registerProvider(el: HTMLElement, api: ProviderApi): void {
  providers.set(el, api);
}

export function unregisterProvider(el: HTMLElement): void {
  providers.delete(el);
}

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

export function translate(node: Node | null, key: MessageKey): string {
  return providerOf(node)?.t(key) ?? message('en', key);
}

export function onDestroy(el: HTMLElement, stop: () => void): void {
  const previous = cleanups.get(el);
  cleanups.set(el, () => {
    previous?.();
    stop();
  });
}

export function runDestroy(el: HTMLElement): void {
  cleanups.get(el)?.();
  cleanups.delete(el);
}

export function text(value: unknown, fallback = ''): string {
  if (typeof value === 'string') return value;
  if (typeof value === 'number' && Number.isFinite(value)) return String(value);
  return fallback;
}

export function flag(value: unknown): boolean {
  return value === true;
}

export function num(value: unknown, fallback: number): number {
  const next = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(next) ? next : fallback;
}

export function list<T>(value: unknown): T[] {
  return Array.isArray(value) ? (value as T[]) : [];
}

export function oneOf<T extends string>(value: unknown, allowed: readonly T[], fallback: T): T {
  return typeof value === 'string' && (allowed as readonly string[]).includes(value) ? (value as T) : fallback;
}

export function uid(prefix: string): string {
  return createId(prefix);
}

type Attrs = Record<string, string | number | boolean | null | undefined>;
type Listeners = Record<string, (event: Event) => void>;
type Child = Node | string | null | false | undefined;

export function h<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  props: { className?: string; text?: string; attrs?: Attrs; on?: Listeners } = {},
  children: Child[] = [],
): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag);
  if (props.className) node.className = props.className;
  if (props.text) node.textContent = props.text;
  for (const [key, value] of Object.entries(props.attrs ?? {})) {
    if (value === undefined || value === null || value === false) continue;
    if (key === 'disabled' || key === 'checked' || key === 'readOnly' || key === 'hidden') {
      Reflect.set(node, key, value === true ? true : value);
    }
    if (value === true) node.setAttribute(key === 'readOnly' ? 'readonly' : key, '');
    else node.setAttribute(key === 'readOnly' ? 'readonly' : key, String(value));
  }
  for (const [event, handler] of Object.entries(props.on ?? {})) node.addEventListener(event, handler);
  for (const child of children) {
    if (child === null || child === undefined || child === false || child === '') continue;
    node.append(child instanceof Node ? child : document.createTextNode(child));
  }
  return node;
}

export function svgIcon(name: IconName, className = 'wpl-icon'): SVGSVGElement {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', '0 0 24 24');
  svg.setAttribute('aria-hidden', 'true');
  svg.setAttribute('class', className);
  svg.setAttribute('fill', 'none');
  svg.setAttribute('stroke', 'currentColor');
  svg.setAttribute('stroke-width', '1.75');
  svg.setAttribute('stroke-linecap', 'round');
  svg.setAttribute('stroke-linejoin', 'round');
  const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  path.setAttribute('d', iconPaths[name]);
  svg.append(path);
  return svg;
}

export function emit(magic: Magic, name: string, detail?: unknown): void {
  magic.$dispatch(name, detail);
}

export function labelOf(magic: Magic, config: Config, fallback = ''): string {
  return text(config.label, magic.$el.textContent?.trim() || fallback);
}

export function field(label: string, control: HTMLElement, extra: Child[] = []): HTMLElement {
  return h('div', { className: 'wpl-field' }, [
    label ? h('label', { className: 'wpl-label', text: label, attrs: { for: control.id || undefined } }) : null,
    control,
    ...extra,
  ]);
}

export function listenLocale(el: HTMLElement, refresh: () => void): void {
  const host = el.closest('[data-wpl-provider]');
  if (!(host instanceof HTMLElement)) return;
  const onLocale = () => refresh();
  host.addEventListener('wpl-locale', onLocale);
  onDestroy(el, () => host.removeEventListener('wpl-locale', onLocale));
}
