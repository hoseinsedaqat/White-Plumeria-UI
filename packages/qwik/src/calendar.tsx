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
import { component$, useId, useSignal, type QRL } from '@qwik.dev/core';
import { IconButton } from './button';
import { useWhitePlumeria } from './provider';

export type { DateRangeValue, DateTimeRangeValue };

function applyRange(
  showTime: boolean,
  nextStart: string,
  nextEnd: string,
  nextStartTime: string,
  nextEndTime: string,
  invalidDate: string,
  invalidTime: string,
): { ok: false; error: string } | { ok: true; value: DateRangeValue | DateTimeRangeValue } {
  if ((nextStart && !parseIsoDate(nextStart)) || (nextEnd && !parseIsoDate(nextEnd))) return { ok: false, error: invalidDate };
  if (showTime && ((nextStartTime && !parseTimeValue(nextStartTime)) || (nextEndTime && !parseTimeValue(nextEndTime)))) {
    return { ok: false, error: invalidTime };
  }
  if (!showTime) {
    const ordered = nextStart && nextEnd ? orderDateRange(nextStart, nextEnd) : { start: nextStart, end: nextEnd };
    return { ok: true, value: ordered };
  }
  return {
    ok: true,
    value: orderDateTimeRange({ start: nextStart, end: nextEnd, startTime: nextStartTime, endTime: nextEndTime }),
  };
}

export const Calendar = component$<{
  value?: Date | null;
  calendar?: CalendarSystem;
  locale?: 'en' | 'fa';
  min?: Date;
  max?: Date;
  rangeStart?: Date | null;
  rangeEnd?: Date | null;
  onValueChange$?: QRL<(value: Date) => void>;
}>((props) => {
  const context = useWhitePlumeria();
  const activeLocale = props.locale ?? context.locale;
  const anchor = useSignal(props.value ?? new Date());
  const calendar = props.calendar ?? 'gregory';
  const grid = buildMonthGrid({ anchor: anchor.value, calendar, locale: activeLocale, min: props.min, max: props.max });
  const today = new Date();
  return (
    <div class="wpl-calendar">
      <div class="wpl-calendar-head">
        <IconButton label={context.t('previous')} onClick$={() => { anchor.value = addMonths(anchor.value, -1, calendar); }}>‹</IconButton>
        <strong>{grid.title}</strong>
        <IconButton label={context.t('next')} onClick$={() => { anchor.value = addMonths(anchor.value, 1, calendar); }}>›</IconButton>
      </div>
      <div class="wpl-calendar-grid" role="grid" aria-label={grid.title}>
        {grid.weekdays.map((day) => (
          <div key={day} class="wpl-calendar-weekday" role="columnheader">{day}</div>
        ))}
        {grid.cells.map((cell) => (
          <button
            key={cell.key + (cell.inMonth ? '' : '-out')}
            type="button"
            role="gridcell"
            class={calendarDayClass({ inMonth: cell.inMonth, date: cell.date, rangeStart: props.rangeStart, rangeEnd: props.rangeEnd })}
            disabled={cell.disabled}
            aria-selected={
              (props.value && sameDay(props.value, cell.date)) ||
              (props.rangeStart && sameDay(props.rangeStart, cell.date)) ||
              (props.rangeEnd && sameDay(props.rangeEnd, cell.date))
                ? true
                : undefined
            }
            aria-current={sameDay(today, cell.date) ? 'date' : undefined}
            aria-label={cell.label}
            onClick$={() => { void props.onValueChange$?.(cell.date); }}
          >
            {formatNumber(toParts(cell.date, calendar).day, activeLocale)}
          </button>
        ))}
      </div>
    </div>
  );
});

