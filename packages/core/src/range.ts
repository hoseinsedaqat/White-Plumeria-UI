export interface NumberRange {
  start: number;
  end: number;
}

export interface RangeBounds {
  min: number;
  max: number;
  step: number;
}

export function rangeBounds(min = 0, max = 100, step = 1): RangeBounds {
  const low = Number.isFinite(min) ? min : 0;
  const high = Number.isFinite(max) ? max : 100;
  const [floor, ceiling] = low <= high ? [low, high] : [high, low];
  const rawStep = Number.isFinite(step) && step > 0 ? step : 1;
  return { min: floor, max: ceiling, step: rawStep };
}

function decimalPlaces(step: number): number {
  const text = step.toString();
  if (text.includes('e-')) {
    const places = Number(text.split('e-')[1]);
    return Number.isFinite(places) ? Math.min(places, 8) : 0;
  }
  return Math.min(text.split('.')[1]?.length ?? 0, 8);
}

/** Snaps to the step. The bounds themselves stay reachable even when they are off-step. */
export function snapToStep(value: number, bounds: RangeBounds): number {
  if (!Number.isFinite(value)) return bounds.min;
  const clamped = Math.min(bounds.max, Math.max(bounds.min, value));
  if (clamped === bounds.min || clamped === bounds.max) return clamped;
  const snapped = bounds.min + Math.round((clamped - bounds.min) / bounds.step) * bounds.step;
  const rounded = Number(snapped.toFixed(decimalPlaces(bounds.step)));
  return Math.min(bounds.max, Math.max(bounds.min, rounded));
}

const incompleteNumber = /^(?:[+-]?\.?|[+-]?\d+\.|[+-]?\d+(?:\.\d+)?[eE][+-]?)$/;

/** A finite draft snaps to the step. An unfinished draft stays unfinished. */
export function numberFieldDraftValue(raw: string, bounds: RangeBounds): number | null {
  const text = raw.trim();
  if (!text || incompleteNumber.test(text)) return null;
  const parsed = Number(text);
  if (!Number.isFinite(parsed)) return null;
  return snapToStep(parsed, bounds);
}

export function numberFieldText(value: number, bounds: RangeBounds): string {
  return String(snapToStep(value, bounds));
}

export function numberFieldCommit(raw: string, bounds: RangeBounds, fallback: number): number {
  return numberFieldDraftValue(raw, bounds) ?? snapToStep(fallback, bounds);
}

export function numberFieldStep(current: number, delta: -1 | 1, bounds: RangeBounds): number {
  return snapToStep(current + delta * bounds.step, bounds);
}

export function normalizeRange(start: number, end: number, bounds: RangeBounds): NumberRange {
  const low = snapToStep(Math.min(start, end), bounds);
  const high = snapToStep(Math.max(start, end), bounds);
  return { start: low, end: high };
}

/** Moves one edge and stops it at the other. The pointer stays on the thumb that was dragged. */
export function clampRangeEdge(
  edge: 'start' | 'end',
  next: number,
  current: NumberRange,
  bounds: RangeBounds,
): NumberRange {
  const ordered = normalizeRange(current.start, current.end, bounds);
  const value = snapToStep(next, bounds);
  if (edge === 'start') return { start: Math.min(value, ordered.end), end: ordered.end };
  return { start: ordered.start, end: Math.max(value, ordered.start) };
}

export function rangeFill(
  range: NumberRange,
  bounds: RangeBounds,
): { start: string; size: string } {
  const span = bounds.max - bounds.min;
  if (!(span > 0)) return { start: '0%', size: '0%' };
  const start = ((range.start - bounds.min) / span) * 100;
  const size = ((range.end - range.start) / span) * 100;
  return { start: `${trimPercent(start)}%`, size: `${trimPercent(Math.max(0, size))}%` };
}

function trimPercent(value: number): string {
  return value.toFixed(4).replace(/\.?0+$/, '');
}

export function valueFromPointer(
  clientX: number,
  left: number,
  width: number,
  bounds: RangeBounds,
  direction: 'ltr' | 'rtl',
): number {
  if (!(width > 0) || !Number.isFinite(clientX)) return bounds.min;
  const ratio = Math.min(1, Math.max(0, (clientX - left) / width));
  const visual = direction === 'rtl' ? 1 - ratio : ratio;
  return snapToStep(bounds.min + visual * (bounds.max - bounds.min), bounds);
}

export function nearerEdge(value: number, range: NumberRange): 'start' | 'end' {
  return Math.abs(value - range.start) <= Math.abs(value - range.end) ? 'start' : 'end';
}
