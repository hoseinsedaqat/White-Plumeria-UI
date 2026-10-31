import {
  addMonths,
  buildMonthGrid,
  calendarDayClass,
  formatDate,
  formatNumber,
  orderDateRange,
  orderDateTimeRange,
  parseIsoDate,
  parseTimeValue,
  sameDay,
  toIsoDate,
  toParts,
  type CalendarSystem,
  type DateRangeValue,
  type DateTimeRangeValue,
} from '@white-plumeria/core';
import { defineComponent, h, ref, useId, type PropType } from 'vue';
import { IconButton } from './button.ts';
import { Icon } from './icon.ts';
import { useWhitePlumeria } from './provider.ts';

export const Calendar = defineComponent({
  name: 'Calendar',
  props: {
    modelValue: { type: Date as PropType<Date | null>, default: null },
    calendar: { type: String as PropType<CalendarSystem>, default: 'gregory' },
    locale: { type: String as PropType<'en' | 'fa' | ''>, default: '' },
    min: { type: Date as PropType<Date | null>, default: null },
    max: { type: Date as PropType<Date | null>, default: null },
    rangeStart: { type: Date as PropType<Date | null>, default: null },
    rangeEnd: { type: Date as PropType<Date | null>, default: null },
  },
  emits: ['update:modelValue'],
  setup(props, { emit }) {
    const context = useWhitePlumeria();
    const anchor = ref(props.modelValue ?? new Date());
    return () => {
      const activeLocale = props.locale || context.locale.value;
      const grid = buildMonthGrid({
        anchor: anchor.value,
        calendar: props.calendar,
        locale: activeLocale,
        min: props.min ?? undefined,
        max: props.max ?? undefined,
      });
      const today = new Date();
      return h('div', { class: 'wpl-calendar' }, [
        h('div', { class: 'wpl-calendar-head' }, [
          h(IconButton, { label: context.t('previous'), onClick: () => (anchor.value = addMonths(anchor.value, -1, props.calendar)) }, () => h(Icon, { name: 'chevronLeft' })),
          h('strong', grid.title),
          h(IconButton, { label: context.t('next'), onClick: () => (anchor.value = addMonths(anchor.value, 1, props.calendar)) }, () => h(Icon, { name: 'chevronRight' })),
        ]),
        h(
          'div',
          { class: 'wpl-calendar-grid', role: 'grid', 'aria-label': grid.title },
          [
            ...grid.weekdays.map((day) => h('div', { key: day, class: 'wpl-calendar-weekday', role: 'columnheader' }, day)),
            ...grid.cells.map((cell) =>
              h(
                'button',
                {
                  key: cell.key + (cell.inMonth ? '' : '-out'),
                  type: 'button',
                  role: 'gridcell',
                  class: calendarDayClass({
                    inMonth: cell.inMonth,
                    date: cell.date,
                    rangeStart: props.rangeStart,
                    rangeEnd: props.rangeEnd,
                  }),
                  disabled: cell.disabled,
                  'aria-selected':
                    (props.modelValue && sameDay(props.modelValue, cell.date)) ||
                    (props.rangeStart && sameDay(props.rangeStart, cell.date)) ||
                    (props.rangeEnd && sameDay(props.rangeEnd, cell.date))
                      ? true
                      : undefined,
                  'aria-current': sameDay(today, cell.date) ? 'date' : undefined,
                  'aria-label': cell.label,
                  onClick: () => emit('update:modelValue', cell.date),
                },
                formatNumber(toParts(cell.date, props.calendar).day, activeLocale),
              ),
            ),
          ],
        ),
      ]);
    };
  },
});

