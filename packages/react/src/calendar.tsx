import {
  addMonths,
  buildMonthGrid,
  calendarDayClass,
  formatDate,
  formatNumber,
  orderDateRange,
  parseIsoDate,
  sameDay,
  toIsoDate,
  toParts,
  type CalendarSystem,
  type DateRangeValue,
} from '@white-plumeria/core';
import { useId, useState } from 'react';
import { IconButton } from './button.tsx';
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
          ‹
        </IconButton>
        <strong>{grid.title}</strong>
        <IconButton label={t('next')} onClick={() => setAnchor(addMonths(anchor, 1, calendar))}>
          ›
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
}: {
  label: string;
  value?: string;
  onValueChange?: (value: string) => void;
  calendar?: CalendarSystem;
  min?: string;
  max?: string;
}) {
  const id = useId();
  const { t, locale } = useWhitePlumeria();
  const [open, setOpen] = useState(false);
  const [text, setText] = useState(value);
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
        <IconButton label={t('chooseDate')} onClick={() => setOpen((current) => !current)}>
          ▦
        </IconButton>
      </div>
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
          ? formatDate(selected, locale, { dateStyle: 'full' }, calendar)
          : t('chooseDate')}
      </p>
    </div>
  );
}

export type { DateRangeValue };

export function DateRangePicker({
  label,
  start = '',
  end = '',
  onValueChange,
  calendar = 'gregory',
  min,
  max,
}: {
  label: string;
  start?: string;
  end?: string;
  onValueChange?: (value: DateRangeValue) => void;
  calendar?: CalendarSystem;
  min?: string;
  max?: string;
}) {
  const startId = useId();
  const endId = useId();
  const { t, locale } = useWhitePlumeria();
  const [open, setOpen] = useState(false);
  const [startText, setStartText] = useState(start);
  const [endText, setEndText] = useState(end);
  const [error, setError] = useState('');
  const [awaitingEnd, setAwaitingEnd] = useState(false);
  const minDate = min ? parseIsoDate(min) ?? undefined : undefined;
  const maxDate = max ? parseIsoDate(max) ?? undefined : undefined;
  const startDate = parseIsoDate(startText);
  const endDate = parseIsoDate(endText);

  function emit(nextStart: string, nextEnd: string) {
    const ordered = nextStart && nextEnd ? orderDateRange(nextStart, nextEnd) : { start: nextStart, end: nextEnd };
    setStartText(ordered.start);
    setEndText(ordered.end);
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

  function pick(date: Date) {
    const iso = toIsoDate(date);
    if (!awaitingEnd || !startText || endText) {
      setStartText(iso);
      setEndText('');
      setAwaitingEnd(true);
      setError('');
      onValueChange?.({ start: iso, end: '' });
      return;
    }
    emit(startText, iso);
    setAwaitingEnd(false);
    setOpen(false);
  }

  const hint =
    startDate && endDate
      ? `${formatDate(startDate, locale, { dateStyle: 'medium' }, calendar)} – ${formatDate(endDate, locale, { dateStyle: 'medium' }, calendar)}`
      : startDate
        ? formatDate(startDate, locale, { dateStyle: 'medium' }, calendar)
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
          ▦
        </IconButton>
      </div>
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
