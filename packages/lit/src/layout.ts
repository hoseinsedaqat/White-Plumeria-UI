import {
  containerClassName,
  createId,
  cx,
  gridClassName,
  readingDirection,
  stackClassName,
  type ContainerSize,
  type GridColumns,
  type StackGap,
} from '@white-plumeria/core';
import type { PropertyValues } from 'lit';
import { defineTag, emit, html, nothing, WplElement, WplHost, type RenderResult } from './element';
import { iconButtonClassName } from '@white-plumeria/core';
import { translate } from './provider';

export interface NavItem {
  href: string;
  label: string;
  current?: boolean;
}

export class Container extends WplHost {
  static override properties = {
    size: { type: String },
  };

  declare size: ContainerSize;

  constructor() {
    super();
    this.size = 'lg';
  }

  protected override syncHost(): void {
    this.className = containerClassName(this.size);
  }
}

export class Stack extends WplHost {
  static override properties = {
    gap: { type: String },
  };

  declare gap: StackGap;

  constructor() {
    super();
    this.gap = 'md';
  }

  protected override syncHost(): void {
    this.className = stackClassName(this.gap);
  }
}

export class Flex extends WplHost {
  static override properties = {
    justify: { type: String },
    wrap: { type: Boolean },
  };

  declare justify: 'start' | 'between' | 'end';
  declare wrap: boolean;

  constructor() {
    super();
    this.justify = 'start';
    this.wrap = false;
  }

  protected override syncHost(): void {
    this.className = cx('wpl-flex', this.wrap && 'wpl-flex-wrap', this.justify === 'between' && 'wpl-flex-between', this.justify === 'end' && 'wpl-flex-end');
  }
}

export class Grid extends WplHost {
  static override properties = {
    columns: { type: Number },
  };

  declare columns: GridColumns;

  constructor() {
    super();
    this.columns = 2;
  }

  protected override syncHost(): void {
    this.className = gridClassName(this.columns);
  }
}

export class NavigationMenu extends WplElement {
  static override properties = {
    items: { attribute: false },
    label: { type: String },
  };

  declare items: NavItem[];
  declare label: string;

  constructor() {
    super();
    this.items = [];
    this.label = '';
  }

  protected override render(): RenderResult {
    return html`<nav aria-label=${this.label}>
      <ul class="wpl-nav-menu">
        ${this.items.map(
          (item) => html`<li><a class="wpl-nav-link" href=${item.href} aria-current=${item.current ? 'page' : nothing}>${item.label}</a></li>`,
        )}
      </ul>
    </nav>`;
  }
}

export class Navbar extends WplElement {
  static override properties = {
    brand: { type: String },
    href: { type: String },
    items: { attribute: false },
  };

  declare brand: string;
  declare href: string;
  declare items: NavItem[];
  private open = false;
  private readonly menuId = createId('wpl-nav');

  constructor() {
    super();
    this.brand = '';
    this.href = '#';
    this.items = [];
  }

  protected override render(): RenderResult {
    return html`<header class="wpl-navbar" data-open=${this.open ? 'true' : nothing}>
      <a class="wpl-navbar-brand" href=${this.href || '#'}>${this.brand}</a>
      <button
        type="button"
        class=${cx(iconButtonClassName({ variant: 'ghost' }), 'wpl-navbar-toggle')}
        aria-label=${this.open ? translate(this, 'closeMenu') : translate(this, 'openMenu')}
        aria-expanded=${this.open ? 'true' : 'false'}
        aria-controls=${this.menuId}
        @click=${() => {
          this.open = !this.open;
          this.requestUpdate();
        }}
      >
        ☰
      </button>
      <ul id=${this.menuId} class="wpl-nav-menu">
        ${this.items.map(
          (item) => html`<li>
            <a class="wpl-nav-link" href=${item.href} aria-current=${item.current ? 'page' : nothing} @click=${() => { this.open = false; this.requestUpdate(); }}>${item.label}</a>
          </li>`,
        )}
      </ul>
    </header>`;
  }
}

export class Sidebar extends WplHost {
  static override properties = {
    label: { type: String },
    items: { attribute: false },
  };

  declare label: string;
  declare items: NavItem[];
  private readonly list = document.createElement('div');

  constructor() {
    super();
    this.label = '';
    this.items = [];
  }

  protected override syncHost(): void {
    this.classList.add('wpl-sidebar');
    this.setAttribute('role', 'navigation');
    this.setAttribute('aria-label', this.label);
    if (this.list.parentNode !== this) this.append(this.list);
    this.list.replaceChildren(
      ...this.items.map((item) => {
        const link = document.createElement('a');
        link.href = item.href;
        link.textContent = item.label;
        if (item.current) link.setAttribute('aria-current', 'page');
        return link;
      }),
    );
  }
}

export class PageHeader extends WplElement {
  static override properties = {
    title: { type: String },
    description: { type: String },
  };

  declare title: string;
  declare description: string;

  constructor() {
    super();
    this.title = '';
    this.description = '';
  }

