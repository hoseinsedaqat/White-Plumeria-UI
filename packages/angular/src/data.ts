import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  booleanAttribute,
  computed,
  forwardRef,
  input,
  numberAttribute,
  output,
  signal,
} from '@angular/core';
import { formatNumber, queryTable, toggleSort, type ColumnSpec } from '@white-plumeria/core';
import { EmptyState } from './display';
import { SearchInput } from './form';
import { Icon } from './icon';
import { injectWhitePlumeria } from './provider';

export interface DataColumn<T = Record<string, unknown>> {
  id: string;
  header: string;
  accessor: (row: T) => string;
  text: (row: T) => string;
  sortValue?: (row: T) => string | number;
}

export interface TimelineItem {
  id: string;
  title: string;
  time: string;
  dateTime?: string;
  meta?: string;
}

export interface TreeNode {
  id: string;
  label: string;
  children?: TreeNode[];
}

export interface ChartPoint {
  label: string;
  value: number;
}

@Component({
  selector: 'wpl-table',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  template: `
    <table class="wpl-table">
      <caption>{{ caption() }}</caption>
      <ng-content />
    </table>
  `,
  host: { '[class]': 'classes()' },
})
export class Table {
  readonly caption = input.required<string>();
  readonly className = input('', { alias: 'class' });
  readonly classes = computed(() => (this.className() ? `wpl-table-wrap ${this.className()}` : 'wpl-table-wrap'));
}

@Component({
  selector: 'wpl-pagination',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  imports: [Icon],
  template: `
    <button type="button" class="wpl-page" [disabled]="page() <= 1" (click)="pageChange.emit(page() - 1)">
      <wpl-icon name="chevronLeft" />
      <span class="wpl-sr-only">{{ previousLabel() }}</span>
    </button>
    @for (item of pages(); track item.value) {
      @if (item.gap) {
        <span aria-hidden="true">…</span>
      }
      <button type="button" class="wpl-page" [attr.aria-current]="item.value === page() ? 'page' : null" (click)="pageChange.emit(item.value)">
        {{ item.value }}
      </button>
    }
    <button type="button" class="wpl-page" [disabled]="page() >= pageCount()" (click)="pageChange.emit(page() + 1)">
      <wpl-icon name="chevronRight" />
      <span class="wpl-sr-only">{{ nextLabel() }}</span>
    </button>
  `,
  host: {
    class: 'wpl-pagination',
    '[attr.aria-label]': 'accessibleLabel()',
  },
})
export class Pagination {
  readonly page = input(1, { transform: numberAttribute });
  readonly pageCount = input(1, { transform: numberAttribute });
  readonly label = input<string>();
  readonly pageChange = output<number>();
  private readonly wpl = injectWhitePlumeria();
  readonly previousLabel = computed(() => this.wpl.t('previous'));
  readonly nextLabel = computed(() => this.wpl.t('next'));
  readonly accessibleLabel = computed(() => this.label() || this.wpl.t('pagination'));
  readonly pages = computed(() => {
    const page = this.page();
    const pageCount = this.pageCount();
    const values = Array.from({ length: pageCount }, (_, index) => index + 1).filter(
      (item) => item === 1 || item === pageCount || Math.abs(item - page) <= 1,
    );
    return values.map((value, index) => {
      const previous = values[index - 1];
      return { value, gap: previous !== undefined && value - previous > 1 };
    });
  });
}

