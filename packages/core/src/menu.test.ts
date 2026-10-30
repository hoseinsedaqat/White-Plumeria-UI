import { describe, expect, it } from 'vitest';
import { firstEnabledIndex, menuCommand, menuHasSubmenu, moveEnabledIndex, typeaheadMove } from './menu.ts';

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

  it('jumps to a label prefix and cycles a repeated letter', () => {
    const labels = [
      { label: 'Profile' },
      { label: 'Preferences' },
      { label: 'Sign out', disabled: true },
      { label: 'Theme' },
    ];
    const buffer = { query: '', at: 0 };
    expect(typeaheadMove(buffer, labels, 'p', 1_000, -1)).toBe(0);
    expect(typeaheadMove(buffer, labels, 'p', 1_200, 0)).toBe(1);
    expect(typeaheadMove(buffer, labels, 'r', 1_300, 1)).toBe(0);
    expect(typeaheadMove(buffer, labels, 't', 3_000, 0)).toBe(3);
    expect(typeaheadMove(buffer, labels, 's', 3_100, 3)).toBeNull();
    expect(typeaheadMove(buffer, labels, 's', 4_000, 3)).toBeNull();
    expect(typeaheadMove(buffer, labels, ' ', 4_100, 3)).toBeNull();
  });

  it('skips disabled items when moving', () => {
    expect(firstEnabledIndex(items)).toBe(0);
    expect(moveEnabledIndex(items, 0, 'next')).toBe(1);
    expect(moveEnabledIndex(items, 1, 'next')).toBe(0);
    expect(moveEnabledIndex(items[1]?.items ?? [], 0, 'next')).toBe(0);
  });
});
