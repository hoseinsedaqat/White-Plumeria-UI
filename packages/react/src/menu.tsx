import { bindDismissable, nextIndex, placeOverlay, readingDirection } from '@white-plumeria/core';
import {
  useEffect,
  useId,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from 'react';
import { Button } from './button.tsx';

export interface MenuItem {
  id: string;
  label: string;
  disabled?: boolean;
  shortcut?: string;
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
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const menuId = useId();

  useEffect(() => {
    if (!open || !menuRef.current) return;
    return bindDismissable({
      root: menuRef.current,
      owner: buttonRef.current,
      onDismiss: () => setOpen(false),
    });
  }, [open]);

  function select(id: string) {
    onSelect?.(id);
    setOpen(false);
    buttonRef.current?.focus();
  }

  function onKeyDown(event: KeyboardEvent) {
    const enabled = items.map((item, index) => ({ item, index })).filter(({ item }) => !item.disabled);
    if (enabled.length === 0) return;
    const currentEnabled = Math.max(0, enabled.findIndex(({ index }) => index === active));
    const direction = readingDirection(buttonRef.current);
    const next = nextIndex(currentEnabled, enabled.length, event.key, 'vertical', direction);
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp' || event.key === 'Home' || event.key === 'End') {
      event.preventDefault();
      if (!open) setOpen(true);
      const target = enabled[next ?? 0];
      if (target) setActive(target.index);
    }
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      const item = items[active];
      if (open && item && !item.disabled) select(item.id);
      else setOpen(true);
    }
    if (event.key === 'Escape') setOpen(false);
  }

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <Button
        ref={buttonRef}
        variant="secondary"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={menuId}
        onClick={() => setOpen((value) => !value)}
        onKeyDown={onKeyDown}
      >
        {label}
      </Button>
      {open ? (
        <div
          ref={menuRef}
          id={menuId}
          role="menu"
          className="wpl-menu"
          style={{ position: 'absolute', insetBlockStart: 'calc(100% + 0.35rem)', insetInlineStart: 0, minInlineSize: '12rem' }}
        >
          {items.map((item, index) => (
            <button
              key={item.id}
              type="button"
              role="menuitem"
              className="wpl-menu-item"
              disabled={item.disabled}
              data-active={index === active || undefined}
              onMouseEnter={() => setActive(index)}
              onClick={() => select(item.id)}
            >
              <span>{item.label}</span>
              {item.shortcut ? <span className="wpl-menu-shortcut">{item.shortcut}</span> : null}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

export function ContextMenu({
  items,
  onSelect,
  children,
}: {
  items: MenuItem[];
  onSelect?: (id: string) => void;
  children: ReactNode;
}) {
  const [point, setPoint] = useState<{ x: number; y: number } | null>(null);
  const [active, setActive] = useState(0);
  const menuRef = useRef<HTMLDivElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);

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
    return bindDismissable({ root: menu, onDismiss: () => setPoint(null) });
  }, [point]);

  return (
    <div
      ref={rootRef}
      onContextMenu={(event) => {
        event.preventDefault();
        setPoint({ x: event.clientX, y: event.clientY });
        setActive(0);
      }}
      onKeyDown={(event) => {
        if (event.key === 'F10' && event.shiftKey) {
          event.preventDefault();
          const rect = rootRef.current?.getBoundingClientRect();
          setPoint({ x: rect?.left ?? 0, y: rect?.bottom ?? 0 });
        }
        if (!point) return;
        const next = nextIndex(active, items.length, event.key, 'vertical');
        if (next !== null) {
          event.preventDefault();
          setActive(next);
        }
        if (event.key === 'Enter') {
          const item = items[active];
          if (item) {
            onSelect?.(item.id);
            setPoint(null);
          }
        }
      }}
      tabIndex={0}
    >
      {children}
      {point ? (
        <div ref={menuRef} role="menu" className="wpl-menu" style={{ position: 'fixed', zIndex: 80 }}>
          {items.map((item, index) => (
            <button
              key={item.id}
              type="button"
              role="menuitem"
              className="wpl-menu-item"
              data-active={index === active || undefined}
              onClick={() => {
                onSelect?.(item.id);
                setPoint(null);
              }}
            >
              {item.label}
            </button>
          ))}
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
  children: ReactNode;
  trigger?: ReactNode;
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
        <div ref={panelRef} id={id} className="wpl-popover" style={{ position: 'absolute', insetBlockStart: 'calc(100% + 0.35rem)', insetInlineStart: 0 }}>
          {children}
        </div>
      ) : null}
    </div>
  );
}

export function Tooltip({ content, children }: { content: string; children: ReactNode }) {
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
    <span style={{ position: 'relative', display: 'inline-flex' }} onMouseEnter={show} onMouseLeave={hide} onFocus={show} onBlur={hide}>
      <span aria-describedby={open ? id : undefined} onKeyDown={(event) => event.key === 'Escape' && hide()}>
        {children}
      </span>
      {open ? (
        <span id={id} role="tooltip" className="wpl-tooltip" style={{ position: 'absolute', insetBlockEnd: 'calc(100% + 0.35rem)', insetInlineStart: 0 }}>
          {content}
        </span>
      ) : null}
    </span>
  );
}