@Component({
  selector: 'wpl-data-table',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  imports: [SearchInput, EmptyState, Pagination],
  template: `
    <div class="wpl-data-table">
      @if (filterable()) {
        <div class="wpl-table-toolbar">
          <wpl-search-input [label]="searchLabel()" [value]="filter()" (valueChange)="setFilter($event)" />
          <label class="wpl-sort-field">
            <span class="wpl-sr-only">{{ sortLabel() }}</span>
            <select class="wpl-select" [value]="sortId() || ''" (change)="sortFromSelect($event)">
              <option value="">{{ sortLabel() }}</option>
              @for (column of columns(); track column.id) {
                <option [value]="column.id">{{ column.header }}</option>
              }
            </select>
          </label>
          <span class="wpl-muted">{{ totalLabel() }}</span>
        </div>
      }
      <div class="wpl-table-wrap">
        <table class="wpl-table">
          <caption>{{ caption() }}</caption>
          <thead>
            <tr>
              @for (column of columns(); track column.id) {
                <th scope="col" [attr.aria-sort]="ariaSort(column.id)">
                  <button type="button" class="wpl-sort" (click)="applySort(toggle(column.id))">
                    {{ column.header }}
                    @if (sortId() === column.id) {
                      <span class="wpl-sort-mark">{{ sortDirection() === 'asc' ? '↑' : '↓' }}</span>
                    }
                    <span class="wpl-sr-only">{{ sortLabel() }}</span>
                  </button>
                </th>
              }
            </tr>
          </thead>
          <tbody>
            @if (!result().rows.length) {
              <tr>
                <td [attr.colspan]="columns().length">
                  <wpl-empty [title]="emptyLabel()" [description]="noResultsLabel()" />
                </td>
              </tr>
            } @else {
              @for (row of result().rows; track $index) {
                <tr>
                  @for (column of columns(); track column.id) {
                    <td [attr.data-label]="column.header">{{ column.accessor(row) }}</td>
                  }
                </tr>
              }
            }
          </tbody>
        </table>
      </div>
      <div class="wpl-flex wpl-flex-between" style="margin-block-start: 0.75rem">
        <span class="wpl-muted">{{ pageLabel() }}</span>
        <wpl-pagination [page]="result().page" [pageCount]="result().pageCount" (pageChange)="page.set($event)" />
      </div>
    </div>
  `,
})
export class DataTable<T extends Record<string, unknown> = Record<string, unknown>> {
  readonly caption = input.required<string>();
  readonly columns = input.required<DataColumn<T>[]>();
  readonly rows = input.required<T[]>();
  readonly pageSize = input(8, { transform: numberAttribute });
  readonly filterable = input(true, { transform: booleanAttribute });
  readonly sortChange = output<{ sortId?: string; sortDirection: 'asc' | 'desc' }>();
  private readonly wpl = injectWhitePlumeria();
  readonly filter = signal('');
  readonly sortId = signal<string | undefined>(undefined);
  readonly sortDirection = signal<'asc' | 'desc'>('asc');
  readonly page = signal(1);
  readonly searchLabel = computed(() => this.wpl.t('search'));
  readonly sortLabel = computed(() => this.wpl.t('sort'));
  readonly emptyLabel = computed(() => this.wpl.t('empty'));
  readonly noResultsLabel = computed(() => this.wpl.t('noResults'));
  readonly result = computed(() => {
    const columns = this.columns();
    const specs: ColumnSpec<T>[] = columns.map((column) => ({
      id: column.id,
      header: column.header,
      text: column.text,
      sortValue: column.sortValue,
    }));
    return queryTable(this.rows(), specs, {
      filter: this.filter(),
      sortId: this.sortId(),
      sortDirection: this.sortDirection(),
      page: this.page(),
      pageSize: this.pageSize(),
    });
  });
  readonly totalLabel = computed(() => `${formatNumber(this.result().total, this.wpl.preferences().locale)} ${this.wpl.t('rows')}`);
  readonly pageLabel = computed(
    () =>
      `${this.wpl.t('page')} ${formatNumber(this.result().page, this.wpl.preferences().locale)} ${this.wpl.t('of')} ${formatNumber(this.result().pageCount, this.wpl.preferences().locale)}`,
  );

  setFilter(value: string) {
    this.filter.set(value);
    this.page.set(1);
  }

  applySort(next: { sortId?: string; sortDirection: 'asc' | 'desc' }) {
    this.sortId.set(next.sortId);
    this.sortDirection.set(next.sortDirection);
    this.sortChange.emit(next);
  }

  toggle(id: string) {
    return toggleSort({ sortId: this.sortId(), sortDirection: this.sortDirection() }, id);
  }

  sortFromSelect(event: Event) {
    const value = event.target instanceof HTMLSelectElement ? event.target.value : '';
    this.applySort({ sortId: value || undefined, sortDirection: 'asc' });
  }

  ariaSort(id: string): 'ascending' | 'descending' | 'none' {
    if (this.sortId() !== id) return 'none';
    return this.sortDirection() === 'asc' ? 'ascending' : 'descending';
  }
}

@Component({
  selector: 'wpl-breadcrumb',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  imports: [Icon],
  template: `
    <ol>
      @for (item of items(); track $index) {
        <li>
          @if ($index > 0) {
            <wpl-icon name="chevronRight" />
          }
          @if ($last || !item.href) {
            <span [attr.aria-current]="$last ? 'page' : null">{{ item.label }}</span>
          } @else {
            <a class="wpl-link" [href]="item.href">{{ item.label }}</a>
          }
        </li>
      }
    </ol>
  `,
  host: {
    class: 'wpl-breadcrumb',
    '[attr.aria-label]': 'label()',
  },
})
export class Breadcrumb {
  readonly items = input.required<Array<{ href?: string; label: string }>>();
  private readonly wpl = injectWhitePlumeria();
  readonly label = computed(() => this.wpl.t('breadcrumb'));
}

