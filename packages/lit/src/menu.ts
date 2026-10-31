import {
  bindDismissable,
  createId,
  firstEnabledIndex,
  menuCommand,
  menuHasSubmenu,
  moveEnabledIndex,
  typeaheadMove,
  nextIndex,
  placeOverlay,
  readingDirection,
  type MenuMotion,
} from '@white-plumeria/core';
import type { PropertyValues } from 'lit';
import { defineTag, html, nothing, WplElement, type RenderResult } from './element';
import { buttonClassName } from '@white-plumeria/core';
import { iconSvg } from './icon';
import { translate } from './provider';

export interface MenuItem {
  id: string;
  label: string;
  disabled?: boolean;
  shortcut?: string;
  items?: MenuItem[];
}

export interface ComboOption {
  value: string;
  label: string;
}

function menuItems(items: MenuItem[], menuId: string, active: number, subActive: number | null, onEnter: (index: number, nested: boolean) => void, onClick: (item: MenuItem, index: number) => void): RenderResult {
  return html`${items.map((item, index) => {
    const nested = menuHasSubmenu(item);
    const expanded = nested && index === active && subActive !== null;
    return html`<div class="wpl-menu-row">
      <button
        id=${`${menuId}-${item.id}`}
        type="button"
        role="menuitem"
        class="wpl-menu-item"
        ?disabled=${Boolean(item.disabled)}
        aria-haspopup=${nested ? 'menu' : nothing}
        aria-expanded=${nested ? (expanded ? 'true' : 'false') : nothing}
        aria-controls=${expanded ? `${menuId}-sub-${item.id}` : nothing}
        data-active=${subActive === null && index === active ? 'true' : nothing}
        @mouseenter=${() => onEnter(index, nested)}
        @click=${() => onClick(item, index)}
      >
        <span>${item.label}</span>
        ${nested ? html`<span class="wpl-menu-caret" aria-hidden="true"></span>` : nothing}
        ${!nested && item.shortcut ? html`<span class="wpl-menu-shortcut">${item.shortcut}</span>` : nothing}
      </button>
      ${expanded
        ? html`<div id=${`${menuId}-sub-${item.id}`} role="menu" aria-label=${item.label} class="wpl-menu wpl-menu-sub">
            ${item.items?.map(
              (child, childIndex) => html`<button
                id=${`${menuId}-${child.id}`}
                type="button"
                role="menuitem"
                class="wpl-menu-item"
                ?disabled=${Boolean(child.disabled)}
                data-active=${childIndex === subActive ? 'true' : nothing}
                @click=${() => onClick(child, index)}
              >
                ${child.label}
              </button>`,
            )}
          </div>`
        : nothing}
    </div>`;
  })}`;
}

export class DropdownMenu extends WplElement {
  static override properties = {
    label: { type: String },
    items: { attribute: false },
  };

  declare label: string;
  declare items: MenuItem[];
  private open = false;
  private active = 0;
  private subActive: number | null = null;
  private readonly typeahead = { query: '', at: 0 };
  private readonly menuId = createId('wpl-menu');
  private dismiss: (() => void) | null = null;

  constructor() {
    super();
    this.label = '';
    this.items = [];
  }

  override disconnectedCallback(): void {
    this.dismiss?.();
    this.dismiss = null;
    super.disconnectedCallback();
  }

  private currentItem(): MenuItem | undefined {
    const parent = this.items[this.active];
    if (this.subActive === null) return parent;
    return parent?.items?.[this.subActive];
  }

  private select(id: string): void {
    this.emit('wpl-select', { id });
    this.open = false;
    this.subActive = null;
    this.requestUpdate();
    queueMicrotask(() => this.view.querySelector('button')?.focus());
  }

  private openSubmenu(index: number): void {
    const item = this.items[index];
    if (!menuHasSubmenu(item)) return;
    this.active = index;
    this.subActive = firstEnabledIndex(item.items);
    this.requestUpdate();
  }

