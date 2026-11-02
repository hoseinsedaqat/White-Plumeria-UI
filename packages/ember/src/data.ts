import {
  addMonths,
  buildMonthGrid,
  calendarDayClass,
  chartFigureHtml,
  createId,
  formatDate,
  formatNumber,
  message,
  orderDateRange,
  orderDateTimeRange,
  parseIsoDate,
  parseTimeValue,
  queryTable,
  toIsoDate,
  toggleSort,
  treeExpandAction,
  type CalendarSystem,
  type ColumnSpec,
  type TableQuery,
  iconMarkup,
  iconPaths,
} from '@white-plumeria/core';
import { bubble, flag, glimmer, list, localeOf, num, rowId, str, type Host } from './runtime.ts';

interface DataColumn {
  id: string;
  header: string;
  text?: (row: Record<string, unknown>) => string;
  sortValue?: (row: Record<string, unknown>) => string | number;
}

interface Row {
  [key: string]: unknown;
}

function cellText(column: DataColumn, row: Row): string {
  if (typeof column.text === 'function') return column.text(row);
  const value = row[column.id];
  return value == null ? '' : String(value);
}

function calendarOf(value: unknown): CalendarSystem {
  return value === 'persian' ? 'persian' : 'gregory';
}

export const Table = glimmer(
  `<div class="wpl-table-wrap"><table class="wpl-table">{{#if @caption}}<caption>{{@caption}}</caption>{{/if}}<thead><tr>{{#each this.columns as |column|}}<th scope="col">{{column}}</th>{{/each}}</tr></thead><tbody>{{#each this.rows as |row|}}<tr>{{#each row.cells as |cell|}}<td>{{cell}}</td>{{/each}}</tr>{{/each}}</tbody></table></div>`,
  {
    getters: {
      columns: (host) => list<string>(host.args.columns),
      rows(this: Host) {
        const columns = list<string>(this.args.columns);
        return list<Row>(this.args.rows).map((row) => ({
          cells: columns.map((column) => {
            const value = row[column];
            return value == null ? '' : String(value);
          }),
        }));
      },
    },
  },
);

export const DataTable = glimmer(
  `<div class="wpl-data-table"><div class="wpl-table-toolbar"><span class="wpl-muted">{{this.summary}}</span></div><div class="wpl-table-wrap"><table class="wpl-table"><caption>{{this.caption}}</caption><thead><tr>{{#each this.head as |column|}}<th scope="col" aria-sort={{column.sort}}><button type="button" class="wpl-sort" {{on "click" (fn this.sort column.id)}}>{{column.header}}{{#if column.sorted}}<span class="wpl-sort-mark"><svg class="wpl-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d={{column.sortPath}}></path></svg></span>{{/if}}</button></th>{{/each}}</tr></thead><tbody>{{#each this.body as |row|}}<tr {{on "click" (fn this.select row.id)}}>{{#each row.cells as |cell|}}<td>{{cell}}</td>{{/each}}</tr>{{/each}}</tbody></table></div></div>`,
  {
    state: (args) => ({
      sortId: str(args.sortId),
      sortDirection: args.sortDirection === 'desc' ? 'desc' : 'asc',
    }),
    getters: {
      caption: (host) => str(host.args.caption, 'Table'),
      columns: (host) => list<DataColumn>(host.args.columns),
      summary(this: Host) {
        const total = this.result.total;
        return `${formatNumber(total, localeOf(typeof document === 'undefined' ? null : document.body))} ${message(localeOf(typeof document === 'undefined' ? null : document.body), 'rows')}`;
      },
      query(this: Host): TableQuery {
        return {
          sortId: str(this.state.sortId) || undefined,
          sortDirection: this.state.sortDirection === 'desc' ? 'desc' : 'asc',
          filter: str(this.args.filter),
          page: num(this.args.page, 1),
          pageSize: num(this.args.pageSize, 0) || undefined,
        };
      },
      result(this: Host) {
        const columns = list<DataColumn>(this.args.columns);
        const specs: ColumnSpec<Row>[] = columns.map((column) => ({
          id: column.id,
          header: column.header,
          text: (row) => cellText(column, row),
          sortValue: column.sortValue,
        }));
        return queryTable(list<Row>(this.args.rows), specs, this.query);
      },
      head(this: Host) {
        const sortId = str(this.state.sortId);
        const direction = this.state.sortDirection === 'desc' ? 'desc' : 'asc';
        return list<DataColumn>(this.args.columns).map((column) => ({
          id: column.id,
          header: column.header,
          sort: sortId === column.id ? (direction === 'desc' ? 'descending' : 'ascending') : 'none',
          sorted: sortId === column.id,
          sortPath: iconPaths[direction === 'desc' ? 'arrowDown' : 'arrowUp'],
        }));
      },
      body(this: Host) {
        const columns = list<DataColumn>(this.args.columns);
        return this.result.rows.map((row: Row) => ({
          id: rowId(row),
          cells: columns.map((column) => cellText(column, row)),
        }));
      },
    },
    methods: {
      sort(id, event) {
        const next = toggleSort(
          { sortId: str(this.state.sortId) || undefined, sortDirection: this.state.sortDirection === 'desc' ? 'desc' : 'asc' },
          String(id),
        );
        this.state.sortId = next.sortId;
        this.state.sortDirection = next.sortDirection;
        bubble(event as Event, 'wpl-sort', next);
      },
      select(id, event) {
        bubble(event as Event, 'wpl-select', { id: String(id) });
      },
    },
  },
);

