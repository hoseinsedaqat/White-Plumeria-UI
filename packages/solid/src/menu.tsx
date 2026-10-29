import {
  bindDismissable,
  firstEnabledIndex,
  menuCommand,
  menuHasSubmenu,
  moveEnabledIndex,
  placeOverlay,
  readingDirection,
  type MenuMotion,
} from '@white-plumeria/core';
import { createEffect, createSignal, onCleanup, type JSX , createUniqueId } from 'solid-js';
import { Button } from './button.tsx';

export interface MenuItem {
  id: string;
  label: string;
  disabled?: boolean;
  shortcut?: string;
  items?: MenuItem[];
}

export function DropdownMenu(props: { label: string; items: MenuItem[]; onSelect?: (id: string) => void }) {
  const [open, setOpen] = createSignal(false);
  const [active, setActive] = createSignal(0);
  const [subActive, setSubActive] = createSignal<number | null>(null);
  let buttonRef: HTMLButtonElement | undefined;
  let menuRef: HTMLDivElement | undefined;
  let subRef: number | null = null;
  const menuId = createUniqueId();
  const parent = () => props.items[active()];
  const children = () => parent()?.items ?? [];
  const current = () => (subActive() === null ? parent() : children()[subActive() ?? 0]);
  const activeId = () => {
    const item = current();
    return item ? `${menuId}-${item.id}` : undefined;
  };

  createEffect(() => {
    if (!open() || !menuRef) return;
    const stop = bindDismissable({
      root: menuRef,
      owner: buttonRef ?? null,
      onDismiss: () => {
        if (subRef !== null) {
          subRef = null;
          setSubActive(null);
          return;
        }
        setOpen(false);
      },
    });
    onCleanup(stop);
  });

  function select(id: string) {
    props.onSelect?.(id);
    setOpen(false);
    setSubActive(null);
    subRef = null;
    buttonRef?.focus();
  }

  function openSubmenu(index = active()) {
    const item = props.items[index];
    if (!menuHasSubmenu(item)) return;
    const next = firstEnabledIndex(item.items ?? []);
    subRef = next;
    setActive(index);
    setSubActive(next);
  }

  function onKeyDown(event: KeyboardEvent) {
    const command = menuCommand({
      key: event.key,
      direction: readingDirection(buttonRef),
      open: open(),
      submenuOpen: subActive() !== null,
      hasSubmenu: menuHasSubmenu(current()),
    });
    if (!command) return;
    event.preventDefault();
    if (command === 'close' || command === 'close-submenu') event.stopPropagation();
    if (command === 'open') {
      setOpen(true);
      setActive(firstEnabledIndex(props.items));
      setSubActive(null);
      return;
    }
    if (command === 'close') {
      setOpen(false);
      setSubActive(null);
      subRef = null;
      return;
    }
    if (command === 'close-submenu') {
      subRef = null;
      setSubActive(null);
      return;
    }
    if (command === 'open-submenu') {
      setOpen(true);
      openSubmenu();
      return;
    }
    if (command === 'activate') {
      const item = current();
      if (item && !item.disabled && !menuHasSubmenu(item)) select(item.id);
      return;
    }
    if (!open()) {
      setOpen(true);
      setActive(firstEnabledIndex(props.items));
      setSubActive(null);
      return;
    }
    const motion = command as MenuMotion;
    if (subActive() === null) setActive(moveEnabledIndex(props.items, active(), motion));
    else setSubActive(moveEnabledIndex(children(), subActive() ?? 0, motion));
  }

  return (
    <div class="wpl-menu-root">
      <Button
        ref={buttonRef}
        variant="secondary"
        aria-haspopup="menu"
        aria-expanded={open()}
        aria-controls={menuId}
        aria-activedescendant={open() ? activeId() : undefined}
        onClick={() => {
          setOpen((value) => !value);
          setSubActive(null);
          subRef = null;
          setActive(firstEnabledIndex(props.items));
        }}
        onKeyDown={onKeyDown}
      >
        {props.label}
      </Button>
      {open() ? (
        <div ref={menuRef} id={menuId} role="menu" aria-label={props.label} class="wpl-menu wpl-menu-panel">
          {props.items.map((item, index) => {
            const nested = menuHasSubmenu(item);
            const expanded = () => nested && index === active() && subActive() !== null;
            return (
              <div class="wpl-menu-row">
                <button
                  id={`${menuId}-${item.id}`}
                  type="button"
                  role="menuitem"
                  class="wpl-menu-item"
                  disabled={item.disabled}
                  aria-haspopup={nested ? 'menu' : undefined}
                  aria-expanded={nested ? expanded() : undefined}
                  aria-controls={expanded() ? `${menuId}-sub-${item.id}` : undefined}
                  data-active={subActive() === null && index === active() ? 'true' : undefined}
                  onMouseEnter={() => {
                    setActive(index);
                    if (nested) openSubmenu(index);
                    else {
                      subRef = null;
                      setSubActive(null);
                    }
                  }}
                  onClick={() => {
                    if (nested) openSubmenu(index);
                    else if (!item.disabled) select(item.id);
                  }}
                >
                  <span>{item.label}</span>
                  {nested ? <span class="wpl-menu-caret" aria-hidden="true" /> : null}
                  {!nested && item.shortcut ? <span class="wpl-menu-shortcut">{item.shortcut}</span> : null}
                </button>
                {expanded() ? (
                  <div id={`${menuId}-sub-${item.id}`} role="menu" aria-label={item.label} class="wpl-menu wpl-menu-sub">
                    {item.items?.map((child, childIndex) => (
                      <button
                        id={`${menuId}-${child.id}`}
                        type="button"
                        role="menuitem"
                        class="wpl-menu-item"
                        disabled={child.disabled}
                        data-active={childIndex === subActive() ? 'true' : undefined}
                        onMouseEnter={() => setSubActive(childIndex)}
                        onClick={() => {
                          if (!child.disabled) select(child.id);
                        }}
                      >
                        <span>{child.label}</span>
                        {child.shortcut ? <span class="wpl-menu-shortcut">{child.shortcut}</span> : null}
                      </button>
                    ))}
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}

export function ContextMenu(props: { items: MenuItem[]; onSelect?: (id: string) => void; children: JSX.Element; label?: string }) {
  const [point, setPoint] = createSignal<{ x: number; y: number } | null>(null);
  const [active, setActive] = createSignal(0);
  const [subActive, setSubActive] = createSignal<number | null>(null);
  let menuRef: HTMLDivElement | undefined;
  let rootRef: HTMLDivElement | undefined;
  let subRef: number | null = null;
  const menuId = createUniqueId();
  const label = () => props.label ?? 'Context menu';
  const parent = () => props.items[active()];
  const childrenItems = () => parent()?.items ?? [];
  const current = () => (subActive() === null ? parent() : childrenItems()[subActive() ?? 0]);

  function close() {
    subRef = null;
    setSubActive(null);
    setPoint(null);
  }

  function openAt(x: number, y: number) {
    subRef = null;
    setSubActive(null);
    setActive(firstEnabledIndex(props.items));
    setPoint({ x, y });
    rootRef?.focus();
  }

  function openSubmenu(index = active()) {
    const item = props.items[index];
    if (!menuHasSubmenu(item)) return;
    const next = firstEnabledIndex(item.items);
    subRef = next;
    setActive(index);
    setSubActive(next);
  }

  createEffect(() => {
    const origin = point();
    if (!origin || !menuRef) return;
    const menu = menuRef;
    const placed = placeOverlay(
      { x: origin.x, y: origin.y, width: 0, height: 0 },
      { width: menu.offsetWidth || 180, height: menu.offsetHeight || 120 },
      { width: window.innerWidth, height: window.innerHeight },
      'end',
    );
    menu.style.left = `${placed.left}px`;
    menu.style.top = `${placed.top}px`;
    const stop = bindDismissable({
      root: menu,
      onDismiss: () => {
        if (subRef !== null) {
          subRef = null;
          setSubActive(null);
          return;
        }
        setPoint(null);
      },
    });
    onCleanup(stop);
  });

  function onKeyDown(event: KeyboardEvent) {
    if (event.key === 'F10' && event.shiftKey) {
      event.preventDefault();
      const rect = rootRef?.getBoundingClientRect();
      openAt(rect?.left ?? 0, rect?.bottom ?? 0);
      return;
    }
    if (!point()) return;
    const command = menuCommand({
      key: event.key,
      direction: readingDirection(rootRef),
      open: true,
      submenuOpen: subActive() !== null,
      hasSubmenu: menuHasSubmenu(current()),
    });
    if (!command || command === 'open') return;
    event.preventDefault();
    if (command === 'close' || command === 'close-submenu') event.stopPropagation();
    if (command === 'close') {
      close();
      return;
    }
    if (command === 'close-submenu') {
      subRef = null;
      setSubActive(null);
      return;
    }
    if (command === 'open-submenu') {
      openSubmenu();
      return;
    }
    if (command === 'activate') {
      const item = current();
      if (item && !item.disabled && !menuHasSubmenu(item)) {
        props.onSelect?.(item.id);
        close();
      }
      return;
    }
    const motion = command as MenuMotion;
    if (subActive() === null) setActive(moveEnabledIndex(props.items, active(), motion));
    else setSubActive(moveEnabledIndex(childrenItems(), subActive() ?? 0, motion));
  }

  return (
    <div
      ref={rootRef}
      role="group"
      aria-label={label()}
      tabindex={0}
      aria-controls={point() ? menuId : undefined}
      aria-activedescendant={point() && current() ? `${menuId}-${current()!.id}` : undefined}
      onContextMenu={(event) => {
        event.preventDefault();
        openAt(event.clientX, event.clientY);
      }}
      onKeyDown={onKeyDown}
    >
      {props.children}
      {point() ? (
        <div ref={menuRef} id={menuId} role="menu" aria-label={label()} class="wpl-menu wpl-menu-fixed">
          {props.items.map((item, index) => {
            const nested = menuHasSubmenu(item);
            const expanded = () => nested && index === active() && subActive() !== null;
            return (
              <div class="wpl-menu-row">
                <button
                  id={`${menuId}-${item.id}`}
                  type="button"
                  role="menuitem"
                  class="wpl-menu-item"
                  disabled={item.disabled}
                  aria-haspopup={nested ? 'menu' : undefined}
                  aria-expanded={nested ? expanded() : undefined}
                  aria-controls={expanded() ? `${menuId}-sub-${item.id}` : undefined}
                  data-active={subActive() === null && index === active() ? 'true' : undefined}
                  onMouseEnter={() => {
                    setActive(index);
                    if (nested) openSubmenu(index);
                    else {
                      subRef = null;
                      setSubActive(null);
                    }
                  }}
                  onClick={() => {
                    if (nested) openSubmenu(index);
                    else if (!item.disabled) {
                      props.onSelect?.(item.id);
                      close();
                    }
                  }}
                >
                  <span>{item.label}</span>
                  {nested ? <span class="wpl-menu-caret" aria-hidden="true" /> : null}
                </button>
                {expanded() ? (
                  <div id={`${menuId}-sub-${item.id}`} role="menu" aria-label={item.label} class="wpl-menu wpl-menu-sub">
                    {item.items?.map((child, childIndex) => (
                      <button
                        id={`${menuId}-${child.id}`}
                        type="button"
                        role="menuitem"
                        class="wpl-menu-item"
                        disabled={child.disabled}
                        data-active={childIndex === subActive() ? 'true' : undefined}
                        onMouseEnter={() => setSubActive(childIndex)}
                        onClick={() => {
                          if (!child.disabled) {
                            props.onSelect?.(child.id);
                            close();
                          }
                        }}
                      >
                        {child.label}
                      </button>
                    ))}
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}

export function Popover(props: { label?: string; children: JSX.Element; trigger?: JSX.Element }) {
  const [open, setOpen] = createSignal(false);
  const id = createUniqueId();
  let rootRef: HTMLDivElement | undefined;
  let panelRef: HTMLDivElement | undefined;

  createEffect(() => {
    if (!open() || !panelRef) return;
    const stop = bindDismissable({
      root: panelRef,
      owner: rootRef ?? null,
      onDismiss: () => setOpen(false),
    });
    onCleanup(stop);
  });

  return (
    <div ref={rootRef} style={{ position: 'relative', display: 'inline-block' }}>
      <Button variant="secondary" aria-expanded={open()} aria-controls={id} onClick={() => setOpen((value) => !value)}>
        {props.trigger ?? props.label}
      </Button>
      {open() ? (
        <div ref={panelRef} id={id} class="wpl-popover" style={{ position: 'absolute', 'inset-block-start': 'calc(100% + 0.35rem)', 'inset-inline-start': '0' }}>
          {props.children}
        </div>
      ) : null}
    </div>
  );
}

export function Tooltip(props: { content: string; children: JSX.Element }) {
  const [open, setOpen] = createSignal(false);
  const id = createUniqueId();
  let timer: number | undefined;

  function show() {
    window.clearTimeout(timer);
    timer = window.setTimeout(() => setOpen(true), 400);
  }
  function hide() {
    window.clearTimeout(timer);
    setOpen(false);
  }

  return (
    <span style={{ position: 'relative', display: 'inline-flex' }} onMouseEnter={show} onMouseLeave={hide} onFocusIn={show} onFocusOut={hide}>
      <span aria-describedby={open() ? id : undefined} onKeyDown={(event) => event.key === 'Escape' && hide()}>
        {props.children}
      </span>
      {open() ? (
        <span id={id} role="tooltip" class="wpl-tooltip" style={{ position: 'absolute', 'inset-block-end': 'calc(100% + 0.35rem)', 'inset-inline-start': '0' }}>
          {props.content}
        </span>
      ) : null}
    </span>
  );
}
