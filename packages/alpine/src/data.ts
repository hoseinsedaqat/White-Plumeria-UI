import {
  addMonths,
  buildMonthGrid,
  calendarDayClass,
  chartFigureHtml,
  formatDate,
  iconButtonClassName,
  formatNumber,
  orderDateRange,
  orderDateTimeRange,
  parseIsoDate,
  parseTimeValue,
  sameDay,
  queryTable,
  readingDirection,
  toIsoDate,
  treeExpandAction,
  toggleSort,
  type CalendarSystem,
  type ColumnSpec,
  type TableQuery,
} from '@white-plumeria/core';
import {
  emit,
  flag,
  h,
  list,
  localeOf,
  num,
  svgIcon,
  text,
  translate,
  uid,
  type Config,
  type Magic,
} from './runtime.ts';

export interface DataColumn<T = Record<string, unknown>> {
  id: string;
  header: string;
  text?: (row: T) => string;
  sortValue?: (row: T) => string | number;
}

interface Row {
  [key: string]: unknown;
}

function cellText(column: DataColumn, row: Row): string {
  if (typeof column.text === 'function') return column.text(row);
  const value = row[column.id];
  return value == null ? '' : String(value);
}

function specs(columns: DataColumn[]): ColumnSpec<Row>[] {
  return columns.map((column) => ({
    id: column.id,
    header: column.header,
    text: (row) => cellText(column, row),
    sortValue: column.sortValue,
  }));
}

export function DataTable(config: Config = {}) {
  let rows = list<Row>(config.rows);
  let query: TableQuery = {
    sortId: text(config.sortId) || undefined,
    sortDirection: config.sortDirection === 'desc' ? 'desc' : 'asc',
    filter: text(config.filter),
    page: num(config.page, 1),
    pageSize: num(config.pageSize, 0) || undefined,
  };
  let paint = () => undefined;
  return {
    setRows(next: unknown[]) {
      rows = list<Row>(next);
      paint();
    },
    setQuery(next: TableQuery) {
      query = next;
      paint();
    },
    init(this: Magic) {
      const columns = list<DataColumn>(config.columns);
      const host = this.$el;
      const wrap = h('div', { className: 'wpl-data-table' });
      paint = () => {
        const result = queryTable(rows, specs(columns), query);
        const table = h('table', { className: 'wpl-table' }, [
          text(config.caption) ? h('caption', { text: text(config.caption) }) : null,
          h('thead', {}, [
            h('tr', {}, columns.map((column) => {
              const active = query.sortId === column.id;
              return h('th', { attrs: { scope: 'col', 'aria-sort': active ? (query.sortDirection === 'desc' ? 'descending' : 'ascending') : 'none' } }, [
                h('button', {
                  className: 'wpl-sort',
                  attrs: { type: 'button' },
                  on: {
                    click: () => {
                      const next = toggleSort({ sortId: query.sortId, sortDirection: query.sortDirection }, column.id);
                      query = { ...query, ...next };
                      paint();
                      emit(this, 'wpl-sort', next);
                    },
                  },
                }, [column.header, active ? h('span', { className: 'wpl-sort-mark' }, [svgIcon(query.sortDirection === 'asc' ? 'arrowUp' : 'arrowDown')]) : null, h('span', { className: 'wpl-sr-only', text: translate(host, 'sort') })]),
              ]);
            })),
          ]),
          h('tbody', {}, result.rows.map((row) => h('tr', {
            on: { click: () => emit(this, 'wpl-select', { id: text(row.id) }) },
          }, columns.map((column) => h('td', { text: cellText(column, row) }))))),
        ]);
        wrap.replaceChildren(
          h('div', { className: 'wpl-table-toolbar' }, [
            h('label', { className: 'wpl-sort-field' }, [
              h('span', { className: 'wpl-sr-only', text: translate(host, 'sort') }),
              h('select', {
                className: 'wpl-select',
                attrs: { 'aria-label': translate(host, 'sort') },
                on: {
                  change: (event) => {
                    const value = event.target instanceof HTMLSelectElement ? event.target.value : '';
                    query = { ...query, sortId: value || undefined, sortDirection: 'asc' };
                    paint();
                    emit(this, 'wpl-sort', { sortId: query.sortId, sortDirection: query.sortDirection });
                  },
                },
              }, [
                h('option', { text: translate(host, 'sort'), attrs: { value: '' } }),
                ...columns.map((column) => h('option', {
                  text: column.header,
                  attrs: { value: column.id, selected: query.sortId === column.id || undefined },
                })),
              ]),
            ]),
            h('span', { className: 'wpl-muted', text: `${formatNumber(result.total, localeOf(host))} ${translate(host, 'rows')}` }),
          ]),
          h('div', { className: 'wpl-table-wrap' }, [table]),
        );
      };
      paint();
      host.replaceChildren(wrap);
    },
  };
}

