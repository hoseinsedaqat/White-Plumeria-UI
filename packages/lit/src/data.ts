import {
  formatNumber,
  queryTable,
  toggleSort,
  type ColumnSpec,
} from '@white-plumeria/core';
import { defineTag, html, nothing, WplElement, type RenderResult } from './element';
import { iconSvg } from './icon';
import { localeOf, translate } from './provider';

export interface DataColumn<T = unknown> {
  id: string;
  header: string;
  text: (row: T) => string;
  accessor?: (row: T) => string | number;
  sortValue?: (row: T) => string | number;
}

export class Table extends WplElement {
  static override properties = {
    caption: { type: String },
  };

  declare caption: string;

  constructor() {
    super();
    this.caption = '';
  }

  protected override render(): RenderResult {
    return html`<div class="wpl-table-wrap">
      <table class="wpl-table">
        <caption>${this.caption}</caption>
        <span data-wpl-slot="" style="display:contents"></span>
      </table>
    </div>`;
  }
}

export class Pagination extends WplElement {
  static override properties = {
    page: { type: Number },
    pageCount: { type: Number, attribute: 'page-count' },
    label: { type: String },
  };

  declare page: number;
  declare pageCount: number;
  declare label: string;

  constructor() {
    super();
    this.page = 1;
    this.pageCount = 1;
    this.label = '';
  }

  private go(page: number): void {
    this.emit('wpl-change', { value: page });
  }

  protected override render(): RenderResult {
    const page = this.page || 1;
    const pageCount = Math.max(1, this.pageCount || 1);
    const pages = Array.from({ length: pageCount }, (_, index) => index + 1).filter(
      (item) => item === 1 || item === pageCount || Math.abs(item - page) <= 1,
    );
    return html`<nav class="wpl-pagination" aria-label=${this.label || translate(this, 'pagination')}>
      <button type="button" class="wpl-page" ?disabled=${page <= 1} @click=${() => this.go(page - 1)}>
        ${iconSvg('chevronLeft')}<span class="wpl-sr-only">${translate(this, 'previous')}</span>
      </button>
      ${pages.map((item, index) => {
        const previous = pages[index - 1];
        const gap = previous !== undefined && item - previous > 1;
        return html`${gap ? html`<span aria-hidden="true">…</span>` : nothing}<button type="button" class="wpl-page" aria-current=${item === page ? 'page' : nothing} @click=${() => this.go(item)}>${item}</button>`;
      })}
      <button type="button" class="wpl-page" ?disabled=${page >= pageCount} @click=${() => this.go(page + 1)}>
        ${iconSvg('chevronRight')}<span class="wpl-sr-only">${translate(this, 'next')}</span>
      </button>
    </nav>`;
  }
}

export class DataTable extends WplElement {
  static override properties = {
    caption: { type: String },
    columns: { attribute: false },
    rows: { attribute: false },
    pageSize: { type: Number, attribute: 'page-size' },
    filterable: { type: Boolean },
  };

  declare caption: string;
  declare columns: DataColumn[];
  declare rows: unknown[];
  declare pageSize: number;
  declare filterable: boolean;
  private filter = '';
  private sortId: string | undefined;
  private sortDirection: 'asc' | 'desc' = 'asc';
  private page = 1;

  constructor() {
    super();
    this.caption = '';
    this.columns = [];
    this.rows = [];
    this.pageSize = 8;
    this.filterable = true;
  }

