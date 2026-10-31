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
import { createSignal , createUniqueId } from 'solid-js';
import { IconButton } from './button.tsx';
import { Icon } from './icon.tsx';
import { useWhitePlumeria } from './provider.tsx';

export function Calendar(props: {
  value?: Date | null;
  onValueChange?: (value: Date) => void;
  calendar?: CalendarSystem;
  locale?: 'en' | 'fa';
  min?: Date;
  max?: Date;
  rangeStart?: Date | null;
  rangeEnd?: Date | null;
}) {
  const context = useWhitePlumeria();
  const activeLocale = () => props.locale ?? context.locale();
  const calendar = () => props.calendar ?? 'gregory';
  const { t } = context;
  const [anchor, setAnchor] = createSignal(props.value ?? new Date());
  const grid = () => buildMonthGrid({ anchor: anchor(), calendar: calendar(), locale: activeLocale(), min: props.min, max: props.max });
  const today = new Date();

  return (
    <div class="wpl-calendar">
      <div class="wpl-calendar-head">
        <IconButton label={t('previous')} onClick={() => setAnchor(addMonths(anchor(), -1, calendar()))}>
          <Icon name="chevronLeft" />
        </IconButton>
        <strong>{grid().title}</strong>
        <IconButton label={t('next')} onClick={() => setAnchor(addMonths(anchor(), 1, calendar()))}>
          <Icon name="chevronRight" />
        </IconButton>
      </div>
      <div class="wpl-calendar-grid" role="grid" aria-label={grid().title}>
        {grid().weekdays.map((day) => (
          <div class="wpl-calendar-weekday" role="columnheader">
            {day}
          </div>
        ))}
        {grid().cells.map((cell) => (
          <button
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
            onClick={() => props.onValueChange?.(cell.date)}
          >
            {formatNumber(toParts(cell.date, calendar()).day, activeLocale())}
          </button>
        ))}
      </div>
    </div>
  );
}

export function DatePicker(props: {
  label: string;
  value?: string;
  onValueChange?: (value: string) => void;
  calendar?: CalendarSystem;
  min?: string;
  max?: string;
  showTime?: boolean;
  time?: string;
  onTimeChange?: (time: string) => void;
}) {
  const id = createUniqueId();
  const timeId = createUniqueId();
  const { t, locale } = useWhitePlumeria();
  const [open, setOpen] = createSignal(false);
  const [text, setText] = createSignal(props.value ?? '');
  const [timeText, setTimeText] = createSignal(props.time ?? '');
  const [error, setError] = createSignal('');
  const selected = () => parseIsoDate(props.value || text());
  const minDate = () => (props.min ? (parseIsoDate(props.min) ?? undefined) : undefined);
  const maxDate = () => (props.max ? (parseIsoDate(props.max) ?? undefined) : undefined);
  const calendar = () => props.calendar ?? 'gregory';

  function commit(next: string) {
    setText(next);
    if (!next) {
      setError('');
      props.onValueChange?.('');
      return;
    }
    const parsed = parseIsoDate(next);
    if (!parsed) {
      setError(t('invalidDate'));
      return;
    }
    setError('');
    props.onValueChange?.(next);
  }

  function commitTime(next: string) {
    setTimeText(next);
    if (!next) {
      setError('');
      props.onTimeChange?.('');
      return;
    }
    const parsed = parseTimeValue(next);
    if (!parsed) {
      setError(t('invalidTime'));
      return;
    }
    const stored = `${String(parsed.hours).padStart(2, '0')}:${String(parsed.minutes).padStart(2, '0')}`;
    setTimeText(stored);
    setError('');
    props.onTimeChange?.(stored);
  }

  return (
    <div class="wpl-date">
      <label class="wpl-label" for={id}>
        {props.label}
      </label>
      <div class="wpl-flex">
        <input
          id={id}
          class="wpl-input"
          value={props.value ?? text()}
          inputmode="numeric"
          placeholder="YYYY-MM-DD"
          aria-invalid={error() ? true : undefined}
          aria-describedby={error() ? `${id}-error` : undefined}
          onInput={(event) => commit(event.currentTarget.value)}
        />
        <IconButton label={t('chooseDate')} onClick={() => setOpen((current) => !current)}>
          <Icon name="calendar" />
        </IconButton>
      </div>
      {props.showTime ? (
        <div class="wpl-field wpl-time">
          <label class="wpl-label" for={timeId}>
            {t('time')}
          </label>
          <input
            id={timeId}
            class="wpl-input"
            value={props.time ?? timeText()}
            inputmode="numeric"
            placeholder="HH:mm"
            aria-invalid={error() ? true : undefined}
            onInput={(event) => commitTime(event.currentTarget.value)}
          />
        </div>
      ) : null}
      {error() ? (
        <p id={`${id}-error`} class="wpl-field-error" role="alert">
          {error()}
        </p>
      ) : null}
      {open() ? (
        <Calendar
          value={selected()}
          calendar={calendar()}
          locale={locale()}
          min={minDate()}
          max={maxDate()}
          onValueChange={(date) => {
            commit(toIsoDate(date));
            setOpen(false);
          }}
        />
      ) : null}
      <p class="wpl-field-hint">
        {selected()
          ? `${formatDate(selected()!, locale(), { dateStyle: 'full' }, calendar())}${props.showTime && timeText() && parseTimeValue(timeText()) ? `, ${timeText()}` : ''}`
          : t('chooseDate')}
      </p>
    </div>
  );
}

