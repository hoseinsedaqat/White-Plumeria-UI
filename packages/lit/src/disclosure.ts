import { createId, nextIndex, readingDirection } from '@white-plumeria/core';
import { defineTag, html, nothing, WplElement, type RenderResult } from './element';
import { iconSvg } from './icon';

export interface TabItem {
  id: string;
  label: string;
  panel: string;
}

export interface AccordionItem {
  id: string;
  title: string;
  content: string;
}

export class Tabs extends WplElement {
  static override properties = {
    tabs: { attribute: false },
    value: { type: String },
    defaultValue: { type: String, attribute: 'default-value' },
    orientation: { type: String },
  };

  declare tabs: TabItem[];
  declare value: string | undefined;
  declare defaultValue: string;
  declare orientation: 'horizontal' | 'vertical';
  private internal = '';
  private seeded = false;
  private readonly baseId = createId('wpl-tabs');

  constructor() {
    super();
    this.tabs = [];
    this.value = undefined;
    this.defaultValue = '';
    this.orientation = 'horizontal';
  }

  protected override willUpdate(): void {
    if (this.seeded) return;
    this.seeded = true;
    if (this.value === undefined) this.internal = this.defaultValue || this.tabs[0]?.id || '';
  }

  private selected(): string {
    return this.value !== undefined ? this.value : this.internal;
  }

  private choose(id: string): void {
    if (this.value === undefined) {
      this.internal = id;
      this.requestUpdate();
    }
    this.emit('wpl-change', { value: id });
  }

  private onKey = (event: KeyboardEvent): void => {
    const index = Math.max(0, this.tabs.findIndex((tab) => tab.id === this.selected()));
    const next = nextIndex(index, this.tabs.length, event.key, this.orientation, readingDirection(event.currentTarget instanceof HTMLElement ? event.currentTarget : null));
    if (next === null) return;
    event.preventDefault();
    const tab = this.tabs[next];
    if (!tab) return;
    this.choose(tab.id);
    queueMicrotask(() => this.view.querySelector<HTMLButtonElement>(`#${CSS.escape(`${this.baseId}-${tab.id}`)}`)?.focus());
  };

  protected override render(): RenderResult {
    const selected = this.selected();
    const orientation = this.orientation === 'vertical' ? 'vertical' : 'horizontal';
    return html`<div class=${orientation === 'vertical' ? 'wpl-tabs wpl-tabs-vertical' : 'wpl-tabs'}>
      <div role="tablist" aria-orientation=${orientation} class="wpl-tablist" @keydown=${this.onKey}>
        ${this.tabs.map((tab) => {
          const on = tab.id === selected;
          return html`<button
            id=${`${this.baseId}-${tab.id}`}
            type="button"
            role="tab"
            class="wpl-tab"
            aria-selected=${on ? 'true' : 'false'}
            aria-controls=${`${this.baseId}-panel-${tab.id}`}
            tabindex=${on ? '0' : '-1'}
            @click=${() => this.choose(tab.id)}
          >
            ${tab.label}
          </button>`;
        })}
      </div>
      ${this.tabs.map((tab) => {
        const on = tab.id === selected;
        return html`<div
          id=${`${this.baseId}-panel-${tab.id}`}
          role="tabpanel"
          aria-labelledby=${`${this.baseId}-${tab.id}`}
          ?hidden=${!on}
          class="wpl-tabpanel"
          tabindex="0"
        >
          ${on ? tab.panel : nothing}
        </div>`;
      })}
    </div>`;
  }
}

export class Accordion extends WplElement {
  static override properties = {
    items: { attribute: false },
    multiple: { type: Boolean },
    value: { attribute: false },
  };

  declare items: AccordionItem[];
  declare multiple: boolean;
  declare value: string[] | undefined;
  private internal: string[] = [];
  private seeded = false;
  private readonly baseId = createId('wpl-accordion');

  constructor() {
    super();
    this.items = [];
    this.multiple = false;
    this.value = undefined;
  }

  protected override willUpdate(): void {
    if (this.seeded) return;
    this.seeded = true;
    const first = this.items[0]?.id;
    this.internal = first ? [first] : [];
  }

  private openIds(): string[] {
    return this.value ?? this.internal;
  }

  private toggle(id: string): void {
    const open = this.openIds();
    const next = open.includes(id) ? open.filter((entry) => entry !== id) : this.multiple ? [...open, id] : [id];
    if (this.value === undefined) {
      this.internal = next;
      this.requestUpdate();
    }
    this.emit('wpl-change', { value: next });
  }

  protected override render(): RenderResult {
    const open = this.openIds();
    return html`<div class="wpl-accordion">
      ${this.items.map((item) => {
        const expanded = open.includes(item.id);
        const panelId = `${this.baseId}-${item.id}`;
        return html`<div class="wpl-accordion-item">
          <h3 style="margin:0;font:inherit">
            <button type="button" class="wpl-accordion-trigger" aria-expanded=${expanded ? 'true' : 'false'} aria-controls=${panelId} @click=${() => this.toggle(item.id)}>
              ${item.title}
              <span style=${`display:inline-flex;transform:${expanded ? 'rotate(180deg)' : 'none'}`}>${iconSvg('chevronDown')}</span>
            </button>
          </h3>
          <div id=${panelId} role="region" ?hidden=${!expanded} class="wpl-accordion-panel">${expanded ? item.content : nothing}</div>
        </div>`;
      })}
    </div>`;
  }
}

defineTag('wpl-tabs', Tabs);
defineTag('wpl-accordion', Accordion);