  private onKey = (event: KeyboardEvent): void => {
    const current = this.currentItem();
    const command = menuCommand({
      key: event.key,
      direction: readingDirection(event.currentTarget instanceof HTMLElement ? event.currentTarget : null),
      open: this.open,
      submenuOpen: this.subActive !== null,
      hasSubmenu: menuHasSubmenu(current),
    });
    if (!command) {
      if (!this.open) return;
      const parent = this.items[this.active];
      const pool = this.subActive === null ? this.items : (parent?.items ?? []);
      const from = this.subActive === null ? this.active : this.subActive;
      const next = typeaheadMove(this.typeahead, pool, event.key, Date.now(), from);
      if (next === null) return;
      event.preventDefault();
      if (this.subActive === null) this.active = next;
      else this.subActive = next;
      this.requestUpdate();
      return;
    }
    event.preventDefault();
    if (command === 'close' || command === 'close-submenu') event.stopPropagation();
    if (command === 'open') {
      this.open = true;
      this.active = firstEnabledIndex(this.items);
      this.subActive = null;
      this.requestUpdate();
      return;
    }
    if (command === 'close') {
      this.open = false;
      this.subActive = null;
      this.requestUpdate();
      return;
    }
    if (command === 'close-submenu') {
      this.subActive = null;
      this.requestUpdate();
      return;
    }
    if (command === 'open-submenu') {
      this.open = true;
      this.openSubmenu(this.active);
      return;
    }
    if (command === 'activate') {
      if (current && !current.disabled && !menuHasSubmenu(current)) this.select(current.id);
      return;
    }
    if (!this.open) {
      this.open = true;
      this.active = firstEnabledIndex(this.items);
      this.subActive = null;
      this.requestUpdate();
      return;
    }
    const motion = command as MenuMotion;
    if (this.subActive === null) this.active = moveEnabledIndex(this.items, this.active, motion);
    else this.subActive = moveEnabledIndex(this.items[this.active]?.items ?? [], this.subActive, motion);
    this.requestUpdate();
  };

  protected override updated(changed: PropertyValues): void {
    super.updated(changed);
    const root = this.view.querySelector<HTMLElement>('[role="menu"]');
    if (!this.open || !root) {
      this.dismiss?.();
      this.dismiss = null;
      return;
    }
    if (this.dismiss) return;
    const owner = this.view.querySelector('button') ?? undefined;
    this.dismiss = bindDismissable({
      root,
      owner,
      onDismiss: () => {
        this.dismiss = null;
        if (this.subActive !== null) {
          this.subActive = null;
          this.requestUpdate();
          return;
        }
        this.open = false;
        this.requestUpdate();
      },
    });
  }

  protected override render(): RenderResult {
    const current = this.currentItem();
    const activeId = current ? `${this.menuId}-${current.id}` : undefined;
    return html`<div class="wpl-menu-root">
      <button
        type="button"
        class=${buttonClassName({ variant: 'secondary' })}
        aria-haspopup="menu"
        aria-expanded=${this.open ? 'true' : 'false'}
        aria-controls=${this.menuId}
        aria-activedescendant=${this.open && activeId ? activeId : nothing}
        @click=${() => {
          this.open = !this.open;
          this.subActive = null;
          this.active = firstEnabledIndex(this.items);
          this.dismiss?.();
          this.dismiss = null;
          this.requestUpdate();
        }}
        @keydown=${this.onKey}
      >
        ${this.label}
      </button>
      ${this.open
        ? html`<div id=${this.menuId} role="menu" aria-label=${this.label} class="wpl-menu wpl-menu-panel">
            ${menuItems(
              this.items,
              this.menuId,
              this.active,
              this.subActive,
              (index, nested) => {
                this.active = index;
                if (nested) this.openSubmenu(index);
                else {
                  this.subActive = null;
                  this.requestUpdate();
                }
              },
              (item) => {
                if (menuHasSubmenu(item)) {
                  const index = this.items.findIndex((entry) => entry.id === item.id);
                  if (index >= 0) this.openSubmenu(index);
                  return;
                }
                if (!item.disabled) this.select(item.id);
              },
            )}
          </div>`
        : nothing}
    </div>`;
  }
}

export class ContextMenu extends WplElement {
  static override properties = {
    items: { attribute: false },
    label: { type: String },
  };

  declare items: MenuItem[];
  declare label: string;
  private point: { x: number; y: number } | null = null;
  private active = 0;
  private subActive: number | null = null;
  private readonly typeahead = { query: '', at: 0 };
  private readonly menuId = createId('wpl-context');
  private dismiss: (() => void) | null = null;

  constructor() {
    super();
    this.items = [];
    this.label = 'Context menu';
  }

