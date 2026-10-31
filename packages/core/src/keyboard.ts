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

/** Arrow, Home, and End movement for a single-select toggle group. Disabled options are skipped. */
export function toggleGroupMove(
  options: readonly { disabled?: boolean }[],
  index: number,
  key: string,
  direction: Direction,
): number | null {
  const enabled = options.flatMap((option, item) => (option.disabled ? [] : [item]));
  if (enabled.length === 0) return null;
  const motion =
    key === 'Home'
      ? 'first'
      : key === 'End'
        ? 'last'
        : key === 'ArrowRight'
          ? direction === 'rtl'
            ? 'prev'
            : 'next'
          : key === 'ArrowLeft'
            ? direction === 'rtl'
              ? 'next'
              : 'prev'
            : null;
  if (!motion) return null;
  if (motion === 'first') return enabled[0] === index ? null : (enabled[0] ?? null);
  if (motion === 'last') {
    const last = enabled[enabled.length - 1] ?? null;
    return last === index ? null : last;
  }
  const at = enabled.indexOf(index);
  const from = at < 0 ? (motion === 'prev' ? enabled.length : -1) : at;
  const next = enabled[(from + (motion === 'next' ? 1 : -1) + enabled.length) % enabled.length];
  return next === undefined || next === index ? null : next;
}