  protected override render(): RenderResult {
    return html`<header class="wpl-page-header">
      <div>
        <h1 class="wpl-page-title">${this.title}</h1>
        ${this.description ? html`<p class="wpl-page-description">${this.description}</p>` : nothing}
      </div>
      <div class="wpl-cluster"><span data-wpl-slot="actions" style="display:contents"></span></div>
    </header>`;
  }
}

export class Footer extends WplElement {
  static override properties = {
    note: { type: String },
  };

  declare note: string;

  constructor() {
    super();
    this.note = '';
  }

  protected override render(): RenderResult {
    return html`<footer class="wpl-footer">
      ${this.note ? html`<p style="margin:0">${this.note}</p>` : nothing}
      <span data-wpl-slot="" style="display:contents"></span>
    </footer>`;
  }
}

export class ResponsiveLayout extends WplHost {
  static override properties = {
    open: { type: Boolean },
  };

  declare open: boolean;
  private main = document.createElement('div');

  constructor() {
    super();
    this.open = false;
    this.main.className = 'wpl-layout-main';
  }

  protected override syncHost(_changed: PropertyValues): void {
    this.classList.add('wpl-layout');
    this.toggleAttribute('data-open', this.open);
    if (this.main.parentNode !== this) this.append(this.main);
    for (const node of [...this.childNodes]) {
      if (node === this.main) continue;
      const sidebar = node instanceof Element && (node.tagName === 'WPL-SIDEBAR' || node.getAttribute('slot') === 'sidebar');
      if (sidebar) {
        if (node.nextSibling !== this.main) this.insertBefore(node, this.main);
        continue;
      }
      if (node.parentNode !== this.main) this.main.append(node);
    }
  }
}

export class SplitPane extends WplHost {
  static override properties = {
    label: { type: String },
    size: { type: Number },
  };

  declare label: string;
  declare size: number | null;
  private internal = 50;
  private readonly start = document.createElement('div');
  private readonly separator = document.createElement('div');
  private readonly end = document.createElement('div');
  private built = false;

  constructor() {
    super();
    this.label = '';
    this.size = null;
    this.start.className = 'wpl-split-pane';
    this.start.dataset.wplPane = 'start';
    this.end.className = 'wpl-split-pane';
    this.end.dataset.wplPane = 'end';
    this.separator.className = 'wpl-split-separator';
    this.separator.tabIndex = 0;
    this.separator.setAttribute('role', 'separator');
    this.separator.setAttribute('aria-orientation', 'vertical');
    this.separator.setAttribute('aria-valuemin', '20');
    this.separator.setAttribute('aria-valuemax', '80');
  }

  private current(): number {
    return Math.min(80, Math.max(20, this.size ?? this.internal));
  }

  private commit(next: number): void {
    const clamped = Math.min(80, Math.max(20, next));
    if (this.size === null) this.internal = clamped;
    emit(this, 'wpl-change', { value: clamped });
    this.requestUpdate();
  }

  protected override syncHost(): void {
    const current = this.current();
    this.classList.add('wpl-split');
    this.style.setProperty('--wpl-split-size', `${current}%`);
    this.separator.setAttribute('aria-valuenow', String(Math.round(current)));
    this.separator.setAttribute('aria-label', this.label);
    if (!this.built) {
      this.built = true;
      this.append(this.start, this.separator, this.end);
      this.separator.addEventListener('keydown', (event) => {
        const direction = readingDirection(this);
        const step = event.key === 'ArrowRight' ? (direction === 'rtl' ? -5 : 5) : event.key === 'ArrowLeft' ? (direction === 'rtl' ? 5 : -5) : 0;
        if (!step) return;
        event.preventDefault();
        this.commit(current + step);
      });
      this.separator.addEventListener('pointerdown', (event) => {
        this.separator.setPointerCapture(event.pointerId);
        const move = (next: PointerEvent) => {
          const rect = this.getBoundingClientRect();
          if (!rect.width) return;
          const direction = readingDirection(this);
          const ratio = direction === 'rtl' ? (rect.right - next.clientX) / rect.width : (next.clientX - rect.left) / rect.width;
          this.commit(ratio * 100);
        };
        const up = () => {
          this.separator.removeEventListener('pointermove', move);
          this.separator.removeEventListener('pointerup', up);
        };
        this.separator.addEventListener('pointermove', move);
        this.separator.addEventListener('pointerup', up);
      });
    }
    for (const node of [...this.childNodes]) {
      if (node === this.start || node === this.separator || node === this.end) continue;
      const slot = node instanceof Element ? node.getAttribute('slot') : null;
      const pane = slot === 'end' ? this.end : this.start;
      if (node.parentNode !== pane) pane.append(node);
    }
  }
}

defineTag('wpl-container', Container);
defineTag('wpl-stack', Stack);
defineTag('wpl-flex', Flex);
defineTag('wpl-grid', Grid);
defineTag('wpl-navigation-menu', NavigationMenu);
defineTag('wpl-navbar', Navbar);
defineTag('wpl-sidebar', Sidebar);
defineTag('wpl-page-header', PageHeader);
defineTag('wpl-footer', Footer);
defineTag('wpl-responsive-layout', ResponsiveLayout);
defineTag('wpl-split-pane', SplitPane);
