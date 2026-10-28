import { describe, expect, it } from 'vitest';
import { queryTable, toggleSort } from './table.ts';

const rows = [
  { id: 'b', amount: 20 },
  { id: 'a', amount: 5 },
  { id: 'c', amount: 20 },
];

describe('table query', () => {
  it('filters, sorts, and pages without mutating the source', () => {
    const original = rows.map((row) => ({ ...row }));
    const result = queryTable(rows, [{ id: 'amount', header: 'Amount', text: (row) => row.id, sortValue: (row) => row.amount }], {
      sortId: 'amount',
      sortDirection: 'asc',
      page: 1,
      pageSize: 2,
    });
    expect(result.total).toBe(3);
    expect(result.rows.map((row) => row.id)).toEqual(['a', 'b']);
    expect(result.pageCount).toBe(2);
    expect(rows).toEqual(original);
    expect(toggleSort({ sortId: 'amount', sortDirection: 'asc' }, 'amount').sortDirection).toBe('desc');
  });
});
