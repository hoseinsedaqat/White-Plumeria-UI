import { formatNumber, queryTable, toggleSort, type ColumnSpec } from '@white-plumeria/core';
import { computed, defineComponent, h, ref, type PropType } from 'vue';
import { Icon } from './icon.ts';
import { useWhitePlumeria } from './provider.ts';
import { EmptyState } from './display.ts';
import { SearchInput } from './form.ts';

export interface DataColumn<T> {
  id: string;
  header: string;
  accessor: (row: T) => string;
  text: (row: T) => string;
  sortValue?: (row: T) => string | number;
}

export const Table = defineComponent({
  name: 'Table',
  props: { caption: { type: String, required: true } },
  setup(props, { slots }) {
    return () => h('div', { class: 'wpl-table-wrap' }, [h('table', { class: 'wpl-table' }, [h('caption', props.caption), slots.default?.()])]);
  },
});

export const DataTable = defineComponent({
  name: 'DataTable',
  props: {
    caption: { type: String, required: true },
    columns: { type: Array as PropType<DataColumn<Record<string, unknown>>[]>, required: true },
    rows: { type: Array as PropType<Record<string, unknown>[]>, required: true },
    pageSize: { type: Number, default: 8 },
    filterable: { type: Boolean, default: true },
  },
  emits: ['sort-change'],
  setup(props, { emit }) {
    const { t, locale } = useWhitePlumeria();
    const filter = ref('');
    const sortId = ref<string | undefined>();
    const sortDirection = ref<'asc' | 'desc'>('asc');
    const page = ref(1);
    const result = computed(() => {
      const specs: ColumnSpec<Record<string, unknown>>[] = props.columns.map((column) => ({
        id: column.id,
        header: column.header,
        text: column.text,
        sortValue: column.sortValue,
      }));
      return queryTable(props.rows, specs, {
        filter: filter.value,
        sortId: sortId.value,
        sortDirection: sortDirection.value,
        page: page.value,
        pageSize: props.pageSize,
      });
    });
    function applySort(next: { sortId?: string; sortDirection: 'asc' | 'desc' }) {
      sortId.value = next.sortId;
      sortDirection.value = next.sortDirection;
      emit('sort-change', next);
    }
    return () =>
      h('div', { class: 'wpl-data-table' }, [
        props.filterable
          ? h('div', { class: 'wpl-table-toolbar' }, [
              h(SearchInput, {
                label: t('search'),
                modelValue: filter.value,
                'onUpdate:modelValue': (value: string) => {
                  filter.value = value;
                  page.value = 1;
                },
              }),
              h('label', { class: 'wpl-sort-field' }, [
                h('span', { class: 'wpl-sr-only' }, t('sort')),
                h(
                  'select',
                  {
                    class: 'wpl-select',
                    value: sortId.value ?? '',
                    onChange: (event: Event) =>
                      applySort({ sortId: (event.target as HTMLSelectElement).value || undefined, sortDirection: 'asc' }),
                  },
                  [
                    h('option', { value: '' }, t('sort')),
                    ...props.columns.map((column) => h('option', { key: column.id, value: column.id }, column.header)),
                  ],
                ),
              ]),
              h('span', { class: 'wpl-muted' }, `${formatNumber(result.value.total, locale.value)} ${t('rows')}`),
            ])
          : null,
        h('div', { class: 'wpl-table-wrap' }, [
          h('table', { class: 'wpl-table' }, [
            h('caption', props.caption),
            h('thead', [
              h(
                'tr',
                props.columns.map((column) => {
                  const active = sortId.value === column.id;
                  return h('th', { key: column.id, scope: 'col', 'aria-sort': active ? (sortDirection.value === 'asc' ? 'ascending' : 'descending') : 'none' }, [
                    h(
                      'button',
                      {
                        type: 'button',
                        class: 'wpl-sort',
                        onClick: () => applySort(toggleSort({ sortId: sortId.value, sortDirection: sortDirection.value }, column.id)),
                      },
                      [
                        column.header,
                        active ? h('span', { class: 'wpl-sort-mark' }, [h(Icon, { name: sortDirection.value === 'asc' ? 'arrowUp' : 'arrowDown' })]) : null,
                        h('span', { class: 'wpl-sr-only' }, t('sort')),
                      ],
                    ),
                  ]);
                }),
              ),
            ]),
            h(
              'tbody',
              result.value.rows.length === 0
                ? [h('tr', [h('td', { colspan: props.columns.length }, [h(EmptyState, { title: t('empty'), description: t('noResults') })])])]
                : result.value.rows.map((row, index) =>
                    h(
                      'tr',
                      { key: index },
                      props.columns.map((column) => h('td', { key: column.id, 'data-label': column.header }, column.accessor(row))),
                    ),
                  ),
            ),
          ]),
        ]),
        h('div', { class: 'wpl-flex wpl-flex-between' }, [
          h('span', { class: 'wpl-muted' }, `${t('page')} ${formatNumber(result.value.page, locale.value)} ${t('of')} ${formatNumber(result.value.pageCount, locale.value)}`),
          h(Pagination, {
            page: result.value.page,
            pageCount: result.value.pageCount,
            onPage: (next: number) => (page.value = next),
          }),
        ]),
      ]);
  },
});

