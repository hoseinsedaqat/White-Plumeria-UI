import {
  addMonths,
  buildMonthGrid,
  formatDate,
  formatNumber,
  parseIsoDate,
  sameDay,
  toParts,
  type CalendarSystem,
} from '@white-plumeria/core';
import { defineComponent, h, ref, useId, type PropType } from 'vue';
import { IconButton } from './button.ts';
import { useWhitePlumeria } from './provider.ts';

export const Calendar = defineComponent({
  name: 'Calendar',
  props: {
    modelValue: { type: Date as PropType<Date | null>, default: null },
    calendar: { type: String as PropType<CalendarSystem>, default: 'gregory' },
    locale: { type: String as PropType<'en' | 'fa' | ''>, default: '' },
    min: { type: Date as PropType<Date | null>, default: null },
    max: { type: Date as PropType<Date | null>, default: null },
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
          h(IconButton, { label: context.t('previous'), onClick: () => (anchor.value = addMonths(anchor.value, -1, props.calendar)) }, () => '‹'),
          h('strong', grid.title),
          h(IconButton, { label: context.t('next'), onClick: () => (anchor.value = addMonths(anchor.value, 1, props.calendar)) }, () => '›'),
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
                  class: cell.inMonth ? 'wpl-day' : 'wpl-day wpl-day-outside',
                  disabled: cell.disabled,
                  'aria-selected': props.modelValue ? sameDay(props.modelValue, cell.date) : undefined,
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
  },
  emits: ['update:modelValue'],
  setup(props, { emit }) {
    const id = useId();
    const { t, locale } = useWhitePlumeria();
    const open = ref(false);
    const text = ref(props.modelValue);
    const error = ref('');
    function commit(next: string) {
      text.value = next;
      if (!next) {
        error.value = '';
        emit('update:modelValue', '');
        return;
      }
      if (!parseIsoDate(next)) {
        error.value = locale.value === 'fa' ? 'تاریخ باید به شکل YYYY-MM-DD باشد.' : 'Use an ISO date: YYYY-MM-DD.';
        return;
      }
      error.value = '';
      emit('update:modelValue', next);
    }
    return () => {
      const selected = parseIsoDate(props.modelValue || text.value);
      return h('div', { class: 'wpl-field' }, [
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
          h(IconButton, { label: t('chooseDate'), onClick: () => (open.value = !open.value) }, () => '▦'),
        ]),
        error.value ? h('p', { id: `${id}-error`, class: 'wpl-field-error', role: 'alert' }, error.value) : null,
        open.value
          ? h(Calendar, {
              modelValue: selected,
              calendar: props.calendar,
              locale: locale.value,
              min: props.min ? parseIsoDate(props.min) : null,
              max: props.max ? parseIsoDate(props.max) : null,
              'onUpdate:modelValue': (date: Date) => {
                const iso = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
                commit(iso);
                open.value = false;
              },
            })
          : null,
        h(
          'p',
          { class: 'wpl-field-hint' },
          selected ? formatDate(selected, locale.value, { dateStyle: 'full' }, props.calendar) : t('chooseDate'),
        ),
      ]);
    };
  },
});
