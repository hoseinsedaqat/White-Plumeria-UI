export interface ColumnSpec<T> {
  id: string;
  header: string;
  text: (row: T) => string;
  sortValue?: (row: T) => string | number;
}

export interface TableQuery {
  sortId?: string;
  sortDirection?: 'asc' | 'desc';
  filter?: string;
  page?: number;
  pageSize?: number;
}

export interface TableResult<T> {
  rows: T[];
  total: number;
  page: number;
  pageCount: number;
  pageSize: number;
}

export function queryTable<T>(
  rows: readonly T[],
  columns: readonly ColumnSpec<T>[],
  query: TableQuery = {},
): TableResult<T> {
  const filter = query.filter?.trim().toLocaleLowerCase() ?? '';
  let next = rows.filter((row) => {
    if (!filter) return true;
    return columns.some((column) => column.text(row).toLocaleLowerCase().includes(filter));
  });
  if (query.sortId) {
    const column = columns.find((item) => item.id === query.sortId);
    if (column) {
      const valueOf = column.sortValue ?? column.text;
      const direction = query.sortDirection === 'desc' ? -1 : 1;
      next = [...next].sort((left, right) => {
        const a = valueOf(left);
        const b = valueOf(right);
        if (typeof a === 'number' && typeof b === 'number') return (a - b) * direction;
        return String(a).localeCompare(String(b), undefined, { numeric: true }) * direction;
      });
    }
  }
  const total = next.length;
  const pageSize = Math.max(1, query.pageSize ?? (total || 1));
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const page = Math.min(Math.max(1, query.page ?? 1), pageCount);
  const start = (page - 1) * pageSize;
  return {
    rows: next.slice(start, start + pageSize),
    total,
    page,
    pageCount,
    pageSize,
  };
}

export function toggleSort(
  current: { sortId?: string; sortDirection?: 'asc' | 'desc' },
  id: string,
): { sortId: string; sortDirection: 'asc' | 'desc' } {
  if (current.sortId !== id) return { sortId: id, sortDirection: 'asc' };
  if (current.sortDirection === 'asc') return { sortId: id, sortDirection: 'desc' };
  return { sortId: id, sortDirection: 'asc' };
}