  protected override render(): RenderResult {
    const locale = localeOf(this);
    const specs: ColumnSpec<unknown>[] = this.columns.map((column) => ({
      id: column.id,
      header: column.header,
      text: column.text,
      sortValue: column.sortValue,
    }));
    const result = queryTable(this.rows, specs, {
      filter: this.filter,
      sortId: this.sortId,
      sortDirection: this.sortDirection,
      page: this.page,
      pageSize: this.pageSize || 8,
    });
    return html`<div class="wpl-data-table">
      ${this.filterable
        ? html`<div class="wpl-table-toolbar">
            <wpl-search-input
              label=${translate(this, 'search')}
              .value=${this.filter}
              visually-hidden-label
              @wpl-change=${(event: CustomEvent<{ value: string }>) => {
                this.filter = event.detail.value;
                this.page = 1;
                this.requestUpdate();
              }}
            ></wpl-search-input>
            <label class="wpl-sort-field">
              <span class="wpl-sr-only">${translate(this, 'sort')}</span>
              <select
                class="wpl-select"
                @change=${(event: Event) => {
                  const element = event.target instanceof HTMLSelectElement ? event.target : null;
                  this.sortId = element?.value || undefined;
                  this.sortDirection = 'asc';
                  this.emit('wpl-sort-change', { sortId: this.sortId, sortDirection: 'asc' });
                  this.requestUpdate();
                }}
              >
                <option value="">${translate(this, 'sort')}</option>
                ${this.columns.map((column) => html`<option value=${column.id} ?selected=${this.sortId === column.id}>${column.header}</option>`)}
              </select>
            </label>
            <span class="wpl-muted">${formatNumber(result.total, locale)} ${translate(this, 'rows')}</span>
          </div>`
        : nothing}
      <div class="wpl-table-wrap">
        <table class="wpl-table">
          <caption>${this.caption}</caption>
          <thead>
            <tr>
              ${this.columns.map((column) => {
                const active = this.sortId === column.id;
                return html`<th scope="col" aria-sort=${active ? (this.sortDirection === 'asc' ? 'ascending' : 'descending') : 'none'}>
                  <button
                    type="button"
                    class="wpl-sort"
                    @click=${() => {
                      const next = toggleSort({ sortId: this.sortId, sortDirection: this.sortDirection }, column.id);
                      this.sortId = next.sortId;
                      this.sortDirection = next.sortDirection;
                      this.emit('wpl-sort-change', next);
                      this.requestUpdate();
                    }}
                  >
                    ${column.header}
                    ${active ? html`<span class="wpl-sort-mark">${iconSvg(this.sortDirection === 'asc' ? 'arrowUp' : 'arrowDown')}</span>` : nothing}
                    <span class="wpl-sr-only">${translate(this, 'sort')}</span>
                  </button>
                </th>`;
              })}
            </tr>
          </thead>
          <tbody>
            ${result.rows.length === 0
              ? html`<tr><td colspan=${this.columns.length || 1}><div class="wpl-empty"><h2 class="wpl-empty-title">${translate(this, 'empty')}</h2><p class="wpl-empty-description">${translate(this, 'noResults')}</p></div></td></tr>`
              : result.rows.map(
                  (row) => html`<tr>
                    ${this.columns.map((column) => html`<td data-label=${column.header}>${column.accessor?.(row) ?? column.text(row)}</td>`)}
                  </tr>`,
                )}
          </tbody>
        </table>
      </div>
      <div class="wpl-flex wpl-flex-between" style="margin-block-start:0.75rem">
        <span class="wpl-muted">${translate(this, 'page')} ${formatNumber(result.page, locale)} ${translate(this, 'of')} ${formatNumber(result.pageCount, locale)}</span>
        <wpl-pagination
          page=${result.page}
          page-count=${result.pageCount}
          @wpl-change=${(event: CustomEvent<{ value: number }>) => {
            this.page = event.detail.value;
            this.requestUpdate();
          }}
        ></wpl-pagination>
      </div>
    </div>`;
  }
}

export class Breadcrumb extends WplElement {
  static override properties = {
    items: { attribute: false },
  };

  declare items: Array<{ href?: string; label: string }>;

  constructor() {
    super();
    this.items = [];
  }

  protected override render(): RenderResult {
    return html`<nav class="wpl-breadcrumb" aria-label=${translate(this, 'breadcrumb')}>
      <ol>
        ${this.items.map((item, index) => {
          const last = index === this.items.length - 1;
          return html`<li>
            ${index > 0 ? iconSvg('chevronRight') : nothing}
            ${last || !item.href
              ? html`<span aria-current=${last ? 'page' : nothing}>${item.label}</span>`
              : html`<a class="wpl-link" href=${item.href}>${item.label}</a>`}
          </li>`;
        })}
      </ol>
    </nav>`;
  }
}

export class List extends WplElement {
  static override properties = {
    items: { attribute: false },
  };

  declare items: Array<{ id: string; title: string; description?: string; meta?: string }>;

  constructor() {
    super();
    this.items = [];
  }

  protected override render(): RenderResult {
    return html`<ul class="wpl-list">
      ${this.items.map(
        (item) => html`<li class="wpl-list-item">
          <div>
            <p class="wpl-timeline-title">${item.title}</p>
            ${item.description ? html`<p class="wpl-timeline-body">${item.description}</p>` : nothing}
          </div>
          ${item.meta ? html`<span class="wpl-muted">${item.meta}</span>` : nothing}
        </li>`,
      )}
    </ul>`;
  }
}

export interface TimelineItem {
  id: string;
  title: string;
  time: string;
  dateTime?: string;
  meta?: string;
}

export class Timeline extends WplElement {
  static override properties = {
    items: { attribute: false },
  };

  declare items: TimelineItem[];

  constructor() {
    super();
    this.items = [];
  }

