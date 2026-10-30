import { describe, expect, it } from 'vitest';
import {
  clampRangeEdge,
  nearerEdge,
  normalizeRange,
  numberFieldCommit,
  numberFieldDraftValue,
  numberFieldStep,
  numberFieldText,
  rangeBounds,
  rangeFill,
  snapToStep,
  valueFromPointer,
} from './range.ts';

const bounds = rangeBounds(0, 100, 1);

describe('numeric range', () => {
  it('keeps the ends reachable when the step does not divide the span', () => {
    const coarse = rangeBounds(0, 100, 30);
    expect(snapToStep(100, coarse)).toBe(100);
    expect(snapToStep(0, coarse)).toBe(0);
    expect(snapToStep(80, coarse)).toBe(90);
    expect(snapToStep(1.26, rangeBounds(0, 10, 0.25))).toBe(1.25);
    expect(snapToStep(Number.NaN, bounds)).toBe(0);
    expect(rangeBounds(10, 0, 0)).toEqual({ min: 0, max: 10, step: 1 });
  });

  it('orders a reversed pair and stops a thumb at the other thumb', () => {
    expect(normalizeRange(80, 20, bounds)).toEqual({ start: 20, end: 80 });
    expect(clampRangeEdge('start', 90, { start: 20, end: 80 }, bounds)).toEqual({
      start: 80,
      end: 80,
    });
    expect(clampRangeEdge('end', 10, { start: 20, end: 80 }, bounds)).toEqual({
      start: 20,
      end: 20,
    });
  });

  it('keeps an unfinished number draft and snaps a finished one', () => {
    const guests = rangeBounds(1, 8, 1);
    expect(numberFieldDraftValue('', guests)).toBeNull();
    expect(numberFieldDraftValue('-', guests)).toBeNull();
    expect(numberFieldDraftValue('1.', guests)).toBeNull();
    expect(numberFieldDraftValue('3', guests)).toBe(3);
    expect(numberFieldDraftValue('12', guests)).toBe(8);
    expect(numberFieldCommit('nope', guests, 2)).toBe(2);
    expect(numberFieldStep(2, 1, guests)).toBe(3);
    expect(numberFieldStep(8, 1, guests)).toBe(8);
    expect(numberFieldStep(1, -1, guests)).toBe(1);
    expect(numberFieldText(2.2, rangeBounds(0, 10, 0.25))).toBe('2.25');
  });

  it('maps the fill and a pointer to the same scale', () => {
    expect(rangeFill({ start: 20, end: 80 }, bounds)).toEqual({ start: '20%', size: '60%' });
    expect(valueFromPointer(20, 0, 100, bounds, 'ltr')).toBe(20);
    expect(valueFromPointer(20, 0, 100, bounds, 'rtl')).toBe(80);
    expect(nearerEdge(60, { start: 20, end: 80 })).toBe('end');
    expect(nearerEdge(50, { start: 20, end: 80 })).toBe('start');
  });
});