export const Pagination = defineComponent({
  name: 'Pagination',
  props: {
    page: { type: Number, required: true },
    pageCount: { type: Number, required: true },
    label: { type: String, default: '' },
  },
  emits: ['page'],
  setup(props, { emit }) {
    const { t } = useWhitePlumeria();
    return () =>
      h('nav', { class: 'wpl-pagination', 'aria-label': props.label || t('pagination') }, [
        h('button', { type: 'button', class: 'wpl-page', disabled: props.page <= 1, onClick: () => emit('page', props.page - 1) }, [
          h(Icon, { name: 'chevronLeft' }),
          h('span', { class: 'wpl-sr-only' }, t('previous')),
        ]),
        h('span', `${t('page')} ${props.page}`),
        h('button', { type: 'button', class: 'wpl-page', disabled: props.page >= props.pageCount, onClick: () => emit('page', props.page + 1) }, [
          h(Icon, { name: 'chevronRight' }),
          h('span', { class: 'wpl-sr-only' }, t('next')),
        ]),
      ]);
  },
});

export const Breadcrumb = defineComponent({
  name: 'Breadcrumb',
  props: { items: { type: Array as PropType<Array<{ href?: string; label: string }>>, required: true } },
  setup(props) {
    const { t } = useWhitePlumeria();
    return () =>
      h('nav', { class: 'wpl-breadcrumb', 'aria-label': t('breadcrumb') }, [
        h(
          'ol',
          props.items.map((item, index) => {
            const last = index === props.items.length - 1;
            return h('li', { key: `${item.label}-${index}` }, [
              index > 0 ? h(Icon, { name: 'chevronRight' }) : null,
              last || !item.href ? h('span', { 'aria-current': last ? 'page' : undefined }, item.label) : h('a', { class: 'wpl-link', href: item.href }, item.label),
            ]);
          }),
        ),
      ]);
  },
});

export const List = defineComponent({
  name: 'List',
  props: {
    items: { type: Array as PropType<Array<{ id: string; title: string; description?: string; meta?: string }>>, required: true },
  },
  setup(props) {
    return () =>
      h(
        'ul',
        { class: 'wpl-list' },
        props.items.map((item) =>
          h('li', { key: item.id, class: 'wpl-list-item' }, [
            h('div', [h('p', { class: 'wpl-timeline-title' }, item.title), item.description ? h('p', { class: 'wpl-timeline-body' }, item.description) : null]),
            item.meta ? h('span', { class: 'wpl-muted' }, item.meta) : null,
          ]),
        ),
      );
  },
});

export const Timeline = defineComponent({
  name: 'Timeline',
  props: {
    items: {
      type: Array as PropType<Array<{ id: string; title: string; time: string; dateTime?: string; meta?: string }>>,
      required: true,
    },
  },
  setup(props) {
    return () =>
      h(
        'ol',
        { class: 'wpl-timeline' },
        props.items.map((item) =>
          h('li', { key: item.id, class: 'wpl-timeline-item' }, [
            h('p', { class: 'wpl-timeline-title' }, item.title),
            h('p', { class: 'wpl-timeline-meta' }, [h('time', { datetime: item.dateTime }, item.time), item.meta ? ` · ${item.meta}` : null]),
          ]),
        ),
      );
  },
});

export interface TreeNode {
  id: string;
  label: string;
  children?: TreeNode[];
}

export const TreeView = defineComponent({
  name: 'TreeView',
  props: {
    label: { type: String, required: true },
    nodes: { type: Array as PropType<TreeNode[]>, required: true },
  },
  emits: ['select'],
  setup(props, { emit }) {
    const expanded = ref<string[]>([]);
    const selected = ref<string | null>(null);
    function renderNodes(nodes: TreeNode[]): ReturnType<typeof h>[] {
      return nodes.map((node) => {
        const open = expanded.value.includes(node.id);
        return h('li', { key: node.id, role: 'treeitem', 'aria-expanded': node.children ? open : undefined, 'aria-selected': selected.value === node.id }, [
          h(
            'button',
            {
              type: 'button',
              class: 'wpl-tree-item',
              onClick: () => {
                selected.value = node.id;
                emit('select', node.id);
                if (node.children) {
                  expanded.value = open ? expanded.value.filter((id) => id !== node.id) : [...expanded.value, node.id];
                }
              },
            },
            node.label,
          ),
          node.children && open ? h('ul', { role: 'group' }, renderNodes(node.children)) : null,
        ]);
      });
    }
    return () => h('ul', { class: 'wpl-tree', role: 'tree', 'aria-label': props.label }, renderNodes(props.nodes));
  },
});

export const ChartContainer = defineComponent({
  name: 'ChartContainer',
  props: {
    title: { type: String, required: true },
    description: { type: String, default: '' },
    data: { type: Array as PropType<Array<{ label: string; value: number }>>, required: true },
  },
  setup(props) {
    const { locale } = useWhitePlumeria();
    return () => {
      const invalid = props.data.some((point) => !Number.isFinite(point.value) || point.value < 0);
      const max = Math.max(1, ...props.data.map((point) => point.value));
      return h('figure', { class: 'wpl-chart' }, [
        h('figcaption', { class: 'wpl-card-title' }, props.title),
        props.description ? h('p', { class: 'wpl-muted' }, props.description) : null,
        invalid
          ? h('p', { class: 'wpl-field-error', role: 'alert' }, 'ChartContainer accepts finite, non-negative values only.')
          : h(
              'div',
              { 'aria-hidden': 'true' },
              props.data.map((point) =>
                h('div', { class: 'wpl-chart-bar', key: point.label }, [
                  h('span', point.label),
                  h('span', { class: 'wpl-chart-fill', style: { inlineSize: `${(point.value / max) * 100}%` } }),
                ]),
              ),
            ),
        h(
          'table',
          { class: 'wpl-table' },
          [
            h('caption', props.title),
            h('tbody', props.data.map((point) => h('tr', { key: point.label }, [h('th', { scope: 'row' }, point.label), h('td', formatNumber(point.value, locale.value))]))),
          ],
        ),
      ]);
    };
  },
});