export function Table(config: Config = {}) {
  return DataTable({ ...config, pageSize: 0 });
}

export function List(config: Config = {}) {
  return {
    init(this: Magic) {
      const items = list<{ id?: string; label: string; description?: string }>(config.items);
      this.$el.replaceChildren(h('ul', { className: 'wpl-list' }, items.map((item) => h('li', { className: 'wpl-list-item' }, [
        h('strong', { text: item.label }),
        item.description ? h('span', { text: item.description }) : null,
      ]))));
    },
  };
}

export function Pagination(config: Config = {}) {
  return {
    init(this: Magic) {
      const pageCount = Math.max(1, num(config.pageCount, 1));
      let page = Math.min(pageCount, Math.max(1, num(config.page, 1)));
      const nav = h('nav', { className: 'wpl-pagination', attrs: { 'aria-label': text(config.label, translate(this.$el, 'pagination')) } });
      const paint = () => {
        const pages = Array.from({ length: pageCount }, (_, index) => index + 1).filter(
          (item) => item === 1 || item === pageCount || Math.abs(item - page) <= 1,
        );
        const previous = h(
          'button',
          {
            className: 'wpl-page',
            attrs: { type: 'button', disabled: page <= 1 || undefined },
            on: { click: () => go(page - 1) },
          },
          [
            svgIcon('chevronLeft', 'wpl-icon wpl-icon-dir'),
            h('span', { className: 'wpl-sr-only', text: translate(this.$el, 'previous') }),
          ],
        );
        const next = h(
          'button',
          {
            className: 'wpl-page',
            attrs: { type: 'button', disabled: page >= pageCount || undefined },
            on: { click: () => go(page + 1) },
          },
          [
            svgIcon('chevronRight', 'wpl-icon wpl-icon-dir'),
            h('span', { className: 'wpl-sr-only', text: translate(this.$el, 'next') }),
          ],
        );
        const buttons = pages.flatMap((item, index) => {
          const earlier = pages[index - 1];
          const gap = earlier !== undefined && item - earlier > 1;
          const button = h('button', {
            className: 'wpl-page',
            text: String(item),
            attrs: { type: 'button', 'aria-current': item === page ? 'page' : undefined },
            on: { click: () => go(item) },
          });
          return gap ? [h('span', { text: '…', attrs: { 'aria-hidden': 'true' } }), button] : [button];
        });
        nav.replaceChildren(previous, ...buttons, next);
      };
      const go = (nextPage: number) => {
        page = Math.min(pageCount, Math.max(1, nextPage));
        paint();
        emit(this, 'wpl-change', { page });
      };
      paint();
      this.$el.replaceChildren(nav);
    },
  };
}

export function Breadcrumb(config: Config = {}) {
  return {
    init(this: Magic) {
      const items = list<{ href?: string; label: string }>(config.items);
      this.$el.replaceChildren(h('nav', { className: 'wpl-breadcrumb', attrs: { 'aria-label': translate(this.$el, 'breadcrumb') } }, [
        h('ol', {}, items.map((item, index) => {
          const last = index === items.length - 1;
          return h('li', {}, [
            index > 0 ? svgIcon('chevronRight', 'wpl-icon wpl-icon-dir') : null,
            last || !item.href
              ? h('span', { text: item.label, attrs: { 'aria-current': last ? 'page' : undefined } })
              : h('a', { className: 'wpl-link', text: item.label, attrs: { href: item.href } }),
          ]);
        })),
      ]));
    },
  };
}