export const Pagination = glimmer(
  `<nav class="wpl-pagination" aria-label={{this.label}}><button type="button" class="wpl-page" disabled={{this.atStart}} {{on "click" this.previous}}>${iconMarkup('chevronLeft')}<span class="wpl-sr-only">{{this.previousLabel}}</span></button>{{#each this.pages as |item|}}{{#if item.gap}}<span aria-hidden="true">…</span>{{/if}}<button type="button" class="wpl-page" {{flagAttr "aria-current" item.current}} {{on "click" (fn this.pick item)}}>{{item.value}}</button>{{/each}}<button type="button" class="wpl-page" disabled={{this.atEnd}} {{on "click" this.next}}>${iconMarkup('chevronRight')}<span class="wpl-sr-only">{{this.nextLabel}}</span></button></nav>`,
  {
    state: (args) => ({ page: num(args.page, 1) }),
    getters: {
      label: () => message(localeOf(typeof document === 'undefined' ? null : document.body), 'pagination'),
      previousLabel: () => message(localeOf(typeof document === 'undefined' ? null : document.body), 'previous'),
      nextLabel: () => message(localeOf(typeof document === 'undefined' ? null : document.body), 'next'),
      page: (host) => num(host.state.page, num(host.args.page, 1)),
      pageCount: (host) => Math.max(1, num(host.args.pageCount, 1)),
      atStart: (host) => num(host.state.page, 1) <= 1,
      atEnd(this: Host) {
        return num(this.state.page, 1) >= Math.max(1, num(this.args.pageCount, 1));
      },
      pages(this: Host) {
        const page = num(this.state.page, num(this.args.page, 1));
        const pageCount = Math.max(1, num(this.args.pageCount, 1));
        const values = Array.from({ length: pageCount }, (_, index) => index + 1).filter(
          (item) => item === 1 || item === pageCount || Math.abs(item - page) <= 1,
        );
        return values.map((value, index) => {
          const previous = values[index - 1];
          return {
            value: String(value),
            current: value === page ? 'page' : null,
            gap: previous !== undefined && value - previous > 1,
          };
        });
      },
    },
    methods: {
      previous(event) {
        const page = Math.max(1, num(this.state.page, 1) - 1);
        this.state.page = page;
        bubble(event as Event, 'wpl-change', { page });
      },
      next(event) {
        const page = Math.min(Math.max(1, num(this.args.pageCount, 1)), num(this.state.page, 1) + 1);
        this.state.page = page;
        bubble(event as Event, 'wpl-change', { page });
      },
      pick(item, event) {
        const page = num((item as { value?: string }).value, 1);
        this.state.page = page;
        bubble(event as Event, 'wpl-change', { page });
      },
    },
  },
);