export const DatePicker = component$<{
  label: string;
  value?: string;
  calendar?: CalendarSystem;
  min?: string;
  max?: string;
  showTime?: boolean;
  time?: string;
  onValueChange$?: QRL<(value: string) => void>;
  onTimeChange$?: QRL<(time: string) => void>;
}>((props) => {
  const id = useId();
  const timeId = useId();
  const wpl = useWhitePlumeria();
  const open = useSignal(false);
  const text = useSignal(props.value ?? '');
  const timeText = useSignal(props.time ?? '');
  const error = useSignal('');
  const calendar = props.calendar ?? 'gregory';
  const selected = parseIsoDate(props.value || text.value);
  const minDate = props.min ? parseIsoDate(props.min) ?? undefined : undefined;
  const maxDate = props.max ? parseIsoDate(props.max) ?? undefined : undefined;

  return (
    <div class="wpl-date">
      <label class="wpl-label" for={id}>{props.label}</label>
      <div class="wpl-flex">
        <input
          id={id}
          class="wpl-input"
          value={text.value}
          inputMode="numeric"
          placeholder="YYYY-MM-DD"
          aria-invalid={error.value ? true : undefined}
          aria-describedby={error.value ? `${id}-error` : undefined}
          onInput$={(_, element) => {
            const next = element.value;
            text.value = next;
            if (!next) {
              error.value = '';
              void props.onValueChange$?.('');
              return;
            }
            if (!parseIsoDate(next)) {
              error.value = wpl.t('invalidDate');
              return;
            }
            error.value = '';
            void props.onValueChange$?.(next);
          }}
        />
        <IconButton label={wpl.t('chooseDate')} onClick$={() => { open.value = !open.value; }}>▦</IconButton>
      </div>
      {props.showTime ? (
        <div class="wpl-field wpl-time">
          <label class="wpl-label" for={timeId}>{wpl.t('time')}</label>
          <input
            id={timeId}
            class="wpl-input"
            value={timeText.value}
            inputMode="numeric"
            placeholder="HH:mm"
            aria-invalid={error.value ? true : undefined}
            onInput$={(_, element) => {
              const next = element.value;
              timeText.value = next;
              if (!next) {
                error.value = '';
                void props.onTimeChange$?.('');
                return;
              }
              const parsed = parseTimeValue(next);
              if (!parsed) {
                error.value = wpl.t('invalidTime');
                return;
              }
              const stored = `${String(parsed.hours).padStart(2, '0')}:${String(parsed.minutes).padStart(2, '0')}`;
              timeText.value = stored;
              error.value = '';
              void props.onTimeChange$?.(stored);
            }}
          />
        </div>
      ) : null}
      {error.value ? <p id={`${id}-error`} class="wpl-field-error" role="alert">{error.value}</p> : null}
      {open.value ? (
        <Calendar
          value={selected}
          calendar={calendar}
          locale={wpl.locale}
          min={minDate}
          max={maxDate}
          onValueChange$={(date) => {
            const iso = toIsoDate(date);
            text.value = iso;
            error.value = '';
            open.value = false;
            void props.onValueChange$?.(iso);
          }}
        />
      ) : null}
      <p class="wpl-field-hint">
        {selected
          ? `${formatDate(selected, wpl.locale, { dateStyle: 'full' }, calendar)}${props.showTime && timeText.value && parseTimeValue(timeText.value) ? `, ${timeText.value}` : ''}`
          : wpl.t('chooseDate')}
      </p>
    </div>
  );
});

