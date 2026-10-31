import { formatNumber, queryTable, toggleSort, type ColumnSpec } from '@white-plumeria/core';
import { createMemo, createSignal, type JSX } from 'solid-js';
import { EmptyState } from './display.tsx';
import { SearchInput } from './form.tsx';
import { Icon } from './icon.tsx';
import { useWhitePlumeria } from './provider.tsx';

export function Table(props: { caption: string; children: JSX.Element; class?: string; className?: string }) {
  const extra = () => props.class ?? props.className;
  return (
    <div class={extra() ? `wpl-table-wrap ${extra()}` : 'wpl-table-wrap'}>
      <table class="wpl-table">
        <caption>{props.caption}</caption>
        {props.children}
      </table>
    </div>
  );
}

export interface DataColumn<T> {
  id: string;
  header: string;
  accessor: (row: T) => JSX.Element;
  text: (row: T) => string;
  sortValue?: (row: T) => string | number;
}

export function DataTable<T>(props: {
  caption: string;
  columns: DataColumn<T>[];
  rows: T[];
  pageSize?: number;
  filterable?: boolean;
  onSortChange?: (sort: { sortId?: string; sortDirection: 'asc' | 'desc' }) => void;
}) {
  const { t, locale } = useWhitePlumeria();
  const [filter, setFilter] = createSignal('');
  const [sortId, setSortId] = createSignal<string | undefined>();
  const [sortDirection, setSortDirection] = createSignal<'asc' | 'desc'>('asc');
  const [page, setPage] = createSignal(1);
  const specs = (): ColumnSpec<T>[] =>
    props.columns.map((column) => ({
      id: column.id,
      header: column.header,
      text: column.text,
      sortValue: column.sortValue,
    }));
  const result = createMemo(() =>
    queryTable(props.rows, specs(), {
      filter: filter(),
      sortId: sortId(),
      sortDirection: sortDirection(),
      page: page(),
      pageSize: props.pageSize ?? 8,
    }),
  );

  function applySort(next: { sortId?: string; sortDirection: 'asc' | 'desc' }) {
    setSortId(next.sortId);
    setSortDirection(next.sortDirection);
    props.onSortChange?.(next);
  }

  return (
    <div class="wpl-data-table">
      {props.filterable !== false ? (
        <div class="wpl-table-toolbar">
          <SearchInput
            label={t('search')}
            value={filter()}
            onValueChange={(value) => {
              setFilter(value);
              setPage(1);
            }}
          />
          <label class="wpl-sort-field">
            <span class="wpl-sr-only">{t('sort')}</span>
            <select
              class="wpl-select"
              value={sortId() ?? ''}
              onChange={(event) => applySort({ sortId: event.currentTarget.value || undefined, sortDirection: 'asc' })}
            >
              <option value="">{t('sort')}</option>
              {props.columns.map((column) => (
                <option value={column.id}>{column.header}</option>
              ))}
            </select>
          </label>
          <span class="wpl-muted">
            {formatNumber(result().total, locale())} {t('rows')}
          </span>
        </div>
      ) : null}
      <div class="wpl-table-wrap">
        <table class="wpl-table">
          <caption>{props.caption}</caption>
          <thead>
            <tr>
              {props.columns.map((column) => {
                const active = () => sortId() === column.id;
                return (
                  <th scope="col" aria-sort={active() ? (sortDirection() === 'asc' ? 'ascending' : 'descending') : 'none'}>
                    <button type="button" class="wpl-sort" onClick={() => applySort(toggleSort({ sortId: sortId(), sortDirection: sortDirection() }, column.id))}>
                      {column.header}
                      {active() ? (
                        <span class="wpl-sort-mark">
                          <Icon name={sortDirection() === 'asc' ? 'arrowUp' : 'arrowDown'} />
                        </span>
                      ) : null}
                      <span class="wpl-sr-only">{t('sort')}</span>
                    </button>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {result().rows.length === 0 ? (
              <tr>
                <td colspan={props.columns.length}>
                  <EmptyState title={t('empty')} description={t('noResults')} />
                </td>
              </tr>
            ) : (
              result().rows.map((row) => (
                <tr>
                  {props.columns.map((column) => (
                    <td data-label={column.header}>{column.accessor(row)}</td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <div class="wpl-flex wpl-flex-between" style={{ 'margin-block-start': '0.75rem' }}>
        <span class="wpl-muted">
          {t('page')} {formatNumber(result().page, locale())} {t('of')} {formatNumber(result().pageCount, locale())}
        </span>
        <Pagination page={result().page} pageCount={result().pageCount} onPageChange={setPage} />
      </div>
    </div>
  );
}

export function Pagination(props: { page: number; pageCount: number; onPageChange: (page: number) => void; label?: string }) {
  const { t } = useWhitePlumeria();
  const pages = () =>
    Array.from({ length: props.pageCount }, (_, index) => index + 1).filter(
      (item) => item === 1 || item === props.pageCount || Math.abs(item - props.page) <= 1,
    );
  return (
    <nav class="wpl-pagination" aria-label={props.label ?? t('pagination')}>
      <button type="button" class="wpl-page" disabled={props.page <= 1} onClick={() => props.onPageChange(props.page - 1)}>
        <Icon name="chevronLeft" />
        <span class="wpl-sr-only">{t('previous')}</span>
      </button>
      {pages().map((item, index) => {
        const previous = pages()[index - 1];
        const gap = previous !== undefined && item - previous > 1;
        return (
          <span style={{ display: 'contents' }}>
            {gap ? <span aria-hidden="true">…</span> : null}
            <button type="button" class="wpl-page" aria-current={item === props.page ? 'page' : undefined} onClick={() => props.onPageChange(item)}>
              {item}
            </button>
          </span>
        );
      })}
      <button type="button" class="wpl-page" disabled={props.page >= props.pageCount} onClick={() => props.onPageChange(props.page + 1)}>
        <Icon name="chevronRight" />
        <span class="wpl-sr-only">{t('next')}</span>
      </button>
    </nav>
  );
}

export function Breadcrumb(props: { items: Array<{ href?: string; label: string }> }) {
  const { t } = useWhitePlumeria();
  return (
    <nav class="wpl-breadcrumb" aria-label={t('breadcrumb')}>
      <ol>
        {props.items.map((item, index) => {
          const last = index === props.items.length - 1;
          return (
            <li>
              {index > 0 ? <Icon name="chevronRight" /> : null}
              {last || !item.href ? <span aria-current={last ? 'page' : undefined}>{item.label}</span> : <a class="wpl-link" href={item.href}>{item.label}</a>}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

export function List(props: { items: Array<{ id: string; title: string; description?: string; meta?: string }> }) {
  return (
    <ul class="wpl-list">
      {props.items.map((item) => (
        <li class="wpl-list-item">
          <div>
            <p class="wpl-timeline-title">{item.title}</p>
            {item.description ? <p class="wpl-timeline-body">{item.description}</p> : null}
          </div>
          {item.meta ? <span class="wpl-muted">{item.meta}</span> : null}
        </li>
      ))}
    </ul>
  );
}

export interface TimelineItem {
  id: string;
  title: string;
  time: string;
  dateTime?: string;
  meta?: string;
}

export function Timeline(props: { items: TimelineItem[] }) {
  return (
    <ol class="wpl-timeline">
      {props.items.map((item) => (
        <li class="wpl-timeline-item">
          <div>
            <p class="wpl-timeline-title">{item.title}</p>
            <p class="wpl-timeline-meta">
              <time datetime={item.dateTime}>{item.time}</time>
              {item.meta ? ` · ${item.meta}` : null}
            </p>
          </div>
        </li>
      ))}
    </ol>
  );
}

export interface TreeNode {
  id: string;
  label: string;
  children?: TreeNode[];
}

export function TreeView(props: { nodes: TreeNode[]; label?: string; onSelect?: (id: string) => void }) {
  const [expanded, setExpanded] = createSignal<string[]>([]);
  const [selected, setSelected] = createSignal<string | null>(null);

  function toggle(id: string) {
    setExpanded((current) => (current.includes(id) ? current.filter((item) => item !== id) : [...current, id]));
  }

  return (
    <ul class="wpl-tree" role="tree" aria-label={props.label ?? 'Tree'}>
      {props.nodes.map((node) => (
        <TreeNodeView
          node={node}
          expanded={expanded()}
          selected={selected()}
          onToggle={toggle}
          onSelect={(id) => {
            setSelected(id);
            props.onSelect?.(id);
          }}
        />
      ))}
    </ul>
  );
}

function TreeNodeView(props: {
  node: TreeNode;
  expanded: string[];
  selected: string | null;
  onToggle: (id: string) => void;
  onSelect: (id: string) => void;
}) {
  const isOpen = () => props.expanded.includes(props.node.id);
  const hasChildren = () => Boolean(props.node.children?.length);
  return (
    <li class="wpl-tree-item" role="none">
      <button
        type="button"
        role="treeitem"
        class="wpl-tree-row"
        aria-expanded={hasChildren() ? isOpen() : undefined}
        aria-selected={props.selected === props.node.id}
        onClick={() => {
          props.onSelect(props.node.id);
          if (hasChildren()) props.onToggle(props.node.id);
        }}
        onKeyDown={(event) => {
          if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
            event.preventDefault();
            if (hasChildren()) props.onToggle(props.node.id);
          }
        }}
      >
        {hasChildren() ? <Icon name={isOpen() ? 'chevronDown' : 'chevronRight'} /> : <span style={{ 'inline-size': '1.1em' }} />}
        {props.node.label}
      </button>
      {hasChildren() && isOpen() ? (
        <ul class="wpl-tree-children" role="group">
          {props.node.children?.map((child) => (
            <TreeNodeView node={child} expanded={props.expanded} selected={props.selected} onToggle={props.onToggle} onSelect={props.onSelect} />
          ))}
        </ul>
      ) : null}
    </li>
  );
}

export interface ChartPoint {
  label: string;
  value: number;
}

export function ChartContainer(props: { title: string; data: ChartPoint[]; description?: string }) {
  const { locale } = useWhitePlumeria();
  const invalid = () => props.data.some((point) => !Number.isFinite(point.value) || point.value < 0);
  const max = () => Math.max(1, ...props.data.map((point) => point.value));
  return (
    <figure class="wpl-chart">
      <figcaption class="wpl-card-title" style={{ 'font-size': 'var(--wpl-font-size-lg)' }}>
        {props.title}
      </figcaption>
      {props.description ? <p class="wpl-muted">{props.description}</p> : null}
      {invalid() ? (
        <p class="wpl-field-error" role="alert">
          ChartContainer accepts finite, non-negative values only.
        </p>
      ) : (
        <div aria-hidden="true">
          {props.data.map((point) => (
            <div class="wpl-chart-bar">
              <span>{point.label}</span>
              <span class="wpl-chart-track">
                <span class="wpl-chart-fill" style={{ 'inline-size': `${(point.value / max()) * 100}%` }} />
              </span>
              <span>{formatNumber(point.value, locale())}</span>
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
            <tr>
              <th scope="row">{point.label}</th>
              <td>{formatNumber(point.value, locale())}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </figure>
  );
}