export function Timeline(config: Config = {}) {
  return {
    init(this: Magic) {
      const items = list<{ id?: string; title?: string; time?: string; dateTime?: string; meta?: string }>(config.items);
      this.$el.replaceChildren(h('ol', { className: 'wpl-timeline' }, items.map((item) => {
        const time = text(item.time);
        const dateTime = text(item.dateTime);
        const meta = text(item.meta);
        return h('li', { className: 'wpl-timeline-item' }, [
          h('p', { className: 'wpl-timeline-title', text: text(item.title) }),
          time || meta
            ? h('p', { className: 'wpl-timeline-meta' }, [
                dateTime ? h('time', { text: time, attrs: { datetime: dateTime } }) : time,
                meta ? ` · ${meta}` : null,
              ])
            : null,
        ]);
      })));
    },
  };
}

interface TreeNode {
  id: string;
  label: string;
  children?: TreeNode[];
}

export function TreeView(config: Config = {}) {
  return {
    init(this: Magic) {
      const nodes = list<TreeNode>(config.nodes);
      const open = new Set<string>();
      let selected = '';
      const root = h('ul', { className: 'wpl-tree', attrs: { role: 'tree', 'aria-label': text(config.label, 'Tree') } });
      const paint = () => {
        root.replaceChildren(...nodes.map((node) => branch(node)));
      };
      const branch = (node: TreeNode): HTMLElement => {
        const kids = node.children ?? [];
        const expanded = open.has(node.id);
        const row = h(
          'button',
          {
            className: 'wpl-tree-row',
            attrs: {
              type: 'button',
              role: 'treeitem',
              'aria-expanded': kids.length ? String(expanded) : undefined,
              'aria-selected': selected === node.id ? 'true' : 'false',
            },
            on: {
              click: () => {
                selected = node.id;
                emit(this, 'wpl-select', { id: node.id });
                if (!kids.length) {
                  paint();
                  return;
                }
                if (expanded) open.delete(node.id);
                else open.add(node.id);
                paint();
              },
              keydown: (event) => {
                if (!kids.length) return;
                const keyEvent = event as KeyboardEvent;
                const action = treeExpandAction(
                  keyEvent.key,
                  keyEvent.currentTarget instanceof HTMLElement ? keyEvent.currentTarget : null,
                  expanded,
                );
                if (!action) return;
                keyEvent.preventDefault();
                if (action === 'stay') return;
                if (expanded) open.delete(node.id);
                else open.add(node.id);
                paint();
              },
            },
          },
          [
            kids.length
              ? svgIcon(expanded ? 'chevronDown' : 'chevronRight')
              : h('span', { className: 'wpl-tree-spacer', attrs: { 'aria-hidden': 'true' } }),
            node.label,
          ],
        );
        return h('li', { className: 'wpl-tree-item', attrs: { role: 'none' } }, [
          row,
          kids.length && expanded ? h('ul', { className: 'wpl-tree-children', attrs: { role: 'group' } }, kids.map((child) => branch(child))) : null,
        ]);
      };
      paint();
      this.$el.replaceChildren(root);
    },
  };
}

interface Point {
  label: string;
  value: number;
}

export function Chart(config: Config = {}) {
  return {
    init(this: Magic) {
      const title = text(config.title ?? config.label, 'Chart');
      const figure = document.createElement('figure');
      figure.className = 'wpl-graph';
      figure.innerHTML = chartFigureHtml({
        title,
        description: text(config.description),
        data: list(config.data ?? config.points),
        type: config.type,
        direction: readingDirection(this.$el),
        locale: localeOf(this.$el),
      });
      this.$el.replaceChildren(figure);
    },
  };
}