export const Breadcrumb = glimmer(
  `<nav class="wpl-breadcrumb" aria-label={{this.label}}><ol>{{#each this.items as |item|}}<li>{{#if item.href}}<a href={{item.href}}>{{item.label}}</a>{{else}}<span aria-current="page">{{item.label}}</span>{{/if}}</li>{{/each}}</ol></nav>`,
  {
    getters: {
      label: () => message(localeOf(typeof document === 'undefined' ? null : document.body), 'breadcrumb'),
      items(this: Host) {
        const items = list<{ href?: string; label?: string }>(this.args.items);
        return items.map((item, index) => ({
          label: str(item.label),
          href: index === items.length - 1 ? '' : str(item.href),
        }));
      },
    },
  },
);

export const List = glimmer(
  `<ul class="wpl-list">{{#each this.items as |item|}}<li class="wpl-list-item"><strong>{{item.title}}</strong>{{#if item.description}}<p>{{item.description}}</p>{{/if}}{{#if item.meta}}<span class="wpl-muted">{{item.meta}}</span>{{/if}}</li>{{/each}}</ul>`,
  {
    getters: {
      items: (host) =>
        list<{ id?: string; title?: string; description?: string; meta?: string }>(host.args.items).map((item) => ({
          title: str(item.title, str(item.id)),
          description: str(item.description),
          meta: str(item.meta),
        })),
    },
  },
);

export const TreeView = glimmer(
  `<ul class="wpl-tree" role="tree" aria-label={{this.label}}>{{#each this.nodes as |node|}}<li class="wpl-tree-item" role="none"><button type="button" class="wpl-tree-row" role="treeitem" aria-selected={{node.selected}} {{flagAttr "aria-expanded" node.expanded}} {{on "click" (fn this.pick node)}} {{on "keydown" (fn this.move node)}}>{{#if node.hasChildren}}<svg class={{node.iconClass}} viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d={{node.icon}}></path></svg>{{else}}<span class="wpl-tree-spacer" aria-hidden="true"></span>{{/if}}{{node.label}}</button>{{#if node.open}}<ul class="wpl-tree-children" role="group">{{#each node.children as |child|}}<li class="wpl-tree-item" role="none"><button type="button" class="wpl-tree-row" role="treeitem" aria-selected={{child.selected}} {{on "click" (fn this.pick child)}}><span class="wpl-tree-spacer" aria-hidden="true"></span>{{child.label}}</button></li>{{/each}}</ul>{{/if}}</li>{{/each}}</ul>`,
  {
    state: () => ({ open: [] as string[], selected: '' }),
    getters: {
      label: (host) => str(host.args.label, 'Tree'),
      nodes(this: Host) {
        const open = list<string>(this.state.open);
        const selected = str(this.state.selected);
        return list<{ id?: string; label?: string; children?: Array<{ id?: string; label?: string }> }>(this.args.nodes).map((node) => {
          const id = str(node.id);
          const children = list<{ id?: string; label?: string }>(node.children).map((child) => {
            const childId = str(child.id);
            return { id: childId, label: str(child.label, childId), selected: selected === childId ? 'true' : 'false' };
          });
          const isOpen = children.length > 0 && open.includes(id);
          return {
            id,
            label: str(node.label, id),
            hasChildren: children.length > 0,
            open: isOpen,
            expanded: children.length ? (isOpen ? 'true' : 'false') : null,
            selected: selected === id ? 'true' : 'false',
            icon: iconPaths[isOpen ? 'chevronDown' : 'chevronRight'],
            iconClass: isOpen ? 'wpl-icon' : 'wpl-icon wpl-icon-dir',
            children,
          };
        });
      },
    },
    methods: {
      pick(node, event) {
        const item = node as { id?: string; hasChildren?: boolean };
        const id = str(item.id);
        this.state.selected = id;
        bubble(event as Event, 'wpl-select', { id });
        if (!item.hasChildren) return;
        const open = list<string>(this.state.open);
        this.state.open = open.includes(id) ? open.filter((entry) => entry !== id) : [...open, id];
      },
      move(node, event) {
        const item = node as { id?: string; hasChildren?: boolean; open?: boolean };
        const keyEvent = event as KeyboardEvent;
        if (!item.hasChildren) return;
        const action = treeExpandAction(keyEvent.key, keyEvent.currentTarget instanceof HTMLElement ? keyEvent.currentTarget : null, Boolean(item.open));
        if (!action) return;
        keyEvent.preventDefault();
        if (action === 'stay') return;
        const id = str(item.id);
        const open = list<string>(this.state.open);
        this.state.open = action === 'open' ? [...open, id] : open.filter((entry) => entry !== id);
      },
    },
  },
);