export const DatePicker = defineComponent({
  name: 'DatePicker',
  props: {
    label: { type: String, required: true },
    modelValue: { type: String, default: '' },
    calendar: { type: String as PropType<CalendarSystem>, default: 'gregory' },
    min: { type: String, default: '' },
    max: { type: String, default: '' },
    showTime: { type: Boolean, default: false },
    time: { type: String, default: '' },
  },
  emits: ['update:modelValue', 'update:time'],
  setup(props, { emit }) {
    const id = useId();
    const timeId = useId();
    const { t, locale } = useWhitePlumeria();
    const open = ref(false);
    const text = ref(props.modelValue);
    const timeText = ref(props.time);
    const error = ref('');
    function commit(next: string) {
      text.value = next;
      if (!next) {
        error.value = '';
        emit('update:modelValue', '');
        return;
      }
      if (!parseIsoDate(next)) {
        error.value = t('invalidDate');
        return;
      }
      error.value = '';
      emit('update:modelValue', next);
    }
    function commitTime(next: string) {
      timeText.value = next;
      if (!next) {
        error.value = '';
        emit('update:time', '');
        return;
      }
      const parsed = parseTimeValue(next);
      if (!parsed) {
        error.value = t('invalidTime');
        return;
      }
      const stored = `${String(parsed.hours).padStart(2, '0')}:${String(parsed.minutes).padStart(2, '0')}`;
      timeText.value = stored;
      error.value = '';
      emit('update:time', stored);
    }
    return () => {
      const selected = parseIsoDate(props.modelValue || text.value);
      return h('div', { class: 'wpl-date' }, [
        h('label', { class: 'wpl-label', for: id }, props.label),
        h('div', { class: 'wpl-flex' }, [
          h('input', {
            id,
            class: 'wpl-input',
            value: text.value,
            inputmode: 'numeric',
            placeholder: 'YYYY-MM-DD',
            'aria-invalid': error.value ? true : undefined,
            'aria-describedby': error.value ? `${id}-error` : undefined,
            onInput: (event: Event) => commit((event.target as HTMLInputElement).value),
          }),
          h(IconButton, { label: t('chooseDate'), onClick: () => (open.value = !open.value) }, () => h(Icon, { name: 'calendar' })),
        ]),
        props.showTime
          ? h('div', { class: 'wpl-field wpl-time' }, [
              h('label', { class: 'wpl-label', for: timeId }, t('time')),
              h('input', {
                id: timeId,
                class: 'wpl-input',
                value: timeText.value,
                inputmode: 'numeric',
                placeholder: 'HH:mm',
                'aria-invalid': error.value ? true : undefined,
                onInput: (event: Event) => commitTime((event.target as HTMLInputElement).value),
              }),
            ])
          : null,
        error.value ? h('p', { id: `${id}-error`, class: 'wpl-field-error', role: 'alert' }, error.value) : null,
        open.value
          ? h(Calendar, {
              modelValue: selected,
              calendar: props.calendar,
              locale: locale.value,
              min: props.min ? parseIsoDate(props.min) : null,
              max: props.max ? parseIsoDate(props.max) : null,
              'onUpdate:modelValue': (date: Date) => {
                const iso = toIsoDate(date);
                commit(iso);
                open.value = false;
              },
            })
          : null,
        h(
          'p',
          { class: 'wpl-field-hint' },
          selected
            ? `${formatDate(selected, locale.value, { dateStyle: 'full' }, props.calendar)}${props.showTime && parseTimeValue(timeText.value) ? `, ${timeText.value}` : ''}`
            : t('chooseDate'),
        ),
      ]);
    };
  },
});

export type { DateRangeValue, DateTimeRangeValue };