export function ChartContainer(config: Config = {}) {
  return {
    init(this: Magic) {
      const points = list<Point>(config.data ?? config.points);
      const title = text(config.title ?? config.label, 'Chart');
      const description = text(config.description);
      const locale = localeOf(this.$el);
      const invalid = points.some((point) => !Number.isFinite(point.value) || point.value < 0);
      const max = Math.max(1, ...points.map((point) => point.value));
      const bars = invalid
        ? h('p', {
            className: 'wpl-field-error',
            text: 'ChartContainer accepts finite, non-negative values only.',
            attrs: { role: 'alert' },
          })
        : h('div', { attrs: { 'aria-hidden': 'true' } }, points.map((point) =>
            h('div', { className: 'wpl-chart-bar' }, [
              h('span', { text: point.label }),
              h('span', { className: 'wpl-chart-track' }, [
                h('span', {
                  className: 'wpl-chart-fill',
                  attrs: { style: `inline-size:${(point.value / max) * 100}%` },
                }),
              ]),
              h('span', { text: formatNumber(point.value, locale) }),
            ]),
          ));
      this.$el.replaceChildren(
        h('figure', { className: 'wpl-chart' }, [
          h('figcaption', { className: 'wpl-card-title', text: title }),
          description ? h('p', { className: 'wpl-muted', text: description }) : null,
          bars,
          h('table', { className: 'wpl-table wpl-chart-table' }, [
            h('caption', { className: 'wpl-sr-only', text: title }),
            h('thead', {}, [
              h('tr', {}, [
                h('th', { text: 'Label', attrs: { scope: 'col' } }),
                h('th', { text: 'Value', attrs: { scope: 'col' } }),
              ]),
            ]),
            h('tbody', {}, points.map((point) =>
              h('tr', {}, [
                h('th', { text: point.label, attrs: { scope: 'row' } }),
                h('td', { text: Number.isFinite(point.value) ? formatNumber(point.value, locale) : String(point.value) }),
              ]),
            )),
          ]),
        ]),
      );
    },
  };
}

function calendarOf(value: unknown): CalendarSystem {
  return value === 'persian' ? 'persian' : 'gregory';
}

export function Calendar(config: Config = {}) {
  return {
    init(this: Magic) {
      const calendar = calendarOf(config.calendar);
      let anchor = parseIsoDate(text(config.value)) ?? new Date();
      let selected = text(config.value);
      const root = h('div', { className: 'wpl-calendar' });
      const paint = () => {
        const grid = buildMonthGrid({ anchor, calendar, locale: localeOf(this.$el), min: parseIsoDate(text(config.min)) ?? undefined, max: parseIsoDate(text(config.max)) ?? undefined });
        const selectedDate = parseIsoDate(selected);
        root.replaceChildren(
          h('div', { className: 'wpl-calendar-head' }, [
            h('button', { className: 'wpl-btn wpl-btn-ghost wpl-btn-sm', attrs: { type: 'button', 'aria-label': translate(this.$el, 'previous') }, on: { click: () => { anchor = addMonths(anchor, -1, calendar); paint(); } } }, [svgIcon('chevronLeft')]),
            h('strong', { text: grid.title }),
            h('button', { className: 'wpl-btn wpl-btn-ghost wpl-btn-sm', attrs: { type: 'button', 'aria-label': translate(this.$el, 'next') }, on: { click: () => { anchor = addMonths(anchor, 1, calendar); paint(); } } }, [svgIcon('chevronRight')]),
          ]),
          h('div', { className: 'wpl-calendar-grid', attrs: { role: 'grid', 'aria-label': grid.title } }, [
            ...grid.weekdays.map((day) => h('div', { className: 'wpl-calendar-weekday', text: day, attrs: { role: 'columnheader' } })),
            ...grid.cells.map((cell) => h('button', {
              className: calendarDayClass({ inMonth: cell.inMonth, date: cell.date, rangeStart: selectedDate, rangeEnd: selectedDate }),
              text: cell.label,
              attrs: {
                type: 'button',
                role: 'gridcell',
                disabled: cell.disabled || undefined,
                'aria-selected': selectedDate && sameDay(selectedDate, cell.date) ? 'true' : undefined,
                'aria-current': sameDay(new Date(), cell.date) ? 'date' : undefined,
                'aria-label': formatDate(cell.date, localeOf(this.$el), { dateStyle: 'full' }, calendar),
              },
              on: {
                click: () => {
                  selected = toIsoDate(cell.date);
                  anchor = cell.date;
                  paint();
                  emit(this, 'wpl-change', { value: selected });
                },
              },
            })),
          ]),
        );
      };
      paint();
      this.$el.replaceChildren(root);
    },
  };
}

