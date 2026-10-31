import {
  formatNumber,
  queryTable,
  readingDirection,
  toggleSort,
  type ColumnSpec,
} from '@white-plumeria/core';
import { useMemo, useState, type ReactNode } from 'react';
import { EmptyState } from './display.tsx';
import { SearchInput } from './form.tsx';
import { Icon } from './icon.tsx';
import { useWhitePlumeria } from './provider.tsx';

export function Table({
  caption,
  children,
  className,
}: {
  caption: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={className ? `wpl-table-wrap ${className}` : 'wpl-table-wrap'}>
      <table className="wpl-table">
        <caption>{caption}</caption>
        {children}
      </table>
    </div>
  );
}

export interface DataColumn<T> {
  id: string;
  header: string;
  accessor: (row: T) => ReactNode;
  text: (row: T) => string;
  sortValue?: (row: T) => string | number;
}

export function DataTable<T>({
  caption,
  columns,
  rows,
  pageSize = 8,
  filterable = true,
  defaultSortId,
  defaultSortDirection = 'asc',
  onSortChange,
}: {
  caption: string;
  columns: DataColumn<T>[];
  rows: T[];
  pageSize?: number;
  filterable?: boolean;
  defaultSortId?: string;
  defaultSortDirection?: 'asc' | 'desc';
  onSortChange?: (sort: { sortId?: string; sortDirection: 'asc' | 'desc' }) => void;
}) {
  const { t, locale } = useWhitePlumeria();
  const [filter, setFilter] = useState('');
  const [sortId, setSortId] = useState<string | undefined>(defaultSortId);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>(defaultSortDirection);
  const [page, setPage] = useState(1);
  const specs: ColumnSpec<T>[] = columns.map((column) => ({
    id: column.id,
    header: column.header,
    text: column.text,
    sortValue: column.sortValue,
  }));
  const result = useMemo(
    () => queryTable(rows, specs, { filter, sortId, sortDirection, page, pageSize }),
    [columns, filter, page, pageSize, rows, sortDirection, sortId, specs],
  );

  function applySort(next: { sortId?: string; sortDirection: 'asc' | 'desc' }) {
    setSortId(next.sortId);
    setSortDirection(next.sortDirection);
    onSortChange?.(next);
  }

  return (
    <div className="wpl-data-table">
      {filterable ? (
        <div className="wpl-table-toolbar">
          <SearchInput
            label={t('search')}
            value={filter}
            onValueChange={(value) => {
              setFilter(value);
              setPage(1);
            }}
          />
          <label className="wpl-sort-field">
            <span className="wpl-sr-only">{t('sort')}</span>
            <select
              className="wpl-select"
              value={sortId ?? ''}
              onChange={(event) => applySort({ sortId: event.currentTarget.value || undefined, sortDirection: 'asc' })}
            >
              <option value="">{t('sort')}</option>
              {columns.map((column) => (
                <option key={column.id} value={column.id}>
                  {column.header}
                </option>
              ))}
            </select>
          </label>
          <span className="wpl-muted">
            {formatNumber(result.total, locale)} {t('rows')}
          </span>
        </div>
      ) : null}
      <div className="wpl-table-wrap">
        <table className="wpl-table">
          <caption>{caption}</caption>
          <thead>
            <tr>
              {columns.map((column) => {
                const active = sortId === column.id;
                return (
                  <th key={column.id} scope="col" aria-sort={active ? (sortDirection === 'asc' ? 'ascending' : 'descending') : 'none'}>
                    <button
                      type="button"
                      className="wpl-sort"
                      onClick={() => applySort(toggleSort({ sortId, sortDirection }, column.id))}
                    >
                      {column.header}
                      {active ? (
                        <span className="wpl-sort-mark">
                          <Icon name={sortDirection === 'asc' ? 'arrowUp' : 'arrowDown'} />
                        </span>
                      ) : null}
                      <span className="wpl-sr-only">{t('sort')}</span>
                    </button>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {result.rows.length === 0 ? (
              <tr>
                <td colSpan={columns.length}>
                  <EmptyState title={t('empty')} description={t('noResults')} />
                </td>
              </tr>
            ) : (
              result.rows.map((row, index) => (
                <tr key={index}>
                  {columns.map((column) => (
                    <td key={column.id} data-label={column.header}>
                      {column.accessor(row)}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <div className="wpl-flex wpl-flex-between" style={{ marginBlockStart: '0.75rem' }}>
        <span className="wpl-muted">
          {t('page')} {formatNumber(result.page, locale)} {t('of')} {formatNumber(result.pageCount, locale)}
        </span>
        <Pagination page={result.page} pageCount={result.pageCount} onPageChange={setPage} />
      </div>
    </div>
  );
}

export function Pagination({
  page,
  pageCount,
  onPageChange,
  label,
}: {
  page: number;
  pageCount: number;
  onPageChange: (page: number) => void;
  label?: string;
}) {
  const { t } = useWhitePlumeria();
  const pages = Array.from({ length: pageCount }, (_, index) => index + 1).filter(
    (item) => item === 1 || item === pageCount || Math.abs(item - page) <= 1,
  );
  return (
    <nav className="wpl-pagination" aria-label={label ?? t('pagination')}>
      <button type="button" className="wpl-page" disabled={page <= 1} onClick={() => onPageChange(page - 1)}>
        <Icon name="chevronLeft" />
        <span className="wpl-sr-only">{t('previous')}</span>
      </button>
      {pages.map((item, index) => {
        const previous = pages[index - 1];
        const gap = previous !== undefined && item - previous > 1;
        return (
          <span key={item} style={{ display: 'contents' }}>
            {gap ? <span aria-hidden="true">…</span> : null}
            <button
              type="button"
              className="wpl-page"
              aria-current={item === page ? 'page' : undefined}
              onClick={() => onPageChange(item)}
            >
              {item}
            </button>
          </span>
        );
      })}
      <button type="button" className="wpl-page" disabled={page >= pageCount} onClick={() => onPageChange(page + 1)}>
        <Icon name="chevronRight" />
        <span className="wpl-sr-only">{t('next')}</span>
      </button>
    </nav>
  );
}

export function Breadcrumb({
  items,
}: {
  items: Array<{ href?: string; label: string }>;
}) {
  const { t } = useWhitePlumeria();
  return (
    <nav className="wpl-breadcrumb" aria-label={t('breadcrumb')}>
      <ol>
        {items.map((item, index) => {
          const last = index === items.length - 1;
          return (
            <li key={`${item.label}-${index}`}>
              {index > 0 ? <Icon name="chevronRight" /> : null}
              {last || !item.href ? (
                <span aria-current={last ? 'page' : undefined}>{item.label}</span>
              ) : (
                <a className="wpl-link" href={item.href}>
                  {item.label}
                </a>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

export function List({
  items,
}: {
  items: Array<{ id: string; title: string; description?: string; meta?: string }>;
}) {
  return (
    <ul className="wpl-list">
      {items.map((item) => (
        <li key={item.id} className="wpl-list-item">
          <div>
            <p className="wpl-timeline-title">{item.title}</p>
            {item.description ? <p className="wpl-timeline-body">{item.description}</p> : null}
          </div>
          {item.meta ? <span className="wpl-muted">{item.meta}</span> : null}
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

export function Timeline({ items }: { items: TimelineItem[] }) {
  return (
    <ol className="wpl-timeline">
      {items.map((item) => (
        <li key={item.id} className="wpl-timeline-item">
          <div>
            <p className="wpl-timeline-title">{item.title}</p>
            <p className="wpl-timeline-meta">
              <time dateTime={item.dateTime}>{item.time}</time>
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

export function TreeView({
  nodes,
  label,
  onSelect,
  defaultExpanded = [],
}: {
  nodes: TreeNode[];
  label: string;
  onSelect?: (id: string) => void;
  defaultExpanded?: string[];
}) {
  const [expanded, setExpanded] = useState<string[]>(defaultExpanded);
  const [selected, setSelected] = useState<string | null>(null);

  function toggle(id: string) {
    setExpanded((current) => (current.includes(id) ? current.filter((item) => item !== id) : [...current, id]));
  }

  return (
    <ul className="wpl-tree" role="tree" aria-label={label}>
      {nodes.map((node) => (
        <TreeNodeView
          key={node.id}
          node={node}
          expanded={expanded}
          selected={selected}
          onToggle={toggle}
          onSelect={(id) => {
            setSelected(id);
            onSelect?.(id);
          }}
        />
      ))}
    </ul>
  );
}

function TreeNodeView({
  node,
  expanded,
  selected,
  onToggle,
  onSelect,
}: {
  node: TreeNode;
  expanded: string[];
  selected: string | null;
  onToggle: (id: string) => void;
  onSelect: (id: string) => void;
}) {
  const isOpen = expanded.includes(node.id);
  const hasChildren = Boolean(node.children?.length);
  return (
    <li className="wpl-tree-item" role="none">
      <button
        type="button"
        role="treeitem"
        className="wpl-tree-row"
        aria-expanded={hasChildren ? isOpen : undefined}
        aria-selected={selected === node.id}
        onClick={() => {
          onSelect(node.id);
          if (hasChildren) onToggle(node.id);
        }}
        onKeyDown={(event) => {
          const direction = readingDirection(event.currentTarget);
          const openKey = direction === 'rtl' ? 'ArrowLeft' : 'ArrowRight';
          const closeKey = direction === 'rtl' ? 'ArrowRight' : 'ArrowLeft';
          if (event.key !== openKey && event.key !== closeKey) return;
          if (!hasChildren) return;
          event.preventDefault();
          if (event.key === openKey && !isOpen) onToggle(node.id);
          if (event.key === closeKey && isOpen) onToggle(node.id);
        }}
      >
        {hasChildren ? <Icon name={isOpen ? 'chevronDown' : 'chevronRight'} /> : <span className="wpl-tree-spacer" aria-hidden="true" />}
        {node.label}
      </button>
      {hasChildren && isOpen ? (
        <ul className="wpl-tree-children" role="group">
          {node.children?.map((child) => (
            <TreeNodeView
              key={child.id}
              node={child}
              expanded={expanded}
              selected={selected}
              onToggle={onToggle}
              onSelect={onSelect}
            />
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

export function ChartContainer({
  title,
  data,
  description,
}: {
  title: string;
  data: ChartPoint[];
  description?: string;
}) {
  const { locale } = useWhitePlumeria();
  const invalid = data.some((point) => !Number.isFinite(point.value) || point.value < 0);
  const max = Math.max(1, ...data.map((point) => point.value));
  return (
    <figure className="wpl-chart">
      <figcaption className="wpl-card-title" style={{ fontSize: 'var(--wpl-font-size-lg)' }}>
        {title}
      </figcaption>
      {description ? <p className="wpl-muted">{description}</p> : null}
      {invalid ? (
        <p className="wpl-field-error" role="alert">
          ChartContainer accepts finite, non-negative values only.
        </p>
      ) : (
        <div aria-hidden="true">
          {data.map((point) => (
            <div className="wpl-chart-bar" key={point.label}>
              <span>{point.label}</span>
              <span className="wpl-chart-track">
                <span className="wpl-chart-fill" style={{ inlineSize: `${(point.value / max) * 100}%` }} />
              </span>
              <span>{formatNumber(point.value, locale)}</span>
            </div>
          ))}
        </div>
      )}
      <table className="wpl-table wpl-chart-table">
        <caption className="wpl-sr-only">{title}</caption>
        <thead>
          <tr>
            <th scope="col">Label</th>
            <th scope="col">Value</th>
          </tr>
        </thead>
        <tbody>
          {data.map((point) => (
            <tr key={point.label}>
              <th scope="row">{point.label}</th>
              <td>{formatNumber(point.value, locale)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </figure>
  );
}