export const DateRangePicker = defineComponent({
  name: 'DateRangePicker',
  props: {
    label: { type: String, required: true },
    start: { type: String, default: '' },
    end: { type: String, default: '' },
    startTime: { type: String, default: '' },
    endTime: { type: String, default: '' },
    showTime: { type: Boolean, default: false },
    calendar: { type: String as PropType<CalendarSystem>, default: 'gregory' },
    min: { type: String, default: '' },
    max: { type: String, default: '' },
  },
  emits: ['update:start', 'update:end', 'update:startTime', 'update:endTime', 'change'],
  setup(props, { emit }) {
    const startId = useId();
    const endId = useId();
    const startTimeId = useId();
    const endTimeId = useId();
    const { t, locale } = useWhitePlumeria();
    const open = ref(false);
    const startText = ref(props.start);
    const endText = ref(props.end);
    const startTimeText = ref(props.startTime);
    const endTimeText = ref(props.endTime);
    const error = ref('');
    const awaitingEnd = ref(false);

    function emitRange(nextStart: string, nextEnd: string, nextStartTime = startTimeText.value, nextEndTime = endTimeText.value) {
      if (props.showTime && ((nextStartTime && !parseTimeValue(nextStartTime)) || (nextEndTime && !parseTimeValue(nextEndTime)))) {
        error.value = t('invalidTime');
        return;
      }
      if (!props.showTime) {
        const ordered = nextStart && nextEnd ? orderDateRange(nextStart, nextEnd) : { start: nextStart, end: nextEnd };
        startText.value = ordered.start;
        endText.value = ordered.end;
        error.value = '';
        emit('update:start', ordered.start);
        emit('update:end', ordered.end);
        emit('change', ordered);
        return;
      }
      const ordered = orderDateTimeRange({ start: nextStart, end: nextEnd, startTime: nextStartTime, endTime: nextEndTime });
      startText.value = ordered.start;
      endText.value = ordered.end;
      startTimeText.value = ordered.startTime;
      endTimeText.value = ordered.endTime;
      error.value = '';
      emit('update:start', ordered.start);
      emit('update:end', ordered.end);
      emit('update:startTime', ordered.startTime);
      emit('update:endTime', ordered.endTime);
      emit('change', ordered);
    }

    function commit(which: 'start' | 'end', next: string) {
      const nextStart = which === 'start' ? next : startText.value;
      const nextEnd = which === 'end' ? next : endText.value;
      if (which === 'start') startText.value = next;
      else endText.value = next;
      if ((nextStart && !parseIsoDate(nextStart)) || (nextEnd && !parseIsoDate(nextEnd))) {
        error.value = t('invalidDate');
        return;
      }
      emitRange(nextStart, nextEnd);
    }

    function commitTime(which: 'start' | 'end', next: string) {
      if (which === 'start') startTimeText.value = next;
      else endTimeText.value = next;
      if (next && !parseTimeValue(next)) {
        error.value = t('invalidTime');
        return;
      }
      emitRange(startText.value, endText.value, which === 'start' ? next : startTimeText.value, which === 'end' ? next : endTimeText.value);
    }

    function pick(date: Date) {
      const iso = toIsoDate(date);
      if (!awaitingEnd.value || !startText.value || endText.value) {
        startText.value = iso;
        endText.value = '';
        if (props.showTime) endTimeText.value = '';
        awaitingEnd.value = true;
        error.value = '';
        emit('update:start', iso);
        emit('update:end', '');
        emit('change', props.showTime ? { start: iso, end: '', startTime: startTimeText.value, endTime: '' } : { start: iso, end: '' });
        return;
      }
      emitRange(startText.value, iso);
      awaitingEnd.value = false;
      open.value = false;
    }

    return () => {
      const startDate = parseIsoDate(startText.value);
      const endDate = parseIsoDate(endText.value);
      const dated = (date: Date, timeValue: string) => {
        const label = formatDate(date, locale.value, { dateStyle: 'medium' }, props.calendar);
        return props.showTime && parseTimeValue(timeValue) ? `${label}, ${timeValue}` : label;
      };
      const hint =
        startDate && endDate
          ? `${dated(startDate, startTimeText.value)} – ${dated(endDate, endTimeText.value)}`
          : startDate
            ? dated(startDate, startTimeText.value)
            : t('chooseDate');
      return h('div', { class: 'wpl-date' }, [
        h('span', { class: 'wpl-label' }, props.label),
        h('div', { class: 'wpl-date-row' }, [
          h('div', { class: 'wpl-field' }, [
            h('label', { class: 'wpl-label', for: startId }, t('startDate')),
            h('input', {
              id: startId,
              class: 'wpl-input',
              value: startText.value,
              inputmode: 'numeric',
              placeholder: 'YYYY-MM-DD',
              'aria-invalid': error.value ? true : undefined,
              onInput: (event: Event) => commit('start', (event.target as HTMLInputElement).value),
            }),
          ]),
          h('div', { class: 'wpl-field' }, [
            h('label', { class: 'wpl-label', for: endId }, t('endDate')),
            h('input', {
              id: endId,
              class: 'wpl-input',
              value: endText.value,
              inputmode: 'numeric',
              placeholder: 'YYYY-MM-DD',
              'aria-invalid': error.value ? true : undefined,
              onInput: (event: Event) => commit('end', (event.target as HTMLInputElement).value),
            }),
          ]),
          h(IconButton, {
            label: t('chooseDate'),
            'aria-expanded': open.value,
            onClick: () => (open.value = !open.value),
          }, () => h(Icon, { name: 'calendar' })),
        ]),
        props.showTime
          ? h('div', { class: 'wpl-date-row' }, [
              h('div', { class: 'wpl-field wpl-time' }, [
                h('label', { class: 'wpl-label', for: startTimeId }, t('startTime')),
                h('input', {
                  id: startTimeId,
                  class: 'wpl-input',
                  value: startTimeText.value,
                  inputmode: 'numeric',
                  placeholder: 'HH:mm',
                  'aria-invalid': error.value ? true : undefined,
                  onInput: (event: Event) => commitTime('start', (event.target as HTMLInputElement).value),
                }),
              ]),
              h('div', { class: 'wpl-field wpl-time' }, [
                h('label', { class: 'wpl-label', for: endTimeId }, t('endTime')),
                h('input', {
                  id: endTimeId,
                  class: 'wpl-input',
                  value: endTimeText.value,
                  inputmode: 'numeric',
                  placeholder: 'HH:mm',
                  'aria-invalid': error.value ? true : undefined,
                  onInput: (event: Event) => commitTime('end', (event.target as HTMLInputElement).value),
                }),
              ]),
            ])
          : null,
        error.value ? h('p', { class: 'wpl-field-error', role: 'alert' }, error.value) : null,
        open.value
          ? h(Calendar, {
              calendar: props.calendar,
              locale: locale.value,
              min: props.min ? parseIsoDate(props.min) : null,
              max: props.max ? parseIsoDate(props.max) : null,
              rangeStart: startDate,
              rangeEnd: endDate,
              'onUpdate:modelValue': pick,
            })
          : null,
        h('p', { class: 'wpl-field-hint' }, hint),
      ]);
    };
  },
});