export function DatePicker(config: Config = {}) {
  return {
    init(this: Magic) {
      const calendar = calendarOf(config.calendar);
      let value = text(config.value);
      let time = text(config.time);
      let error = '';
      const id = uid('date');
      const timeId = uid('time');
      const errorId = `${id}-error`;
      const hint = h('p', { className: 'wpl-field-hint' });
      const errorEl = h('p', { className: 'wpl-field-error', attrs: { id: errorId, role: 'alert', hidden: true } });
      const input = h('input', {
        className: 'wpl-input',
        attrs: { id, value, placeholder: 'YYYY-MM-DD', 'aria-invalid': undefined },
        on: { change: () => commit(input.value) },
      });
      const timeInput = h('input', {
        className: 'wpl-input',
        attrs: { id: timeId, type: 'time', value: time },
        on: { change: () => commitTime(timeInput.value) },
      });
      const paintHint = () => {
        const date = parseIsoDate(value);
        hint.textContent = date
          ? `${formatDate(date, localeOf(this.$el), { dateStyle: 'full' }, calendar)}${flag(config.showTime) && parseTimeValue(time) ? `, ${time}` : ''}`
          : translate(this.$el, 'chooseDate');
        errorEl.hidden = !error;
        errorEl.textContent = error;
        input.value = value;
        input.setAttribute('aria-invalid', error ? 'true' : 'false');
        timeInput.setAttribute('aria-invalid', error ? 'true' : 'false');
        if (error) {
          input.setAttribute('aria-describedby', errorId);
          timeInput.setAttribute('aria-describedby', errorId);
        } else {
          input.removeAttribute('aria-describedby');
          timeInput.removeAttribute('aria-describedby');
        }
      };
      const commit = (next: string) => {
        if (next && !parseIsoDate(next)) {
          error = translate(this.$el, 'invalidDate');
          paintHint();
          return;
        }
        value = next;
        error = '';
        paintHint();
        emit(this, 'wpl-change', { value, time });
      };
      const commitTime = (next: string) => {
        if (next && !parseTimeValue(next)) {
          error = translate(this.$el, 'invalidTime');
          paintHint();
          return;
        }
        time = next;
        error = '';
        paintHint();
        emit(this, 'wpl-change', { value, time });
      };
      paintHint();
      let open = false;
      const calendarHost = document.createElement('div');
      calendarHost.hidden = true;
      const showCalendar = () => {
        Calendar({ ...config, value }).init.call({
          ...this,
          $el: calendarHost,
          $dispatch: (_name, detail) => {
            const next = (detail as { value?: string } | undefined)?.value;
            if (!next) return;
            commit(next);
            open = false;
            toggle.setAttribute('aria-expanded', 'false');
            calendarHost.hidden = true;
          },
        });
      };
      const toggle = h('button', {
        className: iconButtonClassName(),
        attrs: { type: 'button', 'aria-label': translate(this.$el, 'chooseDate'), 'aria-expanded': 'false' },
        on: {
          click: () => {
            open = !open;
            toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
            calendarHost.hidden = !open;
            if (open) showCalendar();
          },
        },
      }, [svgIcon('calendar')]);
      this.$el.replaceChildren(h('div', { className: 'wpl-date' }, [
        h('label', { className: 'wpl-label', text: text(config.label, translate(this.$el, 'chooseDate')), attrs: { for: id } }),
        h('div', { className: 'wpl-flex' }, [input, toggle]),
        flag(config.showTime) ? h('label', { className: 'wpl-label', text: translate(this.$el, 'time'), attrs: { for: timeId } }) : null,
        flag(config.showTime) ? timeInput : null,
        errorEl,
        hint,
        calendarHost,
      ]));
    },
  };
}