@Component({
  selector: 'wpl-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  template: `
    <ul class="wpl-list">
      @for (item of items(); track item.id) {
        <li class="wpl-list-item">
          <div>
            <p class="wpl-timeline-title">{{ item.title }}</p>
            @if (item.description) {
              <p class="wpl-timeline-body">{{ item.description }}</p>
            }
          </div>
          @if (item.meta) {
            <span class="wpl-muted">{{ item.meta }}</span>
          }
        </li>
      }
    </ul>
  `,
})
export class List {
  readonly items = input.required<Array<{ id: string; title: string; description?: string; meta?: string }>>();
}

@Component({
  selector: 'wpl-timeline',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  template: `
    <ol class="wpl-timeline">
      @for (item of items(); track item.id) {
        <li class="wpl-timeline-item">
          <div>
            <p class="wpl-timeline-title">{{ item.title }}</p>
            <p class="wpl-timeline-meta">
              <time [attr.dateTime]="item.dateTime">{{ item.time }}</time>
              @if (item.meta) {
                {{ ' · ' + item.meta }}
              }
            </p>
          </div>
        </li>
      }
    </ol>
  `,
})
export class Timeline {
  readonly items = input.required<TimelineItem[]>();
}

@Component({
  selector: 'wpl-tree',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  imports: [forwardRef(() => TreeNodeView)],
  template: `
    <ul class="wpl-tree" role="tree" [attr.aria-label]="label()">
      @for (node of nodes(); track node.id) {
        <wpl-tree-node [node]="node" [expanded]="expanded()" [selected]="selected()" (toggle)="toggle($event)" (picked)="pick($event)" />
      }
    </ul>
  `,
})
export class TreeView {
  readonly nodes = input.required<TreeNode[]>();
  readonly label = input.required<string>();
  readonly select = output<string>();
  readonly expanded = signal<string[]>([]);
  readonly selected = signal<string | null>(null);

  toggle(id: string) {
    this.expanded.update((current) => (current.includes(id) ? current.filter((item) => item !== id) : [...current, id]));
  }

  pick(id: string) {
    this.selected.set(id);
    this.select.emit(id);
  }
}

@Component({
  selector: 'wpl-tree-node',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  imports: [Icon, forwardRef(() => TreeNodeView)],
  template: `
    <li class="wpl-tree-item" role="none">
      <button
        type="button"
        role="treeitem"
        class="wpl-tree-row"
        [attr.aria-expanded]="hasChildren() ? isOpen() : null"
        [attr.aria-selected]="selected() === node().id"
        (click)="pick()"
        (keydown)="onKey($event)"
      >
        @if (hasChildren()) {
          <wpl-icon [name]="isOpen() ? 'chevronDown' : 'chevronRight'" />
        } @else {
          <span style="inline-size: 1.1em"></span>
        }
        {{ node().label }}
      </button>
      @if (hasChildren() && isOpen()) {
        <ul class="wpl-tree-children" role="group">
          @for (child of node().children ?? []; track child.id) {
            <wpl-tree-node [node]="child" [expanded]="expanded()" [selected]="selected()" (toggle)="toggle.emit($event)" (picked)="picked.emit($event)" />
          }
        </ul>
      }
    </li>
  `,
})
export class TreeNodeView {
  readonly node = input.required<TreeNode>();
  readonly expanded = input.required<string[]>();
  readonly selected = input.required<string | null>();
  readonly toggle = output<string>();
  readonly picked = output<string>();

  hasChildren(): boolean {
    return Boolean(this.node().children?.length);
  }

  isOpen(): boolean {
    return this.expanded().includes(this.node().id);
  }

  pick() {
    this.picked.emit(this.node().id);
    if (this.hasChildren()) this.toggle.emit(this.node().id);
  }

  onKey(event: KeyboardEvent) {
    if (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft') return;
    event.preventDefault();
    if (this.hasChildren()) this.toggle.emit(this.node().id);
  }
}

@Component({
  selector: 'wpl-chart',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  template: `
    <figure class="wpl-chart">
      <figcaption class="wpl-card-title" style="font-size: var(--wpl-font-size-lg)">{{ title() }}</figcaption>
      @if (description()) {
        <p class="wpl-muted">{{ description() }}</p>
      }
      @if (invalid()) {
        <p class="wpl-field-error" role="alert">ChartContainer accepts finite, non-negative values only.</p>
      } @else {
        <div aria-hidden="true">
          @for (point of data(); track point.label) {
            <div class="wpl-chart-bar">
              <span>{{ point.label }}</span>
              <span class="wpl-chart-track">
                <span class="wpl-chart-fill" [style.inline-size]="width(point.value)"></span>
              </span>
              <span>{{ formatted(point.value) }}</span>
            </div>
          }
        </div>
      }
      <table class="wpl-table wpl-chart-table">
        <caption class="wpl-sr-only">{{ title() }}</caption>
        <thead>
          <tr>
            <th scope="col">Label</th>
            <th scope="col">Value</th>
          </tr>
        </thead>
        <tbody>
          @for (point of data(); track point.label) {
            <tr>
              <th scope="row">{{ point.label }}</th>
              <td>{{ formatted(point.value) }}</td>
            </tr>
          }
        </tbody>
      </table>
    </figure>
  `,
})
export class ChartContainer {
  readonly title = input.required<string>();
  readonly data = input.required<ChartPoint[]>();
  readonly description = input<string>();
  private readonly wpl = injectWhitePlumeria();
  readonly invalid = computed(() => this.data().some((point) => !Number.isFinite(point.value) || point.value < 0));
  readonly max = computed(() => Math.max(1, ...this.data().map((point) => point.value)));

  width(value: number): string {
    return `${(value / this.max()) * 100}%`;
  }

  formatted(value: number): string {
    return formatNumber(value, this.wpl.preferences().locale);
  }
}
