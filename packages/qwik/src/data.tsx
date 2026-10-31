import { formatNumber, queryTable, toggleSort, type ColumnSpec } from '@white-plumeria/core';
import { $, component$, Slot, useSignal, type QRL } from '@qwik.dev/core';
import { EmptyState } from './display';
import { SearchInput } from './form';
import { Icon } from './icon';
import { useWhitePlumeria } from './provider';

export const Table = component$<{ caption: string; class?: string }>((props) => {
  return (
    <div class={props.class ? `wpl-table-wrap ${props.class}` : 'wpl-table-wrap'}>
      <table class="wpl-table">
        <caption>{props.caption}</caption>
        <Slot />
      </table>
    </div>
  );
});

export interface DataColumn<T> {
  id: string;
  header: string;
  text: (row: T) => string;
  accessor?: (row: T) => string | number;
  sortValue?: (row: T) => string | number;
}

export const DataTable = component$<{
  caption: string;
  columns: DataColumn<unknown>[];
  rows: unknown[];
  pageSize?: number;
  filterable?: boolean;
  onSortChange$?: QRL<(sort: { sortId?: string; sortDirection: 'asc' | 'desc' }) => void>;
}>((props) => {
  const wpl = useWhitePlumeria();
  const filter = useSignal('');
  const sortId = useSignal<string | undefined>(undefined);
  const sortDirection = useSignal<'asc' | 'desc'>('asc');
  const page = useSignal(1);
  const pageSize = props.pageSize ?? 8;
  const specs: ColumnSpec<unknown>[] = props.columns.map((column) => ({
    id: column.id,
    header: column.header,
    text: column.text,
    sortValue: column.sortValue,
  }));
  const result = queryTable(props.rows, specs, {
    filter: filter.value,
    sortId: sortId.value,
    sortDirection: sortDirection.value,
    page: page.value,
    pageSize,
  });

  return (
    <div class="wpl-data-table">
      {props.filterable !== false ? (
        <div class="wpl-table-toolbar">
          <SearchInput
            label={wpl.t('search')}
            value={filter.value}
            onValueChange$={(value) => {
              filter.value = value;
              page.value = 1;
            }}
          />
          <label class="wpl-sort-field">
            <span class="wpl-sr-only">{wpl.t('sort')}</span>
            <select
              class="wpl-select"
              value={sortId.value ?? ''}
              onChange$={(_, element) => {
                sortId.value = element.value || undefined;
                sortDirection.value = 'asc';
                void props.onSortChange$?.({ sortId: sortId.value, sortDirection: 'asc' });
              }}
            >
              <option value="">{wpl.t('sort')}</option>
              {props.columns.map((column) => (
                <option key={column.id} value={column.id}>{column.header}</option>
              ))}
            </select>
          </label>
          <span class="wpl-muted">{formatNumber(result.total, wpl.locale)} {wpl.t('rows')}</span>
        </div>
      ) : null}
      <div class="wpl-table-wrap">
        <table class="wpl-table">
          <caption>{props.caption}</caption>
          <thead>
            <tr>
              {props.columns.map((column) => {
                const active = sortId.value === column.id;
                return (
                  <th key={column.id} scope="col" aria-sort={active ? (sortDirection.value === 'asc' ? 'ascending' : 'descending') : 'none'}>
                    <button
                      type="button"
                      class="wpl-sort"
                      onClick$={() => {
                        const next = toggleSort({ sortId: sortId.value, sortDirection: sortDirection.value }, column.id);
                        sortId.value = next.sortId;
                        sortDirection.value = next.sortDirection;
                        void props.onSortChange$?.(next);
                      }}
                    >
                      {column.header}
                      {active ? (
                        <span class="wpl-sort-mark">
                          <Icon name={sortDirection.value === 'asc' ? 'arrowUp' : 'arrowDown'} />
                        </span>
                      ) : null}
                      <span class="wpl-sr-only">{wpl.t('sort')}</span>
                    </button>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {result.rows.length === 0 ? (
              <tr>
                <td colSpan={props.columns.length}>
                  <EmptyState title={wpl.t('empty')} description={wpl.t('noResults')} />
                </td>
              </tr>
            ) : (
              result.rows.map((row, index) => (
                <tr key={index}>
                  {props.columns.map((column) => (
                    <td key={column.id} data-label={column.header}>{column.accessor?.(row) ?? column.text(row)}</td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <div class="wpl-flex wpl-flex-between" style={{ marginBlockStart: '0.75rem' }}>
        <span class="wpl-muted">{wpl.t('page')} {formatNumber(result.page, wpl.locale)} {wpl.t('of')} {formatNumber(result.pageCount, wpl.locale)}</span>
        <Pagination page={result.page} pageCount={result.pageCount} onPageChange$={(next) => { page.value = next; }} />
      </div>
    </div>
  );
});

export const Pagination = component$<{
  page: number;
  pageCount: number;
  label?: string;
  onPageChange$: QRL<(page: number) => void>;
}>((props) => {
  const wpl = useWhitePlumeria();
  const pages = Array.from({ length: props.pageCount }, (_, index) => index + 1).filter(
    (item) => item === 1 || item === props.pageCount || Math.abs(item - props.page) <= 1,
  );
  return (
    <nav class="wpl-pagination" aria-label={props.label ?? wpl.t('pagination')}>
      <button type="button" class="wpl-page" disabled={props.page <= 1} onClick$={() => { void props.onPageChange$?.(props.page - 1); }}>
        <Icon name="chevronLeft" />
        <span class="wpl-sr-only">{wpl.t('previous')}</span>
      </button>
      {pages.map((item, index) => {
        const previous = pages[index - 1];
        const gap = previous !== undefined && item - previous > 1;
        return (
          <span key={item} style={{ display: 'contents' }}>
            {gap ? <span aria-hidden="true">…</span> : null}
            <button type="button" class="wpl-page" aria-current={item === props.page ? 'page' : undefined} onClick$={() => { void props.onPageChange$?.(item); }}>
              {item}
            </button>
          </span>
        );
      })}
      <button type="button" class="wpl-page" disabled={props.page >= props.pageCount} onClick$={() => { void props.onPageChange$?.(props.page + 1); }}>
        <Icon name="chevronRight" />
        <span class="wpl-sr-only">{wpl.t('next')}</span>
      </button>
    </nav>
  );
});

export const Breadcrumb = component$<{ items: Array<{ href?: string; label: string }> }>((props) => {
  const wpl = useWhitePlumeria();
  return (
    <nav class="wpl-breadcrumb" aria-label={wpl.t('breadcrumb')}>
      <ol>
        {props.items.map((item, index) => {
          const last = index === props.items.length - 1;
          return (
            <li key={`${item.label}-${index}`}>
              {index > 0 ? <Icon name="chevronRight" /> : null}
              {last || !item.href ? <span aria-current={last ? 'page' : undefined}>{item.label}</span> : <a class="wpl-link" href={item.href}>{item.label}</a>}
            </li>
          );
        })}
      </ol>
    </nav>
  );
});

export const List = component$<{ items: Array<{ id: string; title: string; description?: string; meta?: string }> }>((props) => {
  return (
    <ul class="wpl-list">
      {props.items.map((item) => (
        <li key={item.id} class="wpl-list-item">
          <div>
            <p class="wpl-timeline-title">{item.title}</p>
            {item.description ? <p class="wpl-timeline-body">{item.description}</p> : null}
          </div>
          {item.meta ? <span class="wpl-muted">{item.meta}</span> : null}
        </li>
      ))}
    </ul>
  );
});

export interface TimelineItem {
  id: string;
  title: string;
  time: string;
  dateTime?: string;
  meta?: string;
}

export const Timeline = component$<{ items: TimelineItem[] }>((props) => {
  return (
    <ol class="wpl-timeline">
      {props.items.map((item) => (
        <li key={item.id} class="wpl-timeline-item">
          <div>
            <p class="wpl-timeline-title">{item.title}</p>
            <p class="wpl-timeline-meta">
              <time dateTime={item.dateTime}>{item.time}</time>
              {item.meta ? ` · ${item.meta}` : null}
            </p>
          </div>
        </li>
      ))}
    </ol>
  );
});

export interface TreeNode {
  id: string;
  label: string;
  children?: TreeNode[];
}

export const TreeView = component$<{ nodes: TreeNode[]; label: string; onSelect$?: QRL<(id: string) => void> }>((props) => {
  const expanded = useSignal<string[]>([]);
  const selected = useSignal<string | null>(null);
  const toggle = $((id: string) => {
    expanded.value = expanded.value.includes(id) ? expanded.value.filter((item) => item !== id) : [...expanded.value, id];
  });
  const select = $((id: string) => {
    selected.value = id;
    void props.onSelect$?.(id);
  });
  return (
    <ul class="wpl-tree" role="tree" aria-label={props.label}>
      {props.nodes.map((node) => (
        <TreeNodeView key={node.id} node={node} expanded={expanded.value} selected={selected.value} onToggle$={toggle} onSelect$={select} />
      ))}
    </ul>
  );
});

const TreeNodeView = component$<{
  node: TreeNode;
  expanded: string[];
  selected: string | null;
  onToggle$: QRL<(id: string) => void>;
  onSelect$: QRL<(id: string) => void>;
}>((props) => {
  const isOpen = props.expanded.includes(props.node.id);
  const hasChildren = Boolean(props.node.children?.length);
  return (
    <li class="wpl-tree-item" role="none">
      <button
        type="button"
        role="treeitem"
        class="wpl-tree-row"
        aria-expanded={hasChildren ? isOpen : undefined}
        aria-selected={props.selected === props.node.id}
        onClick$={() => {
          void props.onSelect$?.(props.node.id);
          if (hasChildren) void props.onToggle$?.(props.node.id);
        }}
        onKeyDown$={(event) => {
          if ((event.key === 'ArrowRight' || event.key === 'ArrowLeft') && hasChildren) {
            event.preventDefault();
            void props.onToggle$?.(props.node.id);
          }
        }}
      >
        {hasChildren ? <Icon name={isOpen ? 'chevronDown' : 'chevronRight'} /> : <span style={{ inlineSize: '1.1em' }} />}
        {props.node.label}
      </button>
      {hasChildren && isOpen ? (
        <ul class="wpl-tree-children" role="group">
          {props.node.children?.map((child) => (
            <TreeNodeView key={child.id} node={child} expanded={props.expanded} selected={props.selected} onToggle$={props.onToggle$} onSelect$={props.onSelect$} />
          ))}
        </ul>
      ) : null}
    </li>
  );
});

export interface ChartPoint {
  label: string;
  value: number;
}

export const ChartContainer = component$<{ title: string; data: ChartPoint[]; description?: string }>((props) => {
  const wpl = useWhitePlumeria();
  const invalid = props.data.some((point) => !Number.isFinite(point.value) || point.value < 0);
  const max = Math.max(1, ...props.data.map((point) => point.value));
  return (
    <figure class="wpl-chart">
      <figcaption class="wpl-card-title" style={{ fontSize: 'var(--wpl-font-size-lg)' }}>{props.title}</figcaption>
      {props.description ? <p class="wpl-muted">{props.description}</p> : null}
      {invalid ? (
        <p class="wpl-field-error" role="alert">ChartContainer accepts finite, non-negative values only.</p>
      ) : (
        <div aria-hidden="true">
          {props.data.map((point) => (
            <div class="wpl-chart-bar" key={point.label}>
              <span>{point.label}</span>
              <span class="wpl-chart-track">
                <span class="wpl-chart-fill" style={{ inlineSize: `${(point.value / max) * 100}%` }} />
              </span>
              <span>{formatNumber(point.value, wpl.locale)}</span>
            </div>
          ))}
        </div>
      )}
      <table class="wpl-table wpl-chart-table">
        <caption class="wpl-sr-only">{props.title}</caption>
        <thead>
          <tr>
            <th scope="col">Label</th>
            <th scope="col">Value</th>
          </tr>
        </thead>
        <tbody>
          {props.data.map((point) => (
            <tr key={point.label}>
              <th scope="row">{point.label}</th>
              <td>{formatNumber(point.value, wpl.locale)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </figure>
  );
});