export const DateRangePicker = component$<{
  label: string;
  start?: string;
  end?: string;
  startTime?: string;
  endTime?: string;
  showTime?: boolean;
  calendar?: CalendarSystem;
  min?: string;
  max?: string;
  onValueChange$?: QRL<(value: DateRangeValue | DateTimeRangeValue) => void>;
}>((props) => {
  const startId = useId();
  const endId = useId();
  const startTimeId = useId();
  const endTimeId = useId();
  const wpl = useWhitePlumeria();
  const open = useSignal(false);
  const startText = useSignal(props.start ?? '');
  const endText = useSignal(props.end ?? '');
  const startTimeText = useSignal(props.startTime ?? '');
  const endTimeText = useSignal(props.endTime ?? '');
  const error = useSignal('');
  const awaitingEnd = useSignal(false);
  const calendar = props.calendar ?? 'gregory';
  const minDate = props.min ? parseIsoDate(props.min) ?? undefined : undefined;
  const maxDate = props.max ? parseIsoDate(props.max) ?? undefined : undefined;
  const startDate = parseIsoDate(startText.value);
  const endDate = parseIsoDate(endText.value);

  const hint = startDate && endDate
    ? `${formatDate(startDate, wpl.locale, { dateStyle: 'medium' }, calendar)}${props.showTime && parseTimeValue(startTimeText.value) ? `, ${startTimeText.value}` : ''} – ${formatDate(endDate, wpl.locale, { dateStyle: 'medium' }, calendar)}${props.showTime && parseTimeValue(endTimeText.value) ? `, ${endTimeText.value}` : ''}`
    : startDate
      ? `${formatDate(startDate, wpl.locale, { dateStyle: 'medium' }, calendar)}${props.showTime && parseTimeValue(startTimeText.value) ? `, ${startTimeText.value}` : ''}`
      : wpl.t('chooseDate');

  return (
    <div class="wpl-date">
      <span class="wpl-label">{props.label}</span>
      <div class="wpl-date-row">
        <div class="wpl-field">
          <label class="wpl-label" for={startId}>{wpl.t('startDate')}</label>
          <input
            id={startId}
            class="wpl-input"
            value={startText.value}
            inputMode="numeric"
            placeholder="YYYY-MM-DD"
            aria-invalid={error.value ? true : undefined}
            onInput$={(_, element) => {
              const result = applyRange(Boolean(props.showTime), element.value, endText.value, startTimeText.value, endTimeText.value, wpl.t('invalidDate'), wpl.t('invalidTime'));
              if (!result.ok) {
                startText.value = element.value;
                error.value = result.error;
                return;
              }
              startText.value = result.value.start;
              endText.value = result.value.end;
              if ('startTime' in result.value) {
                startTimeText.value = result.value.startTime ?? '';
                endTimeText.value = result.value.endTime ?? '';
              }
              error.value = '';
              void props.onValueChange$?.(result.value);
            }}
          />
        </div>
        <div class="wpl-field">
          <label class="wpl-label" for={endId}>{wpl.t('endDate')}</label>
          <input
            id={endId}
            class="wpl-input"
            value={endText.value}
            inputMode="numeric"
            placeholder="YYYY-MM-DD"
            aria-invalid={error.value ? true : undefined}
            onInput$={(_, element) => {
              const result = applyRange(Boolean(props.showTime), startText.value, element.value, startTimeText.value, endTimeText.value, wpl.t('invalidDate'), wpl.t('invalidTime'));
              if (!result.ok) {
                endText.value = element.value;
                error.value = result.error;
                return;
              }
              startText.value = result.value.start;
              endText.value = result.value.end;
              if ('startTime' in result.value) {
                startTimeText.value = result.value.startTime ?? '';
                endTimeText.value = result.value.endTime ?? '';
              }
              error.value = '';
              void props.onValueChange$?.(result.value);
            }}
          />
        </div>
        <IconButton label={wpl.t('chooseDate')} aria-expanded={open.value} onClick$={() => { open.value = !open.value; }}>▦</IconButton>
      </div>
      {props.showTime ? (
        <div class="wpl-date-row">
          <div class="wpl-field wpl-time">
            <label class="wpl-label" for={startTimeId}>{wpl.t('startTime')}</label>
            <input
              id={startTimeId}
              class="wpl-input"
              value={startTimeText.value}
              inputMode="numeric"
              placeholder="HH:mm"
              aria-invalid={error.value ? true : undefined}
              onInput$={(_, element) => {
                const result = applyRange(true, startText.value, endText.value, element.value, endTimeText.value, wpl.t('invalidDate'), wpl.t('invalidTime'));
                startTimeText.value = element.value;
                if (!result.ok) {
                  error.value = result.error;
                  return;
                }
                startText.value = result.value.start;
                endText.value = result.value.end;
                if ('startTime' in result.value) {
                  startTimeText.value = result.value.startTime ?? '';
                  endTimeText.value = result.value.endTime ?? '';
                }
                error.value = '';
                void props.onValueChange$?.(result.value);
              }}
            />
          </div>
          <div class="wpl-field wpl-time">
            <label class="wpl-label" for={endTimeId}>{wpl.t('endTime')}</label>
            <input
              id={endTimeId}
              class="wpl-input"
              value={endTimeText.value}
              inputMode="numeric"
              placeholder="HH:mm"
              aria-invalid={error.value ? true : undefined}
              onInput$={(_, element) => {
                const result = applyRange(true, startText.value, endText.value, startTimeText.value, element.value, wpl.t('invalidDate'), wpl.t('invalidTime'));
                endTimeText.value = element.value;
                if (!result.ok) {
                  error.value = result.error;
                  return;
                }
                startText.value = result.value.start;
                endText.value = result.value.end;
                if ('startTime' in result.value) {
                  startTimeText.value = result.value.startTime ?? '';
                  endTimeText.value = result.value.endTime ?? '';
                }
                error.value = '';
                void props.onValueChange$?.(result.value);
              }}
            />
          </div>
        </div>
      ) : null}
      {error.value ? <p class="wpl-field-error" role="alert">{error.value}</p> : null}
      {open.value ? (
        <Calendar
          calendar={calendar}
          locale={wpl.locale}
          min={minDate}
          max={maxDate}
          rangeStart={startDate}
          rangeEnd={endDate}
          onValueChange$={(date) => {
            const iso = toIsoDate(date);
            if (!awaitingEnd.value || !startText.value || endText.value) {
              startText.value = iso;
              endText.value = '';
              if (props.showTime) endTimeText.value = '';
              awaitingEnd.value = true;
              error.value = '';
              void props.onValueChange$?.(props.showTime
                ? { start: iso, end: '', startTime: startTimeText.value, endTime: '' }
                : { start: iso, end: '' });
              return;
            }
            const result = applyRange(Boolean(props.showTime), startText.value, iso, startTimeText.value, endTimeText.value, wpl.t('invalidDate'), wpl.t('invalidTime'));
            if (result.ok) {
              startText.value = result.value.start;
              endText.value = result.value.end;
              if ('startTime' in result.value) {
                startTimeText.value = result.value.startTime ?? '';
                endTimeText.value = result.value.endTime ?? '';
              }
              error.value = '';
              void props.onValueChange$?.(result.value);
            }
            awaitingEnd.value = false;
            open.value = false;
          }}
        />
      ) : null}
      <p class="wpl-field-hint">{hint}</p>
    </div>
  );
});