export const StatCard = glimmer(
  `<article class="wpl-stat"><p class="wpl-stat-label">{{this.label}}</p><p class="wpl-stat-value">{{this.value}}</p>{{#if @hint}}<p class="wpl-muted">{{@hint}}</p>{{/if}}</article>`,
  {
    getters: {
      label: (host) => str(host.args.label, 'Stat'),
      value: (host) => str(host.args.value, '0'),
    },
  },
);

export const Timeline = glimmer(
  `<ol class="wpl-timeline">{{#each this.items as |item|}}<li class="wpl-timeline-item"><time datetime={{item.time}}>{{item.time}}</time><strong>{{item.title}}</strong>{{#if item.meta}}<p class="wpl-muted">{{item.meta}}</p>{{/if}}</li>{{/each}}</ol>`,
  {
    getters: {
      items: (host) =>
        list<{ id?: string; title?: string; time?: string; meta?: string }>(host.args.items).map((item) => ({
          title: str(item.title, str(item.id)),
          time: str(item.time),
          meta: str(item.meta),
        })),
    },
  },
);

const calendarChevron = (name: 'chevronLeft' | 'chevronRight') =>
  `<svg class="wpl-icon wpl-icon-dir" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="${iconPaths[name]}"></path></svg>`;

export const Calendar = glimmer(
  `<div class="wpl-calendar"><div class="wpl-calendar-head"><button type="button" class="wpl-btn wpl-btn-ghost wpl-btn-sm" aria-label={{this.previousLabel}} {{on "click" this.previous}}>${calendarChevron('chevronLeft')}</button><strong>{{this.title}}</strong><button type="button" class="wpl-btn wpl-btn-ghost wpl-btn-sm" aria-label={{this.nextLabel}} {{on "click" this.next}}>${calendarChevron('chevronRight')}</button></div><div class="wpl-calendar-grid" role="grid" aria-label={{this.title}}>{{#each this.weekdays as |day|}}<div class="wpl-calendar-weekday" role="columnheader">{{day}}</div>{{/each}}{{#each this.days as |day|}}<button type="button" class={{day.className}} aria-label={{day.aria}} disabled={{day.disabled}} {{on "click" (fn this.pick day.iso)}}>{{day.label}}</button>{{/each}}</div></div>`,
  {
    state: (args) => ({ anchor: str(args.value) || toIsoDate(new Date()), value: str(args.value) }),
    getters: {
      calendar: (host) => calendarOf(host.args.calendar),
      locale: () => localeOf(typeof document === 'undefined' ? null : document.body),
      previousLabel: () => message(localeOf(typeof document === 'undefined' ? null : document.body), 'previous'),
      nextLabel: () => message(localeOf(typeof document === 'undefined' ? null : document.body), 'next'),
      grid(this: Host) {
        const anchor = parseIsoDate(str(this.state.anchor)) ?? new Date();
        return buildMonthGrid({
          anchor,
          calendar: calendarOf(this.args.calendar),
          locale: localeOf(typeof document === 'undefined' ? null : document.body),
          min: parseIsoDate(str(this.args.min)) ?? undefined,
          max: parseIsoDate(str(this.args.max)) ?? undefined,
        });
      },
      title(this: Host) {
        return this.grid.title;
      },
      weekdays(this: Host) {
        return this.grid.weekdays;
      },
      days(this: Host) {
        const selected = parseIsoDate(str(this.state.value));
        return this.grid.cells.map((cell: { date: Date; label: string; disabled?: boolean; inMonth: boolean }) => ({
          iso: toIsoDate(cell.date),
          label: cell.label,
          disabled: cell.disabled,
          aria: formatDate(cell.date, localeOf(typeof document === 'undefined' ? null : document.body), { dateStyle: 'full' }, calendarOf(this.args.calendar)),
          className: calendarDayClass({ inMonth: cell.inMonth, date: cell.date, rangeStart: selected, rangeEnd: selected }),
        }));
      },
    },
    methods: {
      previous() {
        const anchor = parseIsoDate(str(this.state.anchor)) ?? new Date();
        this.state.anchor = toIsoDate(addMonths(anchor, -1, calendarOf(this.args.calendar)));
      },
      next() {
        const anchor = parseIsoDate(str(this.state.anchor)) ?? new Date();
        this.state.anchor = toIsoDate(addMonths(anchor, 1, calendarOf(this.args.calendar)));
      },
      pick(iso, event) {
        this.state.value = String(iso);
        this.state.anchor = String(iso);
        bubble(event as Event, 'wpl-change', { value: String(iso) });
      },
    },
  },
);