  protected override render(): RenderResult {
    return html`<ol class="wpl-timeline">
      ${this.items.map(
        (item) => html`<li class="wpl-timeline-item">
          <div>
            <p class="wpl-timeline-title">${item.title}</p>
            <p class="wpl-timeline-meta"><time datetime=${item.dateTime || nothing}>${item.time}</time>${item.meta ? ` · ${item.meta}` : ''}</p>
          </div>
        </li>`,
      )}
    </ol>`;
  }
}

export interface TreeNode {
  id: string;
  label: string;
  children?: TreeNode[];
}

export class TreeView extends WplElement {
  static override properties = {
    nodes: { attribute: false },
    label: { type: String },
  };

  declare nodes: TreeNode[];
  declare label: string;
  private expanded: string[] = [];
  private selected: string | null = null;

  constructor() {
    super();
    this.nodes = [];
    this.label = '';
  }

  private toggle(id: string): void {
    this.expanded = this.expanded.includes(id) ? this.expanded.filter((item) => item !== id) : [...this.expanded, id];
    this.requestUpdate();
  }

  private select(id: string): void {
    this.selected = id;
    this.emit('wpl-select', { id });
    this.requestUpdate();
  }

  private nodeTemplate(node: TreeNode): RenderResult {
    const isOpen = this.expanded.includes(node.id);
    const hasChildren = Boolean(node.children?.length);
    return html`<li class="wpl-tree-item" role="none">
      <button
        type="button"
        role="treeitem"
        class="wpl-tree-row"
        aria-expanded=${hasChildren ? (isOpen ? 'true' : 'false') : nothing}
        aria-selected=${this.selected === node.id ? 'true' : 'false'}
        @click=${() => {
          this.select(node.id);
          if (hasChildren) this.toggle(node.id);
        }}
        @keydown=${(event: KeyboardEvent) => {
          if ((event.key === 'ArrowRight' || event.key === 'ArrowLeft') && hasChildren) {
            event.preventDefault();
            this.toggle(node.id);
          }
        }}
      >
        ${hasChildren ? iconSvg(isOpen ? 'chevronDown' : 'chevronRight') : html`<span style="inline-size:1.1em"></span>`}
        ${node.label}
      </button>
      ${hasChildren && isOpen
        ? html`<ul class="wpl-tree-children" role="group">${node.children?.map((child) => this.nodeTemplate(child))}</ul>`
        : nothing}
    </li>`;
  }

  protected override render(): RenderResult {
    return html`<ul class="wpl-tree" role="tree" aria-label=${this.label}>${this.nodes.map((node) => this.nodeTemplate(node))}</ul>`;
  }
}

export interface ChartPoint {
  label: string;
  value: number;
}

export class ChartContainer extends WplElement {
  static override properties = {
    title: { type: String },
    description: { type: String },
    data: { attribute: false },
  };

  declare title: string;
  declare description: string;
  declare data: ChartPoint[];

  constructor() {
    super();
    this.title = '';
    this.description = '';
    this.data = [];
  }

  protected override render(): RenderResult {
    const locale = localeOf(this);
    const invalid = this.data.some((point) => !Number.isFinite(point.value) || point.value < 0);
    const max = Math.max(1, ...this.data.map((point) => point.value));
    return html`<figure class="wpl-chart">
      <figcaption class="wpl-card-title" style="font-size:var(--wpl-font-size-lg)">${this.title}</figcaption>
      ${this.description ? html`<p class="wpl-muted">${this.description}</p>` : nothing}
      ${invalid
        ? html`<p class="wpl-field-error" role="alert">ChartContainer accepts finite, non-negative values only.</p>`
        : html`<div aria-hidden="true">
            ${this.data.map(
              (point) => html`<div class="wpl-chart-bar">
                <span>${point.label}</span>
                <span class="wpl-chart-track"><span class="wpl-chart-fill" style=${`inline-size:${(point.value / max) * 100}%`}></span></span>
                <span>${formatNumber(point.value, locale)}</span>
              </div>`,
            )}
          </div>`}
      <table class="wpl-table wpl-chart-table">
        <caption class="wpl-sr-only">${this.title}</caption>
        <thead>
          <tr><th scope="col">Label</th><th scope="col">Value</th></tr>
        </thead>
        <tbody>
          ${this.data.map(
            (point) => html`<tr><th scope="row">${point.label}</th><td>${formatNumber(point.value, locale)}</td></tr>`,
          )}
        </tbody>
      </table>
    </figure>`;
  }
}

defineTag('wpl-table', Table);
defineTag('wpl-pagination', Pagination);
defineTag('wpl-data-table', DataTable);
defineTag('wpl-breadcrumb', Breadcrumb);
defineTag('wpl-list', List);
defineTag('wpl-timeline', Timeline);
defineTag('wpl-tree-view', TreeView);
defineTag('wpl-chart-container', ChartContainer);
