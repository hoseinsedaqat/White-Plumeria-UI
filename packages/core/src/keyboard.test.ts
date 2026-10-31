import { describe, expect, it } from 'vitest';
import { toggleGroupMove } from './keyboard.ts';

const options = [{}, { disabled: true }, {}];

describe('toggleGroupMove', () => {
  it('follows reading direction and skips a disabled option', () => {
    expect(toggleGroupMove(options, 0, 'ArrowRight', 'ltr')).toBe(2);
    expect(toggleGroupMove(options, 2, 'ArrowLeft', 'ltr')).toBe(0);
    expect(toggleGroupMove(options, 0, 'ArrowLeft', 'rtl')).toBe(2);
    expect(toggleGroupMove(options, 2, 'ArrowRight', 'rtl')).toBe(0);
  });

  it('jumps to the ends and ignores keys that do not move', () => {
    expect(toggleGroupMove(options, 2, 'Home', 'ltr')).toBe(0);
    expect(toggleGroupMove(options, 0, 'End', 'ltr')).toBe(2);
    expect(toggleGroupMove(options, 0, 'Home', 'ltr')).toBeNull();
    expect(toggleGroupMove(options, 0, 'Enter', 'ltr')).toBeNull();
    expect(toggleGroupMove([{ disabled: true }], 0, 'ArrowRight', 'ltr')).toBeNull();
  });
});
