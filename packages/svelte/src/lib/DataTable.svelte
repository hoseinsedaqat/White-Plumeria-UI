<script lang="ts">
  import { formatNumber, queryTable, toggleSort, type ColumnSpec } from '@white-plumeria/core';
  import EmptyState from './EmptyState.svelte';
  import Pagination from './Pagination.svelte';
  import SearchInput from './SearchInput.svelte';
  import { useWhitePlumeria } from './context.svelte.ts';

  interface Column {
    id: string;
    header: string;
    accessor: (row: Record<string, unknown>) => string;
    text: (row: Record<string, unknown>) => string;
    sortValue?: (row: Record<string, unknown>) => string | number;
  }

  let {
    caption,
    columns,
    rows,
    pageSize = 8,
    onsortchange,
  }: {
    caption: string;
    columns: Column[];
    rows: Record<string, unknown>[];
    pageSize?: number;
    onsortchange?: (sort: { sortId?: string; sortDirection: 'asc' | 'desc' }) => void;
  } = $props();

  const wpl = useWhitePlumeria();
  let filter = $state('');
  let sortId = $state<string | undefined>(undefined);
  let sortDirection = $state<'asc' | 'desc'>('asc');
  let page = $state(1);
  const result = $derived.by(() => {
    const specs: ColumnSpec<Record<string, unknown>>[] = columns.map((column) => ({
      id: column.id,
      header: column.header,
      text: column.text,
      sortValue: column.sortValue,
    }));
    return queryTable(rows, specs, { filter, sortId, sortDirection, page, pageSize });
  });
</script>

<div class="wpl-data-table">
  <div class="wpl-table-toolbar">
    <SearchInput label={wpl.t('search')} bind:value={filter} />
    <label class="wpl-sort-field">
      <span class="wpl-sr-only">{wpl.t('sort')}</span>
      <select
        class="wpl-select"
        value={sortId ?? ''}
        onchange={(event) => {
          sortId = (event.currentTarget as HTMLSelectElement).value || undefined;
          sortDirection = 'asc';
          onsortchange?.({ sortId, sortDirection });
        }}
      >
        <option value="">{wpl.t('sort')}</option>
        {#each columns as column (column.id)}
          <option value={column.id}>{column.header}</option>
        {/each}
      </select>
    </label>
    <span class="wpl-muted">{formatNumber(result.total, wpl.preferences.locale)} {wpl.t('rows')}</span>
  </div>
  <div class="wpl-table-wrap">
    <table class="wpl-table">
      <caption>{caption}</caption>
      <thead>
        <tr>
          {#each columns as column (column.id)}
            <th scope="col" aria-sort={sortId === column.id ? (sortDirection === 'asc' ? 'ascending' : 'descending') : 'none'}>
              <button
                type="button"
                class="wpl-sort"
                onclick={() => {
                  const next = toggleSort({ sortId, sortDirection }, column.id);
                  sortId = next.sortId;
                  sortDirection = next.sortDirection;
                  onsortchange?.(next);
                }}
              >
                {column.header}
                {#if sortId === column.id}<span class="wpl-sort-mark">{sortDirection === 'asc' ? '↑' : '↓'}</span>{/if}
              </button>
            </th>
          {/each}
        </tr>
      </thead>
      <tbody>
        {#if result.rows.length === 0}
          <tr><td colspan={columns.length}><EmptyState title={wpl.t('empty')} description={wpl.t('noResults')} /></td></tr>
        {:else}
          {#each result.rows as row, index (index)}
            <tr>
              {#each columns as column (column.id)}
                <td data-label={column.header}>{column.accessor(row)}</td>
              {/each}
            </tr>
          {/each}
        {/if}
      </tbody>
    </table>
  </div>
  <Pagination bind:page pageCount={result.pageCount} />
</div>
