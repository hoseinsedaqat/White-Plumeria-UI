import { describe, expect, it } from 'vitest';
import { gregorianToJalali, jalaliToGregorian, orderDateRange, parseIsoDate, toIsoDate } from './calendar.ts';

describe('calendar conversion', () => {
  it('round-trips a Persian date through Gregorian parts', () => {
    const gregorian = jalaliToGregorian(1404, 1, 1);
    expect(gregorianToJalali(gregorian.year, gregorian.month, gregorian.day)).toEqual({
      year: 1404,
      month: 1,
      day: 1,
    });
  });

  it('rejects an impossible ISO date', () => {
    expect(parseIsoDate('2026-02-31')).toBeNull();
    expect(parseIsoDate('2026-10-27')?.getDate()).toBe(27);
  });

  it('orders a date range even when the later day is chosen first', () => {
    expect(orderDateRange('2026-10-20', '2026-10-12')).toEqual({ start: '2026-10-12', end: '2026-10-20' });
    const parsed = parseIsoDate('2026-10-12');
    expect(parsed ? toIsoDate(parsed) : '').toBe('2026-10-12');
  });
});
