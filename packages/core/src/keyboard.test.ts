import { describe, expect, it } from 'vitest';
import { splitSizeStep, toggleGroupMove } from './keyboard.ts';

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

describe('splitSizeStep', () => {
  it('grows the start pane toward the inline end and ignores other keys', () => {
    const host = document.createElement('div');
    document.body.append(host);
    expect(splitSizeStep('ArrowRight', host)).toBe(5);
    expect(splitSizeStep('ArrowLeft', host)).toBe(-5);
    expect(splitSizeStep('ArrowDown', host)).toBe(0);
    expect(splitSizeStep('Enter', null)).toBe(0);
    host.style.direction = 'rtl';
    const child = document.createElement('span');
    host.append(child);
    expect(splitSizeStep('ArrowRight', child)).toBe(-5);
    expect(splitSizeStep('ArrowLeft', child)).toBe(5);
    host.remove();
  });
});
