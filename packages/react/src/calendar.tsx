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
import { useId, useState } from 'react';
import { IconButton } from './button.tsx';
import { Icon } from './icon.tsx';
import { useWhitePlumeria } from './provider.tsx';

export function Calendar({
  value,
  onValueChange,
  calendar = 'gregory',
  locale,
  min,
  max,
  rangeStart = null,
  rangeEnd = null,
}: {
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
  const activeLocale = locale ?? context.locale;
  const { t } = context;
  const [anchor, setAnchor] = useState(value ?? new Date());
  const grid = buildMonthGrid({ anchor, calendar, locale: activeLocale, min, max });
  const today = new Date();

  return (
    <div className="wpl-calendar">
      <div className="wpl-calendar-head">
        <IconButton label={t('previous')} onClick={() => setAnchor(addMonths(anchor, -1, calendar))}>
          <Icon name="chevronLeft" />
        </IconButton>
        <strong>{grid.title}</strong>
        <IconButton label={t('next')} onClick={() => setAnchor(addMonths(anchor, 1, calendar))}>
          <Icon name="chevronRight" />
        </IconButton>
      </div>
      <div className="wpl-calendar-grid" role="grid" aria-label={grid.title}>
        {grid.weekdays.map((day) => (
          <div key={day} className="wpl-calendar-weekday" role="columnheader">
            {day}
          </div>
        ))}
        {grid.cells.map((cell) => (
          <button
            key={cell.key + (cell.inMonth ? '' : '-out')}
            type="button"
            role="gridcell"
            className={calendarDayClass({ inMonth: cell.inMonth, date: cell.date, rangeStart, rangeEnd })}
            disabled={cell.disabled}
            aria-selected={
              (value && sameDay(value, cell.date)) ||
              (rangeStart && sameDay(rangeStart, cell.date)) ||
              (rangeEnd && sameDay(rangeEnd, cell.date))
                ? true
                : undefined
            }
            aria-current={sameDay(today, cell.date) ? 'date' : undefined}
            aria-label={cell.label}
            onClick={() => onValueChange?.(cell.date)}
          >
            {formatNumber(toParts(cell.date, calendar).day, activeLocale)}
          </button>
        ))}
      </div>
    </div>
  );
}

export function DatePicker({
  label,
  value = '',
  onValueChange,
  calendar = 'gregory',
  min,
  max,
  showTime = false,
  time = '',
  onTimeChange,
  defaultOpen = false,
}: {
  label: string;
  value?: string;
  onValueChange?: (value: string) => void;
  calendar?: CalendarSystem;
  min?: string;
  max?: string;
  showTime?: boolean;
  time?: string;
  onTimeChange?: (time: string) => void;
  defaultOpen?: boolean;
}) {
  const id = useId();
  const timeId = useId();
  const { t, locale } = useWhitePlumeria();
  const [open, setOpen] = useState(defaultOpen);
  const [text, setText] = useState(value);
  const [timeText, setTimeText] = useState(time);
  const [error, setError] = useState('');
  const selected = parseIsoDate(value || text);
  const minDate = min ? parseIsoDate(min) ?? undefined : undefined;
  const maxDate = max ? parseIsoDate(max) ?? undefined : undefined;

  function commit(next: string) {
    setText(next);
    if (!next) {
      setError('');
      onValueChange?.('');
      return;
    }
    const parsed = parseIsoDate(next);
    if (!parsed) {
      setError(t('invalidDate'));
      return;
    }
    setError('');
    onValueChange?.(next);
  }

  function commitTime(next: string) {
    setTimeText(next);
    if (!next) {
      setError('');
      onTimeChange?.('');
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
    onTimeChange?.(stored);
  }

  return (
    <div className="wpl-date">
      <label className="wpl-label" htmlFor={id}>
        {label}
      </label>
      <div className="wpl-flex">
        <input
          id={id}
          className="wpl-input"
          value={text}
          inputMode="numeric"
          placeholder="YYYY-MM-DD"
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${id}-error` : undefined}
          onChange={(event) => commit(event.currentTarget.value)}
        />
        <IconButton label={t('chooseDate')} aria-expanded={open} onClick={() => setOpen((current) => !current)}>
          <Icon name="calendar" />
        </IconButton>
      </div>
      {showTime ? (
        <div className="wpl-field wpl-time">
          <label className="wpl-label" htmlFor={timeId}>
            {t('time')}
          </label>
          <input
            id={timeId}
            className="wpl-input"
            value={timeText}
            inputMode="numeric"
            placeholder="HH:mm"
            aria-invalid={error ? true : undefined}
            onChange={(event) => commitTime(event.currentTarget.value)}
          />
        </div>
      ) : null}
      {error ? (
        <p id={`${id}-error`} className="wpl-field-error" role="alert">
          {error}
        </p>
      ) : null}
      {open ? (
        <Calendar
          value={selected}
          calendar={calendar}
          locale={locale}
          min={minDate}
          max={maxDate}
          onValueChange={(date) => {
            const iso = toIsoDate(date);
            commit(iso);
            setOpen(false);
          }}
        />
      ) : null}
      <p className="wpl-field-hint">
        {selected
          ? `${formatDate(selected, locale, { dateStyle: 'full' }, calendar)}${showTime && timeText && parseTimeValue(timeText) ? `, ${timeText}` : ''}`
          : t('chooseDate')}
      </p>
    </div>
  );
}

export type { DateRangeValue, DateTimeRangeValue };

export function DateRangePicker({
  label,
  start = '',
  end = '',
  startTime = '',
  endTime = '',
  showTime = false,
  onValueChange,
  calendar = 'gregory',
  min,
  max,
  defaultOpen = false,
}: {
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
  defaultOpen?: boolean;
}) {
  const startId = useId();
  const endId = useId();
  const startTimeId = useId();
  const endTimeId = useId();
  const { t, locale } = useWhitePlumeria();
  const [open, setOpen] = useState(defaultOpen);
  const [startText, setStartText] = useState(start);
  const [endText, setEndText] = useState(end);
  const [startTimeText, setStartTimeText] = useState(startTime);
  const [endTimeText, setEndTimeText] = useState(endTime);
  const [error, setError] = useState('');
  const [awaitingEnd, setAwaitingEnd] = useState(false);
  const minDate = min ? parseIsoDate(min) ?? undefined : undefined;
  const maxDate = max ? parseIsoDate(max) ?? undefined : undefined;
  const startDate = parseIsoDate(startText);
  const endDate = parseIsoDate(endText);

  function emit(nextStart: string, nextEnd: string, nextStartTime = startTimeText, nextEndTime = endTimeText) {
    if (showTime && ((nextStartTime && !parseTimeValue(nextStartTime)) || (nextEndTime && !parseTimeValue(nextEndTime)))) {
      setError(t('invalidTime'));
      return;
    }
    if (!showTime) {
      const ordered = nextStart && nextEnd ? orderDateRange(nextStart, nextEnd) : { start: nextStart, end: nextEnd };
      setStartText(ordered.start);
      setEndText(ordered.end);
      setError('');
      onValueChange?.(ordered);
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
    onValueChange?.(ordered);
  }

  function commit(which: 'start' | 'end', next: string) {
    const nextStart = which === 'start' ? next : startText;
    const nextEnd = which === 'end' ? next : endText;
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
    emit(startText, endText, which === 'start' ? next : startTimeText, which === 'end' ? next : endTimeText);
  }

  function pick(date: Date) {
    const iso = toIsoDate(date);
    if (!awaitingEnd || !startText || endText) {
      setStartText(iso);
      setEndText('');
      if (showTime) setEndTimeText('');
      setAwaitingEnd(true);
      setError('');
      onValueChange?.(showTime ? { start: iso, end: '', startTime: startTimeText, endTime: '' } : { start: iso, end: '' });
      return;
    }
    emit(startText, iso);
    setAwaitingEnd(false);
    setOpen(false);
  }

  function dated(date: Date, timeValue: string) {
    const label = formatDate(date, locale, { dateStyle: 'medium' }, calendar);
    return showTime && parseTimeValue(timeValue) ? `${label}, ${timeValue}` : label;
  }
  const hint =
    startDate && endDate
      ? `${dated(startDate, startTimeText)} – ${dated(endDate, endTimeText)}`
      : startDate
        ? dated(startDate, startTimeText)
        : t('chooseDate');

  return (
    <div className="wpl-date">
      <span className="wpl-label">{label}</span>
      <div className="wpl-date-row">
        <div className="wpl-field">
          <label className="wpl-label" htmlFor={startId}>
            {t('startDate')}
          </label>
          <input
            id={startId}
            className="wpl-input"
            value={startText}
            inputMode="numeric"
            placeholder="YYYY-MM-DD"
            aria-invalid={error ? true : undefined}
            onChange={(event) => commit('start', event.currentTarget.value)}
          />
        </div>
        <div className="wpl-field">
          <label className="wpl-label" htmlFor={endId}>
            {t('endDate')}
          </label>
          <input
            id={endId}
            className="wpl-input"
            value={endText}
            inputMode="numeric"
            placeholder="YYYY-MM-DD"
            aria-invalid={error ? true : undefined}
            onChange={(event) => commit('end', event.currentTarget.value)}
          />
        </div>
        <IconButton label={t('chooseDate')} aria-expanded={open} onClick={() => setOpen((current) => !current)}>
          <Icon name="calendar" />
        </IconButton>
      </div>
      {showTime ? (
        <div className="wpl-date-row">
          <div className="wpl-field wpl-time">
            <label className="wpl-label" htmlFor={startTimeId}>
              {t('startTime')}
            </label>
            <input
              id={startTimeId}
              className="wpl-input"
              value={startTimeText}
              inputMode="numeric"
              placeholder="HH:mm"
              aria-invalid={error ? true : undefined}
              onChange={(event) => commitTime('start', event.currentTarget.value)}
            />
          </div>
          <div className="wpl-field wpl-time">
            <label className="wpl-label" htmlFor={endTimeId}>
              {t('endTime')}
            </label>
            <input
              id={endTimeId}
              className="wpl-input"
              value={endTimeText}
              inputMode="numeric"
              placeholder="HH:mm"
              aria-invalid={error ? true : undefined}
              onChange={(event) => commitTime('end', event.currentTarget.value)}
            />
          </div>
        </div>
      ) : null}
      {error ? (
        <p className="wpl-field-error" role="alert">
          {error}
        </p>
      ) : null}
      {open ? (
        <Calendar
          calendar={calendar}
          locale={locale}
          min={minDate}
          max={maxDate}
          rangeStart={startDate}
          rangeEnd={endDate}
          onValueChange={pick}
        />
      ) : null}
      <p className="wpl-field-hint">{hint}</p>
    </div>
  );
}
