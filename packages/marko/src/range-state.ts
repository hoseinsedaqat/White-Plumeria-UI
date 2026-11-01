import {
  message,
  orderDateRange,
  parseIsoDate,
  toIsoDate,
  type Locale,
} from '@white-plumeria/core';

export interface RangeCommit {
  start: string;
  end: string;
  error: string;
  ok: boolean;
}

export function commitRange(
  which: 'start' | 'end',
  next: string,
  start: string,
  end: string,
  locale: Locale = 'en',
): RangeCommit {
  let nextStart = which === 'start' ? next : start;
  let nextEnd = which === 'end' ? next : end;
  if ((nextStart && !parseIsoDate(nextStart)) || (nextEnd && !parseIsoDate(nextEnd))) {
    return { start: nextStart, end: nextEnd, error: message(locale, 'invalidDate'), ok: false };
  }
  if (nextStart && nextEnd) {
    const ordered = orderDateRange(nextStart, nextEnd);
    nextStart = ordered.start;
    nextEnd = ordered.end;
  }
  return { start: nextStart, end: nextEnd, error: '', ok: true };
}

export function pickRange(
  date: Date,
  start: string,
  end: string,
  locale: Locale = 'en',
): RangeCommit & { anchor: Date } {
  const iso = toIsoDate(date);
  if (!start || end) {
    return { start: iso, end: '', error: '', ok: true, anchor: date };
  }
  return { ...commitRange('end', iso, start, end, locale), anchor: date };
}