export const DatePicker = glimmer(
  `<div class="wpl-date"><label class="wpl-label" for={{this.fieldId}}>{{this.label}}</label><input id={{this.fieldId}} class="wpl-input" value={{this.value}} placeholder="YYYY-MM-DD" {{flagAttr "aria-invalid" this.invalid}} {{flagAttr "aria-describedby" this.describedBy}} {{on "change" this.commit}} />{{#if this.showTime}}<label class="wpl-label" for={{this.timeId}}>{{this.timeLabel}}</label><input id={{this.timeId}} class="wpl-input" type="time" value={{this.time}} data-wpl-edge="time" {{flagAttr "aria-invalid" this.invalid}} {{flagAttr "aria-describedby" this.describedBy}} {{on "change" this.commitTime}} />{{/if}}{{#if this.error}}<p id={{this.errorId}} class="wpl-field-error" role="alert">{{this.error}}</p>{{/if}}<p class="wpl-field-hint">{{this.hint}}</p></div>`,
  {
    state: (args) => ({ value: str(args.value), time: str(args.time), error: '', fieldId: createId('date'), timeId: createId('time') }),
    getters: {
      label: (host) => str(host.args.label, 'Date'),
      fieldId: (host) => str(host.state.fieldId),
      timeId: (host) => str(host.state.timeId),
      value: (host) => str(host.state.value, str(host.args.value)),
      time: (host) => str(host.state.time, str(host.args.time)),
      error: (host) => str(host.state.error),
      invalid: (host) => (str(host.state.error) ? 'true' : ''),
      errorId: (host) => `${str(host.state.fieldId)}-error`,
      describedBy: (host) => (str(host.state.error) ? `${str(host.state.fieldId)}-error` : ''),
      showTime: (host) => flag(host.args.showTime),
      timeLabel: () => message(localeOf(typeof document === 'undefined' ? null : document.body), 'time'),
      hint(this: Host) {
        const date = parseIsoDate(str(this.state.value, str(this.args.value)));
        if (!date) return message(localeOf(typeof document === 'undefined' ? null : document.body), 'chooseDate');
        const label = formatDate(date, localeOf(typeof document === 'undefined' ? null : document.body), { dateStyle: 'medium' }, calendarOf(this.args.calendar));
        return flag(this.args.showTime) && str(this.state.time) ? `${label}, ${str(this.state.time)}` : label;
      },
    },
    methods: {
      commit(event) {
        const value = event instanceof Event && event.target instanceof HTMLInputElement ? event.target.value : '';
        const locale = localeOf(event instanceof Event && event.target instanceof Element ? event.target : null);
        this.state.value = value;
        if (value && !parseIsoDate(value)) {
          this.state.error = message(locale, 'invalidDate');
          return;
        }
        this.state.error = '';
        bubble(event as Event, 'wpl-change', { value });
      },
      commitTime(event) {
        const time = event instanceof Event && event.target instanceof HTMLInputElement ? event.target.value : '';
        const locale = localeOf(event instanceof Event && event.target instanceof Element ? event.target : null);
        this.state.time = time;
        if (time && !parseTimeValue(time)) {
          this.state.error = message(locale, 'invalidTime');
          return;
        }
        this.state.error = '';
        bubble(event as Event, 'wpl-time', { time });
      },
    },
  },
);