  override disconnectedCallback(): void {
    this.dismiss?.();
    this.dismiss = null;
    super.disconnectedCallback();
  }

  private currentItem(): MenuItem | undefined {
    const parent = this.items[this.active];
    if (this.subActive === null) return parent;
    return parent?.items?.[this.subActive];
  }

  private openAt(x: number, y: number): void {
    this.subActive = null;
    this.active = firstEnabledIndex(this.items);
    this.point = { x, y };
    this.dismiss?.();
    this.dismiss = null;
    this.requestUpdate();
  }

  private close(): void {
    this.point = null;
    this.subActive = null;
    this.dismiss?.();
    this.dismiss = null;
    this.requestUpdate();
  }

  private select(id: string): void {
    this.emit('wpl-select', { id });
    this.close();
  }

  protected override updated(changed: PropertyValues): void {
    super.updated(changed);
    const menu = this.view.querySelector<HTMLElement>('.wpl-menu-fixed');
    if (!this.point || !menu) {
      this.dismiss?.();
      this.dismiss = null;
      return;
    }
    const placed = placeOverlay(
      { x: this.point.x, y: this.point.y, width: 0, height: 0 },
      { width: menu.offsetWidth || 180, height: menu.offsetHeight || 120 },
      { width: window.innerWidth, height: window.innerHeight },
      'end',
    );
    menu.style.left = `${placed.left}px`;
    menu.style.top = `${placed.top}px`;
    if (this.dismiss) return;
    this.dismiss = bindDismissable({
      root: menu,
      onDismiss: () => {
        this.dismiss = null;
        if (this.subActive !== null) {
          this.subActive = null;
          this.requestUpdate();
          return;
        }
        this.close();
      },
    });
  }

  protected override render(): RenderResult {
    const current = this.currentItem();
    return html`<div
      role="group"
      aria-label=${this.label}
      tabindex="0"
      aria-controls=${this.point ? this.menuId : nothing}
      aria-activedescendant=${this.point && current ? `${this.menuId}-${current.id}` : nothing}
      @contextmenu=${(event: MouseEvent) => {
        event.preventDefault();
        this.openAt(event.clientX, event.clientY);
      }}
      @keydown=${(event: KeyboardEvent) => {
        if (event.key === 'F10' && event.shiftKey) {
          event.preventDefault();
          const rect = (event.currentTarget instanceof HTMLElement ? event.currentTarget : this).getBoundingClientRect();
          this.openAt(rect.left, rect.bottom);
          return;
        }
        if (!this.point) return;
        const command = menuCommand({
          key: event.key,
          direction: readingDirection(event.currentTarget instanceof HTMLElement ? event.currentTarget : null),
          open: true,
          submenuOpen: this.subActive !== null,
          hasSubmenu: menuHasSubmenu(current),
        });
        if (!command) {
          const parent = this.items[this.active];
          const pool = this.subActive === null ? this.items : (parent?.items ?? []);
          const from = this.subActive === null ? this.active : this.subActive;
          const next = typeaheadMove(this.typeahead, pool, event.key, Date.now(), from);
          if (next === null) return;
          event.preventDefault();
          if (this.subActive === null) this.active = next;
          else this.subActive = next;
          this.requestUpdate();
          return;
        }
        if (command === 'open') return;
        event.preventDefault();
        if (command === 'close') {
          this.close();
          return;
        }
        if (command === 'close-submenu') {
          this.subActive = null;
          this.requestUpdate();
          return;
        }
        if (command === 'open-submenu') {
          const item = this.items[this.active];
          if (menuHasSubmenu(item)) {
            this.subActive = firstEnabledIndex(item.items);
            this.requestUpdate();
          }
          return;
        }
        if (command === 'activate') {
          if (current && !current.disabled && !menuHasSubmenu(current)) this.select(current.id);
          return;
        }
        const motion = command as MenuMotion;
        if (this.subActive === null) this.active = moveEnabledIndex(this.items, this.active, motion);
        else this.subActive = moveEnabledIndex(this.items[this.active]?.items ?? [], this.subActive, motion);
        this.requestUpdate();
      }}
    >
      <span data-wpl-slot="" style="display:contents"></span>
      ${this.point
        ? html`<div id=${this.menuId} role="menu" aria-label=${this.label} class="wpl-menu wpl-menu-fixed">
            ${menuItems(
              this.items,
              this.menuId,
              this.active,
              this.subActive,
              (index, nested) => {
                this.active = index;
                if (nested) {
                  const item = this.items[index];
                  this.subActive = menuHasSubmenu(item) ? firstEnabledIndex(item.items) : null;
                } else this.subActive = null;
                this.requestUpdate();
              },
              (item) => {
                if (menuHasSubmenu(item)) {
                  const index = this.items.findIndex((entry) => entry.id === item.id);
                  if (index >= 0) {
                    this.active = index;
                    this.subActive = firstEnabledIndex(item.items);
                    this.requestUpdate();
                  }
                  return;
                }
                if (!item.disabled) this.select(item.id);
              },
            )}
          </div>`
        : nothing}
    </div>`;
  }
}

