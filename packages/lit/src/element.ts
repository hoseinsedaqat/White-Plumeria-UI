import { LitElement, html, nothing } from 'lit';
import type { PropertyValues, TemplateResult } from 'lit';
import { hostCss } from './host-css';

export type RenderResult = TemplateResult | typeof nothing;

const registry: Array<[string, CustomElementConstructor]> = [];

export function defineTag(tag: string, ctor: CustomElementConstructor): boolean {
  if (!registry.some(([name]) => name === tag)) registry.push([tag, ctor]);
  if (customElements.get(tag)) return false;
  customElements.define(tag, ctor);
  return true;
}

export interface DefineResult {
  defined: string[];
  skipped: string[];
}

export function defineRegistered(): DefineResult {
  installHostCss();
  const defined: string[] = [];
  const skipped: string[] = [];
  for (const [tag, ctor] of registry) {
    if (customElements.get(tag)) {
      skipped.push(tag);
      continue;
    }
    customElements.define(tag, ctor);
    defined.push(tag);
  }
  return { defined, skipped };
}

export function registeredTags(): readonly string[] {
  return registry.map(([tag]) => tag);
}

export function installHostCss(): void {
  if (typeof document === 'undefined') return;
  if (document.getElementById('wpl-lit-host')) return;
  const style = document.createElement('style');
  style.id = 'wpl-lit-host';
  style.textContent = hostCss;
  document.head.append(style);
}

export function emit<T>(host: EventTarget, name: string, detail?: T): void {
  host.dispatchEvent(new CustomEvent(name, { detail, bubbles: true, composed: true }));
}

export function lightChildren(host: HTMLElement, view: Node): Node[] {
  return [...host.childNodes].filter((node) => {
    if (node === view) return false;
    if (node.nodeType === Node.TEXT_NODE && !node.textContent?.trim()) return false;
    return true;
  });
}

export abstract class WplElement extends LitElement {
  readonly view: HTMLDivElement = document.createElement('div');
  protected sawLightChildren = false;

  protected override createRenderRoot(): HTMLElement {
    this.view.className = 'wpl-lit-view';
    this.view.style.display = 'contents';
    if (this.view.parentNode !== this) this.append(this.view);
    return this.view;
  }

  protected override updated(changed: PropertyValues): void {
    this.projectSlots();
    super.updated(changed);
  }

  protected projectSlots(): void {
    const loose = lightChildren(this, this.view);
    if (loose.length > 0) this.sawLightChildren = true;
    if (!this.view.querySelector('[data-wpl-slot]')) return;
    for (const node of loose) {
      const name = node instanceof Element ? node.getAttribute('slot') : null;
      const named = name ? this.view.querySelector<HTMLElement>(`[data-wpl-slot="${CSS.escape(name)}"]`) : null;
      const fallback = this.view.querySelector<HTMLElement>('[data-wpl-slot=""]');
      const target = named ?? (name ? null : fallback);
      if (target && node.parentNode !== target) target.append(node);
    }
  }

  protected emit<T>(name: string, detail?: T): void {
    emit(this, name, detail);
  }
}

export abstract class WplHost extends LitElement {
  protected override createRenderRoot(): HTMLElement {
    return document.createElement('span');
  }

  protected override render(): typeof nothing {
    return nothing;
  }

  protected override updated(changed: PropertyValues): void {
    this.syncHost(changed);
    super.updated(changed);
  }

  protected abstract syncHost(changed: PropertyValues): void;
}

export { html, nothing };
