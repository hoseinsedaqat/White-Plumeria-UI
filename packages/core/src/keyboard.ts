export type Orientation = 'horizontal' | 'vertical';
export type Direction = 'ltr' | 'rtl';

export function nextIndex(
  current: number,
  length: number,
  key: string,
  orientation: Orientation = 'horizontal',
  direction: Direction = 'ltr',
): number | null {
  if (length <= 0) return null;
  if (key === 'Home') return 0;
  if (key === 'End') return length - 1;
  let delta = 0;
  if (orientation === 'horizontal') {
    if (key === 'ArrowRight') delta = direction === 'rtl' ? -1 : 1;
    if (key === 'ArrowLeft') delta = direction === 'rtl' ? 1 : -1;
  } else {
    if (key === 'ArrowDown') delta = 1;
    if (key === 'ArrowUp') delta = -1;
  }
  if (delta === 0) return null;
  return (current + delta + length) % length;
}

export function readingDirection(element?: HTMLElement | null): Direction {
  if (!element || typeof getComputedStyle === 'undefined') return 'ltr';
  return getComputedStyle(element).direction === 'rtl' ? 'rtl' : 'ltr';
}