export class Popover extends WplElement {
  static override properties = {
    label: { type: String },
  };

  declare label: string;
  private open = false;
  private readonly panelId = createId('wpl-popover');
  private dismiss: (() => void) | null = null;

  constructor() {
    super();
    this.label = '';
  }

  override disconnectedCallback(): void {
    this.dismiss?.();
    this.dismiss = null;
    super.disconnectedCallback();
  }

  protected override updated(changed: PropertyValues): void {
    super.updated(changed);
    const panel = this.view.querySelector<HTMLElement>('.wpl-popover');
    if (!this.open || !panel) {
      this.dismiss?.();
      this.dismiss = null;
      return;
    }
    if (this.dismiss) return;
    this.dismiss = bindDismissable({
      root: panel,
      owner: this,
      onDismiss: () => {
        this.dismiss = null;
        this.open = false;
        this.requestUpdate();
      },
    });
  }

  protected override render(): RenderResult {
    return html`<div style="position:relative;display:inline-block">
      <button
        type="button"
        class=${buttonClassName({ variant: 'secondary' })}
        aria-expanded=${this.open ? 'true' : 'false'}
        aria-controls=${this.panelId}
        @click=${() => {
          this.open = !this.open;
          this.dismiss?.();
          this.dismiss = null;
          this.requestUpdate();
        }}
      >
        ${this.label}
      </button>
      ${this.open
        ? html`<div id=${this.panelId} class="wpl-popover" style="position:absolute;inset-block-start:calc(100% + 0.35rem);inset-inline-start:0">
            <span data-wpl-slot="" style="display:contents"></span>
          </div>`
        : nothing}
    </div>`;
  }
}

export class Tooltip extends WplElement {
  static override properties = {
    content: { type: String },
  };

  declare content: string;
  private open = false;
  private timer: number | null = null;
  private readonly tipId = createId('wpl-tooltip');

  constructor() {
    super();
    this.content = '';
  }

  override disconnectedCallback(): void {
    if (this.timer) window.clearTimeout(this.timer);
    super.disconnectedCallback();
  }

  private show(): void {
    if (this.timer) window.clearTimeout(this.timer);
    this.timer = window.setTimeout(() => {
      this.open = true;
      this.requestUpdate();
    }, 400);
  }

  private hide(): void {
    if (this.timer) window.clearTimeout(this.timer);
    this.timer = null;
    this.open = false;
    this.requestUpdate();
  }

  protected override render(): RenderResult {
    return html`<span style="position:relative;display:inline-flex" @mouseenter=${() => this.show()} @mouseleave=${() => this.hide()} @focusin=${() => this.show()} @focusout=${() => this.hide()}>
      <span aria-describedby=${this.open ? this.tipId : nothing} @keydown=${(event: KeyboardEvent) => { if (event.key === 'Escape') this.hide(); }}>
        <span data-wpl-slot="" style="display:contents"></span>
      </span>
      ${this.open
        ? html`<span id=${this.tipId} role="tooltip" class="wpl-tooltip" style="position:absolute;inset-block-end:calc(100% + 0.35rem);inset-inline-start:0">${this.content}</span>`
        : nothing}
    </span>`;
  }
}

export class Combobox extends WplElement {
  static override properties = {
    label: { type: String },
    options: { attribute: false },
    value: { type: String },
    placeholder: { type: String },
  };

  declare label: string;
  declare options: ComboOption[];
  declare value: string;
  declare placeholder: string;
  private query = '';
  private open = false;
  private active = 0;
  private seeded = false;
  private readonly listId = createId('wpl-list');
  private dismiss: (() => void) | null = null;

