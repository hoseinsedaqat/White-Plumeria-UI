import { describe, expect, it } from 'vitest';
import { gregorianToJalali, jalaliToGregorian, orderDateRange, orderDateTimeRange, parseIsoDate, parseTimeValue, toIsoDate } from './calendar.ts';

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

  it('orders a same-day time range and rejects an impossible clock time', () => {
    expect(parseTimeValue('25:00')).toBeNull();
    expect(parseTimeValue('09:30')?.hours).toBe(9);
    expect(
      orderDateTimeRange({ start: '2026-10-12', end: '2026-10-12', startTime: '18:00', endTime: '9:30' }),
    ).toEqual({ start: '2026-10-12', end: '2026-10-12', startTime: '09:30', endTime: '18:00' });
    expect(
      orderDateTimeRange({ start: '2026-10-20', end: '2026-10-12', startTime: '09:00', endTime: '18:00' }),
    ).toEqual({ start: '2026-10-12', end: '2026-10-20', startTime: '18:00', endTime: '09:00' });
  });
});
