import { formatDate, intlLocale } from './i18n.ts';
import type { Locale } from './theme.ts';

export type CalendarSystem = 'gregory' | 'persian';

export interface DateParts {
  year: number;
  month: number;
  day: number;
}

function div(value: number, by: number): number {
  return Math.trunc(value / by);
}

export function gregorianToJalali(gy: number, gm: number, gd: number): DateParts {
  const daysBefore = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];
  const gy2 = gm > 2 ? gy + 1 : gy;
  let days =
    355666 +
    365 * gy +
    div(gy2 + 3, 4) -
    div(gy2 + 99, 100) +
    div(gy2 + 399, 400) +
    gd +
    (daysBefore[gm - 1] ?? 0);
  let jy = -1595 + 33 * div(days, 12053);
  days %= 12053;
  jy += 4 * div(days, 1461);
  days %= 1461;
  if (days > 365) {
    jy += div(days - 1, 365);
    days = (days - 1) % 365;
  }
  if (days < 186) {
    return { year: jy, month: 1 + div(days, 31), day: 1 + (days % 31) };
  }
  return { year: jy, month: 7 + div(days - 186, 30), day: 1 + ((days - 186) % 30) };
}

export function jalaliToGregorian(jy: number, jm: number, jd: number): DateParts {
  const jy2 = jy + 1595;
  let days =
    -355668 +
    365 * jy2 +
    div(jy2, 33) * 8 +
    div((jy2 % 33) + 3, 4) +
    jd +
    (jm < 7 ? (jm - 1) * 31 : (jm - 7) * 30 + 186);
  let gy = 400 * div(days, 146097);
  days %= 146097;
  if (days > 36524) {
    days -= 1;
    gy += 100 * div(days, 36524);
    days %= 36524;
    if (days >= 365) days += 1;
  }
  gy += 4 * div(days, 1461);
  days %= 1461;
  if (days > 365) {
    gy += div(days - 1, 365);
    days = (days - 1) % 365;
  }
  let gd = days + 1;
  const leap = (gy % 4 === 0 && gy % 100 !== 0) || gy % 400 === 0;
  const monthLengths = [0, 31, leap ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  let gm = 1;
  while (gm <= 12 && gd > (monthLengths[gm] ?? 0)) {
    gd -= monthLengths[gm] ?? 0;
    gm += 1;
  }
  return { year: gy, month: gm, day: gd };
}

export function isJalaliLeap(year: number): boolean {
  const gregorian = jalaliToGregorian(year, 12, 30);
  const back = gregorianToJalali(gregorian.year, gregorian.month, gregorian.day);
  return back.year === year && back.month === 12 && back.day === 30;
}

export function daysInMonth(year: number, month: number, calendar: CalendarSystem): number {
  if (calendar === 'persian') {
    if (month <= 6) return 31;
    if (month <= 11) return 30;
    return isJalaliLeap(year) ? 30 : 29;
  }
  return new Date(year, month, 0).getDate();
}

export function toDate(parts: DateParts, calendar: CalendarSystem): Date {
  if (calendar === 'persian') {
    const gregorian = jalaliToGregorian(parts.year, parts.month, parts.day);
    return new Date(gregorian.year, gregorian.month - 1, gregorian.day);
  }
  return new Date(parts.year, parts.month - 1, parts.day);
}

export function toParts(date: Date, calendar: CalendarSystem): DateParts {
  if (calendar === 'persian') {
    return gregorianToJalali(date.getFullYear(), date.getMonth() + 1, date.getDate());
  }
  return { year: date.getFullYear(), month: date.getMonth() + 1, day: date.getDate() };
}

export function sameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export interface CalendarCell {
  date: Date;
  inMonth: boolean;
  key: string;
  label: string;
  disabled: boolean;
}

export interface MonthGrid {
  title: string;
  weekdays: string[];
  cells: CalendarCell[];
  year: number;
  month: number;
}

export function weekdayLabels(locale: Locale, weekStartsOn: number): string[] {
  const formatter = new Intl.DateTimeFormat(intlLocale(locale), { weekday: 'short' });
  const sunday = new Date(2024, 0, 7);
  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(sunday);
    date.setDate(sunday.getDate() + ((weekStartsOn + index) % 7));
    return formatter.format(date);
  });
}

export function buildMonthGrid(options: {
  anchor: Date;
  calendar?: CalendarSystem;
  locale?: Locale;
  weekStartsOn?: 0 | 1 | 6;
  min?: Date;
  max?: Date;
}): MonthGrid {
  const calendar = options.calendar ?? 'gregory';
  const locale = options.locale ?? 'en';
  const weekStartsOn = options.weekStartsOn ?? (locale === 'fa' ? 6 : 0);
  const parts = toParts(options.anchor, calendar);
  const first = toDate({ year: parts.year, month: parts.month, day: 1 }, calendar);
  const count = daysInMonth(parts.year, parts.month, calendar);
  const leading = (first.getDay() - weekStartsOn + 7) % 7;
  const cells: CalendarCell[] = [];
  for (let index = 0; index < leading; index += 1) {
    const date = new Date(first);
    date.setDate(first.getDate() - (leading - index));
    cells.push(cellFor(date, false, options.min, options.max, locale, calendar));
  }
  for (let day = 1; day <= count; day += 1) {
    const date = toDate({ year: parts.year, month: parts.month, day }, calendar);
    cells.push(cellFor(date, true, options.min, options.max, locale, calendar));
  }
  while (cells.length % 7 !== 0) {
    const last = cells[cells.length - 1]?.date ?? first;
    const date = new Date(last);
    date.setDate(last.getDate() + 1);
    cells.push(cellFor(date, false, options.min, options.max, locale, calendar));
  }
  return {
    title: formatDate(first, locale, { month: 'long', year: 'numeric' }, calendar),
    weekdays: weekdayLabels(locale, weekStartsOn),
    cells,
    year: parts.year,
    month: parts.month,
  };
}

function cellFor(
  date: Date,
  inMonth: boolean,
  min: Date | undefined,
  max: Date | undefined,
  locale: Locale,
  calendar: CalendarSystem,
): CalendarCell {
  const day = startOfDay(date);
  const disabled = Boolean((min && day < startOfDay(min)) || (max && day > startOfDay(max)));
  return {
    date: day,
    inMonth,
    key: `${day.getFullYear()}-${day.getMonth() + 1}-${day.getDate()}`,
    label: formatDate(day, locale, { dateStyle: 'full' }, calendar),
    disabled,
  };
}

export function addMonths(date: Date, amount: number, calendar: CalendarSystem): Date {
  const parts = toParts(date, calendar);
  const absolute = parts.year * 12 + (parts.month - 1) + amount;
  const year = Math.floor(absolute / 12);
  const month = (absolute % 12) + 1;
  const day = Math.min(parts.day, daysInMonth(year, month, calendar));
  return toDate({ year, month, day }, calendar);
}

export function parseIsoDate(value: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.trim());
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(year, month - 1, day);
  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) {
    return null;
  }
  return date;
}
