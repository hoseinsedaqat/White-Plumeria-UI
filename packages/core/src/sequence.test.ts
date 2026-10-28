import { describe, expect, it } from 'vitest';
import {
  canMove,
  carouselIndexFromKey,
  moveIndex,
  otpApply,
  otpDelete,
  otpLength,
  stepIndex,
  stepState,
} from './sequence.ts';

describe('sequence helpers', () => {
  it('marks step progress and ignores an unknown id', () => {
    const items = [{ id: 'account' }, { id: 'billing' }, { id: 'review' }];
    expect(stepIndex(items, 'billing')).toBe(1);
    expect(stepIndex(items, 'missing')).toBe(0);
    expect(stepState(0, 1)).toBe('complete');
    expect(stepState(1, 1)).toBe('current');
    expect(stepState(2, 1)).toBe('upcoming');
  });

  it('moves a carousel without wrapping unless loop is on', () => {
    expect(canMove(0, -1, 3, false)).toBe(false);
    expect(moveIndex(0, -1, 3, false)).toBe(0);
    expect(moveIndex(2, 1, 3, true)).toBe(0);
    expect(carouselIndexFromKey(1, 3, 'ArrowRight', 'rtl', false)).toBe(0);
    expect(carouselIndexFromKey(0, 3, 'ArrowLeft', 'ltr', false)).toBeNull();
  });

  it('edits a left-packed verification code', () => {
    expect(otpLength(0)).toBe(1);
    expect(otpLength(12)).toBe(8);
    expect(otpApply('12', 6, true, 2, '9')).toEqual({ value: '129', focus: 3 });
    expect(otpApply('', 4, true, 0, '12a34')).toEqual({ value: '1234', focus: 3 });
    expect(otpDelete('123', 6, true, 1)).toEqual({ value: '13', focus: 1 });
    expect(otpDelete('12', 6, true, 2)).toEqual({ value: '1', focus: 1 });
  });
});