export type { DateRangeValue, DateTimeRangeValue };

export function DateRangePicker(props: {
  label: string;
  start?: string;
  end?: string;
  startTime?: string;
  endTime?: string;
  showTime?: boolean;
  onValueChange?: (value: DateRangeValue | DateTimeRangeValue) => void;
  calendar?: CalendarSystem;
  min?: string;
  max?: string;
}) {
  const startId = createUniqueId();
  const endId = createUniqueId();
  const startTimeId = createUniqueId();
  const endTimeId = createUniqueId();
  const { t, locale } = useWhitePlumeria();
  const [open, setOpen] = createSignal(false);
  const [startText, setStartText] = createSignal(props.start ?? '');
  const [endText, setEndText] = createSignal(props.end ?? '');
  const [startTimeText, setStartTimeText] = createSignal(props.startTime ?? '');
  const [endTimeText, setEndTimeText] = createSignal(props.endTime ?? '');
  const [error, setError] = createSignal('');
  const [awaitingEnd, setAwaitingEnd] = createSignal(false);
  const calendar = () => props.calendar ?? 'gregory';
  const minDate = () => (props.min ? (parseIsoDate(props.min) ?? undefined) : undefined);
  const maxDate = () => (props.max ? (parseIsoDate(props.max) ?? undefined) : undefined);
  const startDate = () => parseIsoDate(startText());
  const endDate = () => parseIsoDate(endText());

  function emit(nextStart: string, nextEnd: string, nextStartTime = startTimeText(), nextEndTime = endTimeText()) {
    if (props.showTime && ((nextStartTime && !parseTimeValue(nextStartTime)) || (nextEndTime && !parseTimeValue(nextEndTime)))) {
      setError(t('invalidTime'));
      return;
    }
    if (!props.showTime) {
      const ordered = nextStart && nextEnd ? orderDateRange(nextStart, nextEnd) : { start: nextStart, end: nextEnd };
      setStartText(ordered.start);
      setEndText(ordered.end);
      setError('');
      props.onValueChange?.(ordered);
      return;
    }
    const ordered = orderDateTimeRange({
      start: nextStart,
      end: nextEnd,
      startTime: nextStartTime,
      endTime: nextEndTime,
    });
    setStartText(ordered.start);
    setEndText(ordered.end);
    setStartTimeText(ordered.startTime);
    setEndTimeText(ordered.endTime);
    setError('');
    props.onValueChange?.(ordered);
  }

  function commit(which: 'start' | 'end', next: string) {
    const nextStart = which === 'start' ? next : startText();
    const nextEnd = which === 'end' ? next : endText();
    if (which === 'start') setStartText(next);
    else setEndText(next);
    if ((nextStart && !parseIsoDate(nextStart)) || (nextEnd && !parseIsoDate(nextEnd))) {
      setError(t('invalidDate'));
      return;
    }
    emit(nextStart, nextEnd);
  }

  function commitTime(which: 'start' | 'end', next: string) {
    if (which === 'start') setStartTimeText(next);
    else setEndTimeText(next);
    if (next && !parseTimeValue(next)) {
      setError(t('invalidTime'));
      return;
    }
    emit(startText(), endText(), which === 'start' ? next : startTimeText(), which === 'end' ? next : endTimeText());
  }

  function pick(date: Date) {
    const iso = toIsoDate(date);
    if (!awaitingEnd() || !startText() || endText()) {
      setStartText(iso);
      setEndText('');
      if (props.showTime) setEndTimeText('');
      setAwaitingEnd(true);
      setError('');
      props.onValueChange?.(props.showTime ? { start: iso, end: '', startTime: startTimeText(), endTime: '' } : { start: iso, end: '' });
      return;
    }
    emit(startText(), iso);
    setAwaitingEnd(false);
    setOpen(false);
  }

  function dated(date: Date, timeValue: string) {
    const label = formatDate(date, locale(), { dateStyle: 'medium' }, calendar());
    return props.showTime && parseTimeValue(timeValue) ? `${label}, ${timeValue}` : label;
  }

  const hint = () => {
    const start = startDate();
    const end = endDate();
    if (start && end) return `${dated(start, startTimeText())} – ${dated(end, endTimeText())}`;
    if (start) return dated(start, startTimeText());
    return t('chooseDate');
  };

  return (
    <div class="wpl-date">
      <span class="wpl-label">{props.label}</span>
      <div class="wpl-date-row">
        <div class="wpl-field">
          <label class="wpl-label" for={startId}>
            {t('startDate')}
          </label>
          <input
            id={startId}
            class="wpl-input"
            value={startText()}
            inputmode="numeric"
            placeholder="YYYY-MM-DD"
            aria-invalid={error() ? true : undefined}
            onInput={(event) => commit('start', event.currentTarget.value)}
          />
        </div>
        <div class="wpl-field">
          <label class="wpl-label" for={endId}>
            {t('endDate')}
          </label>
          <input
            id={endId}
            class="wpl-input"
            value={endText()}
            inputmode="numeric"
            placeholder="YYYY-MM-DD"
            aria-invalid={error() ? true : undefined}
            onInput={(event) => commit('end', event.currentTarget.value)}
          />
        </div>
        <IconButton label={t('chooseDate')} aria-expanded={open()} onClick={() => setOpen((current) => !current)}>
          <Icon name="calendar" />
        </IconButton>
      </div>
      {props.showTime ? (
        <div class="wpl-date-row">
          <div class="wpl-field wpl-time">
            <label class="wpl-label" for={startTimeId}>
              {t('startTime')}
            </label>
            <input
              id={startTimeId}
              class="wpl-input"
              value={startTimeText()}
              inputmode="numeric"
              placeholder="HH:mm"
              aria-invalid={error() ? true : undefined}
              onInput={(event) => commitTime('start', event.currentTarget.value)}
            />
          </div>
          <div class="wpl-field wpl-time">
            <label class="wpl-label" for={endTimeId}>
              {t('endTime')}
            </label>
            <input
              id={endTimeId}
              class="wpl-input"
              value={endTimeText()}
              inputmode="numeric"
              placeholder="HH:mm"
              aria-invalid={error() ? true : undefined}
              onInput={(event) => commitTime('end', event.currentTarget.value)}
            />
          </div>
        </div>
      ) : null}
      {error() ? (
        <p class="wpl-field-error" role="alert">
          {error()}
        </p>
      ) : null}
      {open() ? (
        <Calendar
          calendar={calendar()}
          locale={locale()}
          min={minDate()}
          max={maxDate()}
          rangeStart={startDate()}
          rangeEnd={endDate()}
          onValueChange={pick}
        />
      ) : null}
      <p class="wpl-field-hint">{hint()}</p>
    </div>
  );
}
