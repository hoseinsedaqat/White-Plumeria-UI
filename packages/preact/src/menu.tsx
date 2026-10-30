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
import { type ComponentChildren } from 'preact';
import { useEffect, useId, useRef, useState } from 'preact/hooks';
import { type TargetedKeyboardEvent } from 'preact';
import { Button } from './button.tsx';

export interface MenuItem {
  id: string;
  label: string;
  disabled?: boolean;
  shortcut?: string;
  items?: MenuItem[];
}

export function DropdownMenu({
  label,
  items,
  onSelect,
}: {
  label: string;
  items: MenuItem[];
  onSelect?: (id: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const [subActive, setSubActive] = useState<number | null>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const subRef = useRef<number | null>(null);
  const menuId = useId();
  const parent = items[active];
  const children = parent?.items ?? [];
  const current = subActive === null ? parent : children[subActive];
  const activeId = current ? `${menuId}-${current.id}` : undefined;

  useEffect(() => {
    if (!open || !menuRef.current) return;
    return bindDismissable({
      root: menuRef.current,
      owner: buttonRef.current,
      onDismiss: () => {
        if (subRef.current !== null) {
          subRef.current = null;
          setSubActive(null);
          return;
        }
        setOpen(false);
      },
    });
  }, [open]);

  function select(id: string) {
    onSelect?.(id);
    setOpen(false);
    setSubActive(null);
    buttonRef.current?.focus();
  }

  function openSubmenu(index = active) {
    const item = items[index];
    if (!menuHasSubmenu(item)) return;
    const next = firstEnabledIndex(item.items ?? []);
    subRef.current = next;
    setActive(index);
    setSubActive(next);
  }

  function onKeyDown(event: TargetedKeyboardEvent<HTMLElement>) {
    const command = menuCommand({
      key: event.key,
      direction: readingDirection(buttonRef.current),
      open,
      submenuOpen: subActive !== null,
      hasSubmenu: menuHasSubmenu(current),
    });
    if (!command) return;
    event.preventDefault();
    if (command === 'close' || command === 'close-submenu') event.stopPropagation();
    if (command === 'open') {
      setOpen(true);
      setActive(firstEnabledIndex(items));
      setSubActive(null);
      return;
    }
    if (command === 'close') {
      setOpen(false);
      setSubActive(null);
      return;
    }
    if (command === 'close-submenu') {
      subRef.current = null;
      setSubActive(null);
      return;
    }
    if (command === 'open-submenu') {
      setOpen(true);
      openSubmenu();
      return;
    }
    if (command === 'activate') {
      if (current && !current.disabled && !menuHasSubmenu(current)) select(current.id);
      return;
    }
    if (!open) {
      setOpen(true);
      setActive(firstEnabledIndex(items));
      setSubActive(null);
      return;
    }
    const motion = command as MenuMotion;
    if (subActive === null) setActive(moveEnabledIndex(items, active, motion));
    else setSubActive(moveEnabledIndex(children, subActive, motion));
  }

  return (
    <div className="wpl-menu-root">
      <Button
        ref={buttonRef}
        variant="secondary"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={menuId}
        aria-activedescendant={open ? activeId : undefined}
        onClick={() => {
          setOpen((value) => !value);
          setSubActive(null);
          setActive(firstEnabledIndex(items));
        }}
        onKeyDown={onKeyDown}
      >
        {label}
      </Button>
      {open ? (
        <div
          ref={menuRef}
          id={menuId}
          role="menu"
          aria-label={label}
          className="wpl-menu wpl-menu-panel"
        >
          {items.map((item, index) => {
            const nested = menuHasSubmenu(item);
            const expanded = nested && index === active && subActive !== null;
            return (
              <div key={item.id} className="wpl-menu-row">
                <button
                  id={`${menuId}-${item.id}`}
                  type="button"
                  role="menuitem"
                  className="wpl-menu-item"
                  disabled={item.disabled}
                  aria-haspopup={nested ? 'menu' : undefined}
                  aria-expanded={nested ? expanded : undefined}
                  aria-controls={expanded ? `${menuId}-sub-${item.id}` : undefined}
                  data-active={subActive === null && index === active ? 'true' : undefined}
                  onMouseEnter={() => {
                    setActive(index);
                    if (nested) openSubmenu(index);
                    else setSubActive(null);
                  }}
                  onClick={() => {
                    if (nested) openSubmenu(index);
                    else if (!item.disabled) select(item.id);
                  }}
                >
                  <span>{item.label}</span>
                  {nested ? <span className="wpl-menu-caret" aria-hidden="true" /> : null}
                  {!nested && item.shortcut ? (
                    <span className="wpl-menu-shortcut">{item.shortcut}</span>
                  ) : null}
                </button>
                {expanded ? (
                  <div
                    id={`${menuId}-sub-${item.id}`}
                    role="menu"
                    aria-label={item.label}
                    className="wpl-menu wpl-menu-sub"
                  >
                    {item.items?.map((child, childIndex) => (
                      <button
                        key={child.id}
                        id={`${menuId}-${child.id}`}
                        type="button"
                        role="menuitem"
                        className="wpl-menu-item"
                        disabled={child.disabled}
                        data-active={childIndex === subActive ? 'true' : undefined}
                        onMouseEnter={() => setSubActive(childIndex)}
                        onClick={() => {
                          if (!child.disabled) select(child.id);
                        }}
                      >
                        <span>{child.label}</span>
                        {child.shortcut ? (
                          <span className="wpl-menu-shortcut">{child.shortcut}</span>
                        ) : null}
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

export function ContextMenu({
  items,
  onSelect,
  children,
  label = 'Context menu',
}: {
  items: MenuItem[];
  onSelect?: (id: string) => void;
  children: ComponentChildren;
  label?: string;
}) {
  const [point, setPoint] = useState<{ x: number; y: number } | null>(null);
  const [active, setActive] = useState(0);
  const [subActive, setSubActive] = useState<number | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const subRef = useRef<number | null>(null);
  const menuId = useId();
  const parent = items[active];
  const childrenItems = parent?.items ?? [];
  const current = subActive === null ? parent : childrenItems[subActive];

  function close() {
    subRef.current = null;
    setSubActive(null);
    setPoint(null);
  }

  function openAt(x: number, y: number) {
    subRef.current = null;
    setSubActive(null);
    setActive(firstEnabledIndex(items));
    setPoint({ x, y });
    rootRef.current?.focus();
  }

  function openSubmenu(index = active) {
    const item = items[index];
    if (!menuHasSubmenu(item)) return;
    const next = firstEnabledIndex(item.items);
    subRef.current = next;
    setActive(index);
    setSubActive(next);
  }

  useEffect(() => {
    if (!point || !menuRef.current) return;
    const menu = menuRef.current;
    const placed = placeOverlay(
      { x: point.x, y: point.y, width: 0, height: 0 },
      { width: menu.offsetWidth || 180, height: menu.offsetHeight || 120 },
      { width: window.innerWidth, height: window.innerHeight },
      'end',
    );
    menu.style.left = `${placed.left}px`;
    menu.style.top = `${placed.top}px`;
    return bindDismissable({
      root: menu,
      onDismiss: () => {
        if (subRef.current !== null) {
          subRef.current = null;
          setSubActive(null);
          return;
        }
        setPoint(null);
      },
    });
  }, [point]);

  function onKeyDown(event: TargetedKeyboardEvent<HTMLElement>) {
    if (event.key === 'F10' && event.shiftKey) {
      event.preventDefault();
      const rect = rootRef.current?.getBoundingClientRect();
      openAt(rect?.left ?? 0, rect?.bottom ?? 0);
      return;
    }
    if (!point) return;
    const command = menuCommand({
      key: event.key,
      direction: readingDirection(rootRef.current),
      open: true,
      submenuOpen: subActive !== null,
      hasSubmenu: menuHasSubmenu(current),
    });
    if (!command || command === 'open') return;
    event.preventDefault();
    if (command === 'close' || command === 'close-submenu') event.stopPropagation();
    if (command === 'close') {
      close();
      return;
    }
    if (command === 'close-submenu') {
      subRef.current = null;
      setSubActive(null);
      return;
    }
    if (command === 'open-submenu') {
      openSubmenu();
      return;
    }
    if (command === 'activate') {
      if (current && !current.disabled && !menuHasSubmenu(current)) {
        onSelect?.(current.id);
        close();
      }
      return;
    }
    const motion = command as MenuMotion;
    if (subActive === null) setActive(moveEnabledIndex(items, active, motion));
    else setSubActive(moveEnabledIndex(childrenItems, subActive, motion));
  }

  return (
    <div
      ref={rootRef}
      role="group"
      aria-label={label}
      tabIndex={0}
      aria-controls={point ? menuId : undefined}
      aria-activedescendant={point && current ? `${menuId}-${current.id}` : undefined}
      onContextMenu={(event) => {
        event.preventDefault();
        openAt(event.clientX, event.clientY);
      }}
      onKeyDown={onKeyDown}
    >
      {children}
      {point ? (
        <div
          ref={menuRef}
          id={menuId}
          role="menu"
          aria-label={label}
          className="wpl-menu wpl-menu-fixed"
        >
          {items.map((item, index) => {
            const nested = menuHasSubmenu(item);
            const expanded = nested && index === active && subActive !== null;
            return (
              <div key={item.id} className="wpl-menu-row">
                <button
                  id={`${menuId}-${item.id}`}
                  type="button"
                  role="menuitem"
                  className="wpl-menu-item"
                  disabled={item.disabled}
                  aria-haspopup={nested ? 'menu' : undefined}
                  aria-expanded={nested ? expanded : undefined}
                  aria-controls={expanded ? `${menuId}-sub-${item.id}` : undefined}
                  data-active={subActive === null && index === active ? 'true' : undefined}
                  onMouseEnter={() => {
                    setActive(index);
                    if (nested) openSubmenu(index);
                    else {
                      subRef.current = null;
                      setSubActive(null);
                    }
                  }}
                  onClick={() => {
                    if (nested) openSubmenu(index);
                    else if (!item.disabled) {
                      onSelect?.(item.id);
                      close();
                    }
                  }}
                >
                  <span>{item.label}</span>
                  {nested ? <span className="wpl-menu-caret" aria-hidden="true" /> : null}
                </button>
                {expanded ? (
                  <div
                    id={`${menuId}-sub-${item.id}`}
                    role="menu"
                    aria-label={item.label}
                    className="wpl-menu wpl-menu-sub"
                  >
                    {item.items?.map((child, childIndex) => (
                      <button
                        key={child.id}
                        id={`${menuId}-${child.id}`}
                        type="button"
                        role="menuitem"
                        className="wpl-menu-item"
                        disabled={child.disabled}
                        data-active={childIndex === subActive ? 'true' : undefined}
                        onMouseEnter={() => setSubActive(childIndex)}
                        onClick={() => {
                          if (!child.disabled) {
                            onSelect?.(child.id);
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

export function Popover({
  label,
  children,
  trigger,
}: {
  label?: string;
  children: ComponentChildren;
  trigger?: ComponentChildren;
}) {
  const [open, setOpen] = useState(false);
  const id = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open || !panelRef.current) return;
    return bindDismissable({
      root: panelRef.current,
      owner: rootRef.current,
      onDismiss: () => setOpen(false),
    });
  }, [open]);

  return (
    <div ref={rootRef} style={{ position: 'relative', display: 'inline-block' }}>
      <Button
        variant="secondary"
        aria-expanded={open}
        aria-controls={id}
        onClick={() => setOpen((value) => !value)}
      >
        {trigger ?? label}
      </Button>
      {open ? (
        <div
          ref={panelRef}
          id={id}
          className="wpl-popover"
          style={{
            position: 'absolute',
            insetBlockStart: 'calc(100% + 0.35rem)',
            insetInlineStart: 0,
          }}
        >
          {children}
        </div>
      ) : null}
    </div>
  );
}

export function Tooltip({ content, children }: { content: string; children: ComponentChildren }) {
  const [open, setOpen] = useState(false);
  const id = useId();
  const timer = useRef<number | null>(null);

  function show() {
    timer.current = window.setTimeout(() => setOpen(true), 400);
  }
  function hide() {
    if (timer.current) window.clearTimeout(timer.current);
    setOpen(false);
  }

  return (
    <span
      style={{ position: 'relative', display: 'inline-flex' }}
      onMouseEnter={show}
      onMouseLeave={hide}
      onFocus={show}
      onBlur={hide}
    >
      <span
        aria-describedby={open ? id : undefined}
        onKeyDown={(event) => event.key === 'Escape' && hide()}
      >
        {children}
      </span>
      {open ? (
        <span
          id={id}
          role="tooltip"
          className="wpl-tooltip"
          style={{
            position: 'absolute',
            insetBlockEnd: 'calc(100% + 0.35rem)',
            insetInlineStart: 0,
          }}
        >
          {content}
        </span>
      ) : null}
    </span>
  );
}