  constructor() {
    super();
    this.label = '';
    this.options = [];
    this.value = '';
    this.placeholder = '';
  }

  protected override willUpdate(): void {
    if (this.seeded) return;
    this.seeded = true;
    this.query = this.options.find((option) => option.value === this.value)?.label ?? '';
  }

  override disconnectedCallback(): void {
    this.dismiss?.();
    this.dismiss = null;
    super.disconnectedCallback();
  }

  private filtered(): ComboOption[] {
    const selected = this.options.find((option) => option.value === this.value);
    const needle = this.query.trim().toLocaleLowerCase();
    if (!needle || needle === selected?.label.toLocaleLowerCase()) return this.options;
    return this.options.filter((option) => option.label.toLocaleLowerCase().includes(needle));
  }

  private choose(option: ComboOption): void {
    this.value = option.value;
    this.query = option.label;
    this.open = false;
    this.emit('wpl-change', { value: option.value });
    this.requestUpdate();
  }

  protected override updated(changed: PropertyValues): void {
    super.updated(changed);
    const root = this.view.querySelector<HTMLElement>('.wpl-combo');
    if (!this.open || !root) {
      this.dismiss?.();
      this.dismiss = null;
      return;
    }
    if (this.dismiss) return;
    this.dismiss = bindDismissable({
      root,
      onDismiss: () => {
        this.dismiss = null;
        this.open = false;
        this.requestUpdate();
      },
    });
  }

  protected override render(): RenderResult {
    const filtered = this.filtered();
    const inputId = `${this.listId}-input`;
    return html`<div class="wpl-combo">
      <label class="wpl-label" for=${inputId}>${this.label}</label>
      <div class="wpl-combo-control">
        <span class="wpl-combo-icon" aria-hidden="true">${iconSvg('search')}</span>
        <input
        id=${inputId}
        class="wpl-input"
        role="combobox"
        aria-expanded=${this.open ? 'true' : 'false'}
        aria-controls=${this.listId}
        aria-autocomplete="list"
        aria-activedescendant=${this.open ? `${this.listId}-${this.active}` : nothing}
        .value=${this.query}
        placeholder=${this.placeholder || nothing}
        @input=${(event: Event) => {
          const element = event.target instanceof HTMLInputElement ? event.target : null;
          this.query = element?.value ?? '';
          this.open = true;
          this.active = 0;
          this.dismiss?.();
          this.dismiss = null;
          this.requestUpdate();
        }}
        @focus=${() => {
          this.open = true;
          this.dismiss?.();
          this.dismiss = null;
          this.requestUpdate();
        }}
        @keydown=${(event: KeyboardEvent) => {
          if (event.key === 'ArrowDown' || event.key === 'ArrowUp' || event.key === 'Home' || event.key === 'End') {
            event.preventDefault();
            this.open = true;
            const next = nextIndex(this.active, filtered.length, event.key, 'vertical');
            if (next !== null) this.active = next;
            this.requestUpdate();
          }
          if (event.key === 'Enter' && this.open) {
            event.preventDefault();
            const option = filtered[this.active];
            if (option) this.choose(option);
          }
          if (event.key === 'Escape') {
            this.open = false;
            this.requestUpdate();
          }
        }}
      />
      </div>
      ${this.open
        ? html`<ul id=${this.listId} role="listbox" class="wpl-listbox">
            ${filtered.length === 0
              ? html`<li class="wpl-listbox-item">${translate(this, 'noResults')}</li>`
              : filtered.map(
                  (option, index) => html`<li>
                    <button
                      id=${`${this.listId}-${index}`}
                      type="button"
                      role="option"
                      aria-selected=${option.value === this.value ? 'true' : 'false'}
                      data-active=${index === this.active ? 'true' : nothing}
                      class="wpl-listbox-item"
                      @mouseenter=${() => {
                        this.active = index;
                        this.requestUpdate();
                      }}
                      @click=${() => this.choose(option)}
                    >
                      ${option.label}
                    </button>
                  </li>`,
                )}
          </ul>`
        : nothing}
    </div>`;
  }
}

defineTag('wpl-dropdown-menu', DropdownMenu);
defineTag('wpl-context-menu', ContextMenu);
defineTag('wpl-popover', Popover);
defineTag('wpl-tooltip', Tooltip);
defineTag('wpl-combobox', Combobox);
