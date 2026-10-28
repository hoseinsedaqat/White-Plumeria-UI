import type { Direction } from './keyboard.ts';

export type StepState = 'complete' | 'current' | 'upcoming';

export function clampInteger(value: number, min: number, max: number, fallback: number): number {
  if (!Number.isFinite(value)) return fallback;
  return Math.min(max, Math.max(min, Math.trunc(value)));
}

export function clampIndex(index: number, count: number): number {
  if (count <= 0) return 0;
  if (!Number.isFinite(index)) return 0;
  return Math.min(count - 1, Math.max(0, Math.trunc(index)));
}

export function stepIndex(items: readonly { id: string }[], value: string | undefined): number {
  if (items.length === 0 || !value) return 0;
  const found = items.findIndex((item) => item.id === value);
  return found < 0 ? 0 : found;
}

export function stepState(index: number, currentIndex: number): StepState {
  if (index < currentIndex) return 'complete';
  if (index === currentIndex) return 'current';
  return 'upcoming';
}

export function moveIndex(index: number, delta: number, count: number, loop: boolean): number {
  if (count <= 0) return 0;
  const next = index + delta;
  if (loop) return ((next % count) + count) % count;
  return clampIndex(next, count);
}

export function canMove(index: number, delta: number, count: number, loop: boolean): boolean {
  if (count <= 1) return false;
  if (loop) return true;
  const next = index + delta;
  return next >= 0 && next < count;
}

export function carouselIndexFromKey(
  index: number,
  count: number,
  key: string,
  direction: Direction,
  loop: boolean,
): number | null {
  if (count <= 0) return null;
  if (key === 'Home') return 0;
  if (key === 'End') return count - 1;
  let delta = 0;
  if (key === 'ArrowRight') delta = direction === 'rtl' ? -1 : 1;
  if (key === 'ArrowLeft') delta = direction === 'rtl' ? 1 : -1;
  if (delta === 0) return null;
  if (!canMove(index, delta, count, loop)) return null;
  return moveIndex(index, delta, count, loop);
}

export function otpLength(length: number): number {
  return clampInteger(length, 1, 8, 6);
}

export function otpNormalize(value: string, length: number, numeric: boolean): string {
  const size = otpLength(length);
  const raw = numeric ? value.replace(/\D/g, '') : value.replace(/\s/g, '');
  return raw.slice(0, size);
}

export function otpCells(value: string, length: number, numeric: boolean): string[] {
  const size = otpLength(length);
  const normalized = otpNormalize(value, size, numeric);
  return Array.from({ length: size }, (_, index) => normalized[index] ?? '');
}

export function otpApply(
  value: string,
  length: number,
  numeric: boolean,
  index: number,
  text: string,
): { value: string; focus: number } {
  const size = otpLength(length);
  const current = otpNormalize(value, size, numeric);
  const incoming = otpNormalize(text, size, numeric);
  const start = clampInteger(index, 0, Math.max(size - 1, 0), 0);
  if (!incoming) return { value: current, focus: Math.min(start, Math.max(current.length, 0)) };
  const writeAt = Math.min(start, current.length);
  const next = `${current.slice(0, writeAt)}${incoming}${current.slice(writeAt + incoming.length)}`.slice(0, size);
  return { value: next, focus: Math.min(writeAt + incoming.length, size - 1) };
}

export function otpDelete(
  value: string,
  length: number,
  numeric: boolean,
  index: number,
): { value: string; focus: number } {
  const size = otpLength(length);
  const current = otpNormalize(value, size, numeric);
  if (!current) return { value: '', focus: 0 };
  if (index >= 0 && index < current.length) {
    return { value: `${current.slice(0, index)}${current.slice(index + 1)}`, focus: index };
  }
  const focus = Math.max(0, current.length - 1);
  return { value: current.slice(0, -1), focus };
}
