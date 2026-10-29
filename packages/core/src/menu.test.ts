import { describe, expect, it } from 'vitest';
import { firstEnabledIndex, menuCommand, menuHasSubmenu, moveEnabledIndex } from './menu.ts';

const items = [
  { id: 'profile', disabled: false },
  { id: 'theme', items: [{ id: 'ivory' }, { id: 'ink', disabled: true }] },
  { id: 'out', disabled: true },
];

describe('menu commands', () => {
  it('opens a submenu toward the inline end and closes it before the root', () => {
    expect(menuHasSubmenu(items[1])).toBe(true);
    expect(menuHasSubmenu(items[2])).toBe(false);
    expect(menuCommand({ key: 'ArrowRight', direction: 'ltr', open: true, submenuOpen: false, hasSubmenu: true })).toBe('open-submenu');
    expect(menuCommand({ key: 'ArrowLeft', direction: 'rtl', open: true, submenuOpen: false, hasSubmenu: true })).toBe('open-submenu');
    expect(menuCommand({ key: 'Escape', direction: 'ltr', open: true, submenuOpen: true, hasSubmenu: false })).toBe('close-submenu');
    expect(menuCommand({ key: 'Escape', direction: 'ltr', open: true, submenuOpen: false, hasSubmenu: false })).toBe('close');
    expect(menuCommand({ key: 'Enter', direction: 'ltr', open: true, submenuOpen: false, hasSubmenu: false })).toBe('activate');
    expect(menuCommand({ key: ' ', direction: 'ltr', open: false, submenuOpen: false, hasSubmenu: false })).toBe('open');
  });

  it('skips disabled items when moving', () => {
    expect(firstEnabledIndex(items)).toBe(0);
    expect(moveEnabledIndex(items, 0, 'next')).toBe(1);
    expect(moveEnabledIndex(items, 1, 'next')).toBe(0);
    expect(moveEnabledIndex(items[1]?.items ?? [], 0, 'next')).toBe(0);
  });
});