export function DateRangePicker(config: Config = {}) {
  return {
    init(this: Magic) {
      const calendar = calendarOf(config.calendar);
      const showTime = flag(config.showTime);
      let start = text(config.start);
      let end = text(config.end);
      let startTime = text(config.startTime);
      let endTime = text(config.endTime);
      let error = '';
      let awaitingEnd = false;
      let anchor = parseIsoDate(start) ?? parseIsoDate(end) ?? new Date();
      const startId = uid('start');
      const endId = uid('end');
      const startTimeId = uid('start-time');
      const endTimeId = uid('end-time');
      const errorId = `${startId}-error`;
      const hint = h('p', { className: 'wpl-field-hint' });
      const errorEl = h('p', { className: 'wpl-field-error', attrs: { id: errorId, role: 'alert', hidden: true } });
      const startInput = h('input', {
        className: 'wpl-input',
        attrs: { id: startId, value: start, 'data-wpl-edge': 'start', placeholder: 'YYYY-MM-DD' },
        on: { change: () => commit('start', startInput.value) },
      });
      const endInput = h('input', {
        className: 'wpl-input',
        attrs: { id: endId, value: end, 'data-wpl-edge': 'end', placeholder: 'YYYY-MM-DD' },
        on: { change: () => commit('end', endInput.value) },
      });
      const startTimeInput = h('input', {
        className: 'wpl-input',
        attrs: { id: startTimeId, type: 'time', value: startTime, 'data-wpl-edge': 'start-time' },
        on: { change: () => commitTime('start', startTimeInput.value) },
      });
      const endTimeInput = h('input', {
        className: 'wpl-input',
        attrs: { id: endTimeId, type: 'time', value: endTime, 'data-wpl-edge': 'end-time' },
        on: { change: () => commitTime('end', endTimeInput.value) },
      });
      const grid = h('div', { className: 'wpl-calendar' });

      const dated = (iso: string, timeValue: string) => {
        const date = parseIsoDate(iso);
        if (!date) return '';
        const label = formatDate(date, localeOf(this.$el), { dateStyle: 'medium' }, calendar);
        return showTime && parseTimeValue(timeValue) ? `${label}, ${timeValue}` : label;
      };
      const paint = () => {
        startInput.value = start;
        endInput.value = end;
        startTimeInput.value = startTime;
        endTimeInput.value = endTime;
        const startDate = parseIsoDate(start);
        const endDate = parseIsoDate(end);
        hint.textContent = startDate && endDate
          ? `${dated(start, startTime)} – ${dated(end, endTime)}`
          : startDate
            ? dated(start, startTime)
            : translate(this.$el, 'chooseDate');
        errorEl.hidden = !error;
        errorEl.textContent = error;
        for (const field of [startInput, endInput, startTimeInput, endTimeInput]) {
          field.setAttribute('aria-invalid', error ? 'true' : 'false');
          if (error) field.setAttribute('aria-describedby', errorId);
          else field.removeAttribute('aria-describedby');
        }
        paintGrid();
      };
      const emitRange = () => {
        if (showTime) emit(this, 'wpl-change', { start, end, startTime, endTime });
        else emit(this, 'wpl-change', { start, end });
      };
      const commit = (which: 'start' | 'end', next: string) => {
        if (which === 'start') start = next;
        else end = next;
        if ((start && !parseIsoDate(start)) || (end && !parseIsoDate(end))) {
          error = translate(this.$el, 'invalidDate');
          paint();
          return;
        }
        error = '';
        if (start && end) {
          if (showTime) {
            const ordered = orderDateTimeRange({ start, end, startTime, endTime });
            start = ordered.start;
            end = ordered.end;
            startTime = ordered.startTime;
            endTime = ordered.endTime;
          } else {
            const ordered = orderDateRange(start, end);
            start = ordered.start;
            end = ordered.end;
          }
          awaitingEnd = false;
        }
        paint();
        emitRange();
      };
      const commitTime = (which: 'start' | 'end', next: string) => {
        if (next && !parseTimeValue(next)) {
          error = translate(this.$el, 'invalidTime');
          paint();
          return;
        }
        if (which === 'start') startTime = next;
        else endTime = next;
        error = '';
        if (start && end && showTime) {
          const ordered = orderDateTimeRange({ start, end, startTime, endTime });
          start = ordered.start;
          end = ordered.end;
          startTime = ordered.startTime;
          endTime = ordered.endTime;
        }
        paint();
        emitRange();
      };
      const pick = (date: Date) => {
        const iso = toIsoDate(date);
        if (!awaitingEnd || !start || end) {
          start = iso;
          end = '';
          if (showTime) endTime = '';
          awaitingEnd = true;
          error = '';
          anchor = date;
          paint();
          emitRange();
          return;
        }
        end = iso;
        awaitingEnd = false;
        commit('end', iso);
      };
      const paintGrid = () => {
        const month = buildMonthGrid({
          anchor,
          calendar,
          locale: localeOf(this.$el),
          min: parseIsoDate(text(config.min)) ?? undefined,
          max: parseIsoDate(text(config.max)) ?? undefined,
        });
        const startDate = parseIsoDate(start);
        const endDate = parseIsoDate(end);
        grid.replaceChildren(
          h('div', { className: 'wpl-calendar-head' }, [
            h('button', { className: 'wpl-btn wpl-btn-ghost wpl-btn-sm', attrs: { type: 'button', 'aria-label': translate(this.$el, 'previous') }, on: { click: () => { anchor = addMonths(anchor, -1, calendar); paintGrid(); } } }, [svgIcon('chevronLeft')]),
            h('strong', { text: month.title }),
            h('button', { className: 'wpl-btn wpl-btn-ghost wpl-btn-sm', attrs: { type: 'button', 'aria-label': translate(this.$el, 'next') }, on: { click: () => { anchor = addMonths(anchor, 1, calendar); paintGrid(); } } }, [svgIcon('chevronRight')]),
          ]),
          h('div', { className: 'wpl-calendar-grid', attrs: { role: 'grid', 'aria-label': month.title } }, [
            ...month.weekdays.map((day) => h('div', { className: 'wpl-calendar-weekday', text: day, attrs: { role: 'columnheader' } })),
            ...month.cells.map((cell) => h('button', {
              className: calendarDayClass({ inMonth: cell.inMonth, date: cell.date, rangeStart: startDate, rangeEnd: endDate }),
              text: cell.label,
              attrs: {
                type: 'button',
                role: 'gridcell',
                disabled: cell.disabled || undefined,
                'aria-selected': (startDate && sameDay(startDate, cell.date)) || (endDate && sameDay(endDate, cell.date)) ? 'true' : undefined,
                'aria-current': sameDay(new Date(), cell.date) ? 'date' : undefined,
                'aria-label': formatDate(cell.date, localeOf(this.$el), { dateStyle: 'full' }, calendar),
              },
              on: { click: () => pick(cell.date) },
            })),
          ]),
        );
      };
      paint();
      this.$el.replaceChildren(h('div', { className: 'wpl-date' }, [
        h('span', { className: 'wpl-label', text: text(config.label, translate(this.$el, 'chooseDate')) }),
        h('div', { className: 'wpl-date-row' }, [
          h('div', { className: 'wpl-field' }, [h('label', { className: 'wpl-label', text: translate(this.$el, 'startDate'), attrs: { for: startId } }), startInput]),
          h('div', { className: 'wpl-field' }, [h('label', { className: 'wpl-label', text: translate(this.$el, 'endDate'), attrs: { for: endId } }), endInput]),
        ]),
        showTime ? h('div', { className: 'wpl-date-row' }, [
          h('div', { className: 'wpl-field wpl-time' }, [h('label', { className: 'wpl-label', text: translate(this.$el, 'startTime'), attrs: { for: startTimeId } }), startTimeInput]),
          h('div', { className: 'wpl-field wpl-time' }, [h('label', { className: 'wpl-label', text: translate(this.$el, 'endTime'), attrs: { for: endTimeId } }), endTimeInput]),
        ]) : null,
        errorEl,
        hint,
        grid,
      ]));
    },
  };
}
