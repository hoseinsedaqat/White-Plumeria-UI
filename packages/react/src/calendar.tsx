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
}: {
  value?: Date | null;
  onValueChange?: (value: Date) => void;
  calendar?: CalendarSystem;
  locale?: 'en' | 'fa';
  min?: Date;
  max?: Date;
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
            className={cell.inMonth ? 'wpl-day' : 'wpl-day wpl-day-outside'}
            disabled={cell.disabled}
            aria-selected={value ? sameDay(value, cell.date) : undefined}
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
      setError(locale === 'fa' ? 'تاریخ باید به شکل YYYY-MM-DD باشد.' : 'Use an ISO date: YYYY-MM-DD.');
      return;
    }
    setError('');
    onValueChange?.(next);
  }

  return (
    <div className="wpl-field">
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
            const iso = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
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
