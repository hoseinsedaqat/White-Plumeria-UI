import { describe, expect, it } from 'vitest';
import { placeAnchoredPanel } from './overlay.ts';

const viewport = { width: 800, height: 400 };
const panel = { width: 180, height: 140 };

describe('placeAnchoredPanel', () => {
  it('opens below the anchor when the panel fits', () => {
    const placed = placeAnchoredPanel({ x: 40, y: 30, width: 80, height: 32 }, panel, viewport);
    expect(placed).toEqual({ top: 68, left: 40, placement: 'bottom' });
  });

  it('opens above the anchor when the panel would fall past the viewport', () => {
    const placed = placeAnchoredPanel({ x: 40, y: 320, width: 80, height: 32 }, panel, viewport);
    expect(placed.placement).toBe('top');
    expect(placed.top).toBe(320 - 6 - 140);
    expect(placed.left).toBe(40);
  });
});