export const DateRangePicker = glimmer(
  `<div class="wpl-date"><span class="wpl-label">{{this.label}}</span><div class="wpl-date-row"><div class="wpl-field"><label class="wpl-label" for={{this.startId}}>{{this.startLabel}}</label><input id={{this.startId}} class="wpl-input" value={{this.start}} data-wpl-edge="start" placeholder="YYYY-MM-DD" {{flagAttr "aria-invalid" this.invalid}} {{flagAttr "aria-describedby" this.describedBy}} {{on "change" this.commitStart}} /></div><div class="wpl-field"><label class="wpl-label" for={{this.endId}}>{{this.endLabel}}</label><input id={{this.endId}} class="wpl-input" value={{this.end}} data-wpl-edge="end" placeholder="YYYY-MM-DD" {{flagAttr "aria-invalid" this.invalid}} {{flagAttr "aria-describedby" this.describedBy}} {{on "change" this.commitEnd}} /></div></div>{{#if this.showTime}}<div class="wpl-date-row"><input id={{this.startTimeId}} class="wpl-input" type="time" value={{this.startTime}} data-wpl-edge="start-time" aria-label={{this.startTimeLabel}} {{flagAttr "aria-invalid" this.invalid}} {{flagAttr "aria-describedby" this.describedBy}} {{on "change" this.commitStartTime}} /><input id={{this.endTimeId}} class="wpl-input" type="time" value={{this.endTime}} data-wpl-edge="end-time" aria-label={{this.endTimeLabel}} {{flagAttr "aria-invalid" this.invalid}} {{flagAttr "aria-describedby" this.describedBy}} {{on "change" this.commitEndTime}} /></div>{{/if}}{{#if this.error}}<p id={{this.errorId}} class="wpl-field-error" role="alert">{{this.error}}</p>{{/if}}<p class="wpl-field-hint">{{this.hint}}</p></div>`,
  {
    state: (args) => ({
      start: str(args.start),
      end: str(args.end),
      startTime: str(args.startTime),
      endTime: str(args.endTime),
      error: '',
      startId: createId('start'),
      endId: createId('end'),
      startTimeId: createId('start-time'),
      endTimeId: createId('end-time'),
    }),
    getters: {
      label: (host) => str(host.args.label, message(localeOf(typeof document === 'undefined' ? null : document.body), 'chooseDate')),
      startLabel: () => message(localeOf(typeof document === 'undefined' ? null : document.body), 'startDate'),
      endLabel: () => message(localeOf(typeof document === 'undefined' ? null : document.body), 'endDate'),
      startTimeLabel: () => message(localeOf(typeof document === 'undefined' ? null : document.body), 'startTime'),
      endTimeLabel: () => message(localeOf(typeof document === 'undefined' ? null : document.body), 'endTime'),
      startId: (host) => str(host.state.startId),
      endId: (host) => str(host.state.endId),
      startTimeId: (host) => str(host.state.startTimeId),
      endTimeId: (host) => str(host.state.endTimeId),
      error: (host) => str(host.state.error),
      invalid: (host) => (str(host.state.error) ? 'true' : ''),
      errorId: (host) => `${str(host.state.startId)}-error`,
      describedBy: (host) => (str(host.state.error) ? `${str(host.state.startId)}-error` : ''),
      start: (host) => str(host.state.start),
      end: (host) => str(host.state.end),
      startTime: (host) => str(host.state.startTime),
      endTime: (host) => str(host.state.endTime),
      showTime: (host) => flag(host.args.showTime),
      hint(this: Host) {
        const locale = localeOf(typeof document === 'undefined' ? null : document.body);
        const calendar = calendarOf(this.args.calendar);
        const start = parseIsoDate(str(this.state.start));
        const end = parseIsoDate(str(this.state.end));
        const dated = (date: Date | null, time: string) => {
          if (!date) return '';
          const label = formatDate(date, locale, { dateStyle: 'medium' }, calendar);
          return flag(this.args.showTime) && parseTimeValue(time) ? `${label}, ${time}` : label;
        };
        if (start && end) return `${dated(start, str(this.state.startTime))} – ${dated(end, str(this.state.endTime))}`;
        if (start) return dated(start, str(this.state.startTime));
        return message(locale, 'chooseDate');
      },
    },
    methods: {
      commitStart(event) {
        this.commit('start', event as Event);
      },
      commitEnd(event) {
        this.commit('end', event as Event);
      },
      commitStartTime(event) {
        this.commitTime('start', event as Event);
      },
      commitEndTime(event) {
        this.commitTime('end', event as Event);
      },
      commit(which, event) {
        const input = (event as Event).target;
        const next = input instanceof HTMLInputElement ? input.value : '';
        if (which === 'start') this.state.start = next;
        else this.state.end = next;
        const start = str(this.state.start);
        const end = str(this.state.end);
        if ((start && !parseIsoDate(start)) || (end && !parseIsoDate(end))) {
          this.state.error = message(localeOf(input instanceof Element ? input : null), 'invalidDate');
          return;
        }
        this.state.error = '';
        if (start && end) {
          if (flag(this.args.showTime)) {
            const ordered = orderDateTimeRange({ start, end, startTime: str(this.state.startTime), endTime: str(this.state.endTime) });
            this.state.start = ordered.start;
            this.state.end = ordered.end;
            this.state.startTime = ordered.startTime ?? '';
            this.state.endTime = ordered.endTime ?? '';
          } else {
            const ordered = orderDateRange(start, end);
            this.state.start = ordered.start;
            this.state.end = ordered.end;
          }
        }
        this.paintInputs(input instanceof Element ? input : null);
        bubble(event as Event, 'wpl-change', { start: str(this.state.start), end: str(this.state.end) });
      },
      commitTime(which, event) {
        const input = (event as Event).target;
        const next = input instanceof HTMLInputElement ? input.value : '';
        if (which === 'start') this.state.startTime = next;
        else this.state.endTime = next;
        if (next && !parseTimeValue(next)) {
          this.state.error = message(localeOf(input instanceof Element ? input : null), 'invalidTime');
          return;
        }
        this.state.error = '';
        if (str(this.state.start) && str(this.state.end)) {
          const ordered = orderDateTimeRange({
            start: str(this.state.start),
            end: str(this.state.end),
            startTime: str(this.state.startTime),
            endTime: str(this.state.endTime),
          });
          this.state.start = ordered.start;
          this.state.end = ordered.end;
          this.state.startTime = ordered.startTime ?? '';
          this.state.endTime = ordered.endTime ?? '';
          this.paintInputs(input instanceof Element ? input : null);
        }
        bubble(event as Event, 'wpl-change', {
          start: str(this.state.start),
          end: str(this.state.end),
          startTime: str(this.state.startTime),
          endTime: str(this.state.endTime),
        });
      },
      paintInputs(from) {
        const root = from?.closest('.wpl-date');
        if (!root) return;
        const start = root.querySelector('[data-wpl-edge="start"]');
        const end = root.querySelector('[data-wpl-edge="end"]');
        if (start instanceof HTMLInputElement) start.value = str(this.state.start);
        if (end instanceof HTMLInputElement) end.value = str(this.state.end);
        const hint = root.querySelector('.wpl-field-hint');
        if (hint) {
          const locale = localeOf(root);
          const startDate = parseIsoDate(str(this.state.start));
          const endDate = parseIsoDate(str(this.state.end));
          if (startDate && endDate) {
            hint.textContent = `${formatDate(startDate, locale)} – ${formatDate(endDate, locale)}`;
          }
        }
      },
    },
  },
);

export const Chart = glimmer(
  `<figure class="wpl-graph">{{{this.markup}}}</figure>`,
  {
    getters: {
      markup: (host) =>
        chartFigureHtml({
          title: str(host.args.title, 'Chart'),
          description: str(host.args.description),
          data: list(host.args.data),
          type: host.args.type,
          direction: typeof document !== 'undefined' && document.documentElement.dir === 'rtl' ? 'rtl' : 'ltr',
          locale: localeOf(typeof document === 'undefined' ? undefined : document.documentElement),
        }),
    },
  },
);

export const ChartContainer = glimmer(
  `<figure class="wpl-chart"><figcaption class="wpl-card-title">{{this.label}}</figcaption><div class="wpl-chart-bar"><span>{{this.label}}</span><span class="wpl-chart-track"><span class="wpl-chart-fill" style={{this.bar}}></span></span></div>{{yield}}{{#if @description}}<p class="wpl-muted">{{@description}}</p>{{/if}}</figure>`,
  {
    getters: {
      label: (host) => str(host.args.label, 'Chart'),
      bar: (host) => `inline-size:${Math.min(100, Math.max(0, num(host.args.value, 0)))}%`,
    },
  },
);
