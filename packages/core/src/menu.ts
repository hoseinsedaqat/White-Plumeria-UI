import type { Direction } from './keyboard.ts';

export interface MenuNode {
  id: string;
  disabled?: boolean;
  items?: readonly MenuNode[];
}

export type MenuMotion = 'next' | 'prev' | 'first' | 'last';

export type MenuCommand = 'open' | 'close' | 'close-submenu' | 'open-submenu' | 'activate' | 'typeahead' | MenuMotion;

export interface TypeaheadBuffer {
  query: string;
  at: number;
}

const TYPEAHEAD_WINDOW = 500;

/** Prefix match for a printable key. Repeating the same letter cycles. A quick second letter narrows the prefix. */
export function typeaheadMove(
  buffer: TypeaheadBuffer,
  items: readonly { label?: string; disabled?: boolean }[],
  key: string,
  now: number,
  from: number,
): number | null {
  if (key.length !== 1 || key === ' ' || key.trim() === '') return null;
  const letter = key.toLowerCase();
  const recent = buffer.query.length > 0 && now - buffer.at <= TYPEAHEAD_WINDOW;
  const query = recent && buffer.query !== letter ? `${buffer.query}${letter}` : letter;
  buffer.query = query;
  buffer.at = now;
  const matches = items.flatMap((item, index) => {
    if (item.disabled) return [];
    return (item.label ?? '').toLowerCase().startsWith(query) ? [index] : [];
  });
  if (matches.length === 0) return null;
  if (query.length === 1) return matches.find((index) => index > from) ?? matches[0] ?? null;
  return matches[0] ?? null;
}

export function menuHasSubmenu(item: MenuNode | undefined): item is MenuNode & { items: readonly MenuNode[] } {
  return Boolean(item && !item.disabled && item.items && item.items.length > 0);
}

export function firstEnabledIndex(items: readonly { disabled?: boolean }[]): number {
  const index = items.findIndex((item) => !item.disabled);
  return index < 0 ? 0 : index;
}

export function moveEnabledIndex(
  items: readonly { disabled?: boolean }[],
  current: number,
  motion: MenuMotion,
): number {
  const enabled = items.flatMap((item, index) => (item.disabled ? [] : [index]));
  if (enabled.length === 0) return current;
  if (motion === 'first') return enabled[0] ?? current;
  if (motion === 'last') return enabled[enabled.length - 1] ?? current;
  const at = enabled.indexOf(current);
  if (at < 0) return motion === 'prev' ? (enabled[enabled.length - 1] ?? current) : (enabled[0] ?? current);
  const delta = motion === 'next' ? 1 : -1;
  return enabled[(at + delta + enabled.length) % enabled.length] ?? current;
}

/** Keyboard decision for a menu button. The open-submenu key follows writing direction. */
export function menuCommand(input: {
  key: string;
  direction: Direction;
  open: boolean;
  submenuOpen: boolean;
  hasSubmenu: boolean;
}): MenuCommand | null {
  const { key, direction, open, submenuOpen, hasSubmenu } = input;
  const openKey = direction === 'rtl' ? 'ArrowLeft' : 'ArrowRight';
  const closeKey = direction === 'rtl' ? 'ArrowRight' : 'ArrowLeft';
  if (key === 'Escape') {
    if (submenuOpen) return 'close-submenu';
    return open ? 'close' : null;
  }
  if (key === 'ArrowDown') return 'next';
  if (key === 'ArrowUp') return 'prev';
  if (key === 'Home') return 'first';
  if (key === 'End') return 'last';
  if (key === closeKey) return submenuOpen ? 'close-submenu' : null;
  if (key === openKey) return hasSubmenu ? 'open-submenu' : null;
  if (key === 'Enter' || key === ' ') {
    if (!open) return 'open';
    return hasSubmenu ? 'open-submenu' : 'activate';
  }
  return null;
}
