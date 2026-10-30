import {
  bindDismissable,
  firstEnabledIndex,
  menuCommand,
  menuHasSubmenu,
  moveEnabledIndex,
  typeaheadMove,
  placeOverlay,
  readingDirection,
  type MenuMotion,
} from '@white-plumeria/core';
import { $, component$, Slot, useId, useSignal, useVisibleTask$, type QRL } from '@qwik.dev/core';
import { Button } from './button';

export interface MenuItem {
  id: string;
  label: string;
  disabled?: boolean;
  shortcut?: string;
  items?: MenuItem[];
}

export const DropdownMenu = component$<{
  label: string;
  items: MenuItem[];
  onSelect$?: QRL<(id: string) => void>;
}>((props) => {
  const open = useSignal(false);
  const active = useSignal(0);
  const subActive = useSignal<number | null>(null);
  const buttonRef = useSignal<HTMLButtonElement>();
  const menuRef = useSignal<HTMLDivElement>();
  const typeahead = useSignal({ query: '', at: 0 });
  const menuId = useId();
  const parent = props.items[active.value];
  const children = parent?.items ?? [];
  const current = subActive.value === null ? parent : children[subActive.value];
  const activeId = current ? `${menuId}-${current.id}` : undefined;
  const select = $((id: string) => {
    void props.onSelect$?.(id);
    open.value = false;
    subActive.value = null;
    buttonRef.value?.focus();
  });
  const openSubmenu = $((index: number) => {
    const item = props.items[index];
    if (!menuHasSubmenu(item)) return;
    active.value = index;
    subActive.value = firstEnabledIndex(item?.items ?? []);
  });

  useVisibleTask$(({ track, cleanup }) => {
    const isOpen = track(() => open.value);
    const root = menuRef.value;
    if (!isOpen || !root) return;
    const stop = bindDismissable({
      root,
      owner: buttonRef.value ?? undefined,
      onDismiss: () => {
        if (subActive.value !== null) {
          subActive.value = null;
          return;
        }
        open.value = false;
      },
    });
    cleanup(() => stop());
  });

  return (
    <div class="wpl-menu-root">
      <Button
        ref={buttonRef}
        variant="secondary"
        aria-haspopup="menu"
        aria-expanded={open.value}
        aria-controls={menuId}
        aria-activedescendant={open.value ? activeId : undefined}
        onClick$={() => {
          open.value = !open.value;
          subActive.value = null;
          active.value = firstEnabledIndex(props.items);
        }}
        onKeyDown$={(event, element) => {
          const command = menuCommand({
            key: event.key,
            direction: readingDirection(element),
            open: open.value,
            submenuOpen: subActive.value !== null,
            hasSubmenu: menuHasSubmenu(current),
          });
          if (!command) {
            if (!open.value) return;
            const pool = subActive.value === null ? props.items : children;
            const from = subActive.value === null ? active.value : subActive.value;
            const next = typeaheadMove(typeahead.value, pool, event.key, Date.now(), from);
            if (next === null) return;
            event.preventDefault();
            if (subActive.value === null) active.value = next;
            else subActive.value = next;
            return;
          }
          event.preventDefault();
          if (command === 'close' || command === 'close-submenu') event.stopPropagation();
          if (command === 'open') {
            open.value = true;
            active.value = firstEnabledIndex(props.items);
            subActive.value = null;
            return;
          }
          if (command === 'close') {
            open.value = false;
            subActive.value = null;
            return;
          }
          if (command === 'close-submenu') {
            subActive.value = null;
            return;
          }
          if (command === 'open-submenu') {
            open.value = true;
            void openSubmenu(active.value);
            return;
          }
          if (command === 'activate') {
            if (current && !current.disabled && !menuHasSubmenu(current)) void select(current.id);
            return;
          }
          if (!open.value) {
            open.value = true;
            active.value = firstEnabledIndex(props.items);
            subActive.value = null;
            return;
          }
          const motion = command as MenuMotion;
          if (subActive.value === null) active.value = moveEnabledIndex(props.items, active.value, motion);
          else subActive.value = moveEnabledIndex(children, subActive.value, motion);
        }}
      >
        {props.label}
      </Button>
      {open.value ? (
        <div ref={menuRef} id={menuId} role="menu" aria-label={props.label} class="wpl-menu wpl-menu-panel">
          {props.items.map((item, index) => {
            const nested = menuHasSubmenu(item);
            const expanded = nested && index === active.value && subActive.value !== null;
            return (
              <div key={item.id} class="wpl-menu-row">
                <button
                  id={`${menuId}-${item.id}`}
                  type="button"
                  role="menuitem"
                  class="wpl-menu-item"
                  disabled={item.disabled}
                  aria-haspopup={nested ? 'menu' : undefined}
                  aria-expanded={nested ? expanded : undefined}
                  aria-controls={expanded ? `${menuId}-sub-${item.id}` : undefined}
                  data-active={subActive.value === null && index === active.value ? 'true' : undefined}
                  onMouseEnter$={() => {
                    active.value = index;
                    if (nested) void openSubmenu(index);
                    else subActive.value = null;
                  }}
                  onClick$={() => {
                    if (nested) {
                      const next = firstEnabledIndex(item.items ?? []);
                      active.value = index;
                      subActive.value = next;
                      return;
                    }
                    if (item.disabled) return;
                    void props.onSelect$?.(item.id);
                    open.value = false;
                    subActive.value = null;
                    buttonRef.value?.focus();
                  }}
                >
                  <span>{item.label}</span>
                  {nested ? <span class="wpl-menu-caret" aria-hidden="true" /> : null}
                  {!nested && item.shortcut ? <span class="wpl-menu-shortcut">{item.shortcut}</span> : null}
                </button>
                {expanded ? (
                  <div id={`${menuId}-sub-${item.id}`} role="menu" aria-label={item.label} class="wpl-menu wpl-menu-sub">
                    {item.items?.map((child, childIndex) => (
                      <button
                        key={child.id}
                        id={`${menuId}-${child.id}`}
                        type="button"
                        role="menuitem"
                        class="wpl-menu-item"
                        disabled={child.disabled}
                        data-active={childIndex === subActive.value ? 'true' : undefined}
                        onMouseEnter$={() => { subActive.value = childIndex; }}
                        onClick$={() => {
                          if (child.disabled) return;
                          void props.onSelect$?.(child.id);
                          open.value = false;
                          subActive.value = null;
                          buttonRef.value?.focus();
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
});

export const ContextMenu = component$<{ items: MenuItem[]; label?: string; onSelect$?: QRL<(id: string) => void> }>((props) => {
  const point = useSignal<{ x: number; y: number } | null>(null);
  const active = useSignal(0);
  const subActive = useSignal<number | null>(null);
  const menuRef = useSignal<HTMLDivElement>();
  const rootRef = useSignal<HTMLDivElement>();
  const typeahead = useSignal({ query: '', at: 0 });
  const menuId = useId();
  const label = props.label ?? 'Context menu';
  const parent = props.items[active.value];
  const childrenItems = parent?.items ?? [];
  const current = subActive.value === null ? parent : childrenItems[subActive.value];
  const openSubmenu = $((index: number) => {
    const item = props.items[index];
    if (!menuHasSubmenu(item)) return;
    active.value = index;
    subActive.value = firstEnabledIndex(item?.items ?? []);
  });

  useVisibleTask$(({ track, cleanup }) => {
    const origin = track(() => point.value);
    const menu = menuRef.value;
    if (!origin || !menu) return;
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
        if (subActive.value !== null) {
          subActive.value = null;
          return;
        }
        point.value = null;
      },
    });
    cleanup(() => stop());
  });

  return (
    <div
      ref={rootRef}
      role="group"
      aria-label={label}
      tabIndex={0}
      aria-controls={point.value ? menuId : undefined}
      aria-activedescendant={point.value && current ? `${menuId}-${current.id}` : undefined}
      preventdefault:contextmenu
      onContextMenu$={(event) => {
        subActive.value = null;
        active.value = firstEnabledIndex(props.items);
        point.value = { x: event.clientX, y: event.clientY };
        rootRef.value?.focus();
      }}
      onKeyDown$={(event) => {
        if (event.key === 'F10' && event.shiftKey) {
          event.preventDefault();
          const rect = rootRef.value?.getBoundingClientRect();
          subActive.value = null;
          active.value = firstEnabledIndex(props.items);
          point.value = { x: rect?.left ?? 0, y: rect?.bottom ?? 0 };
          rootRef.value?.focus();
          return;
        }
        if (!point.value) return;
        const command = menuCommand({
          key: event.key,
          direction: readingDirection(rootRef.value),
          open: true,
          submenuOpen: subActive.value !== null,
          hasSubmenu: menuHasSubmenu(current),
        });
        if (!command) {
          const pool = subActive.value === null ? props.items : childrenItems;
          const from = subActive.value === null ? active.value : (subActive.value ?? 0);
          const next = typeaheadMove(typeahead.value, pool, event.key, Date.now(), from);
          if (next === null) return;
          event.preventDefault();
          if (subActive.value === null) active.value = next;
          else subActive.value = next;
          return;
        }
        if (command === 'open') return;
        event.preventDefault();
        if (command === 'close') {
          subActive.value = null;
          point.value = null;
          return;
        }
        if (command === 'close-submenu') {
          subActive.value = null;
          return;
        }
        if (command === 'open-submenu') {
          void openSubmenu(active.value);
          return;
        }
        if (command === 'activate') {
          if (current && !current.disabled && !menuHasSubmenu(current)) {
            void props.onSelect$?.(current.id);
            subActive.value = null;
            point.value = null;
          }
          return;
        }
        const motion = command as MenuMotion;
        if (subActive.value === null) active.value = moveEnabledIndex(props.items, active.value, motion);
        else subActive.value = moveEnabledIndex(childrenItems, subActive.value, motion);
      }}
    >
      <Slot />
      {point.value ? (
        <div ref={menuRef} id={menuId} role="menu" aria-label={label} class="wpl-menu wpl-menu-fixed">
          {props.items.map((item, index) => {
            const nested = menuHasSubmenu(item);
            const expanded = nested && index === active.value && subActive.value !== null;
            return (
              <div key={item.id} class="wpl-menu-row">
                <button
                  id={`${menuId}-${item.id}`}
                  type="button"
                  role="menuitem"
                  class="wpl-menu-item"
                  disabled={item.disabled}
                  aria-haspopup={nested ? 'menu' : undefined}
                  aria-expanded={nested ? expanded : undefined}
                  data-active={subActive.value === null && index === active.value ? 'true' : undefined}
                  onMouseEnter$={() => {
                    active.value = index;
                    if (nested) void openSubmenu(index);
                    else subActive.value = null;
                  }}
                  onClick$={() => {
                    if (nested) void openSubmenu(index);
                    else if (!item.disabled) {
                      void props.onSelect$?.(item.id);
                      subActive.value = null;
                      point.value = null;
                    }
                  }}
                >
                  <span>{item.label}</span>
                  {nested ? <span class="wpl-menu-caret" aria-hidden="true" /> : null}
                </button>
                {expanded ? (
                  <div id={`${menuId}-sub-${item.id}`} role="menu" aria-label={item.label} class="wpl-menu wpl-menu-sub">
                    {item.items?.map((child, childIndex) => (
                      <button
                        key={child.id}
                        id={`${menuId}-${child.id}`}
                        type="button"
                        role="menuitem"
                        class="wpl-menu-item"
                        disabled={child.disabled}
                        data-active={childIndex === subActive.value ? 'true' : undefined}
                        onClick$={() => {
                          if (!child.disabled) {
                            void props.onSelect$?.(child.id);
                            subActive.value = null;
                            point.value = null;
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
});

export const Popover = component$<{ label?: string }>((props) => {
  const open = useSignal(false);
  const id = useId();
  const rootRef = useSignal<HTMLDivElement>();
  const panelRef = useSignal<HTMLDivElement>();
  useVisibleTask$(({ track, cleanup }) => {
    const isOpen = track(() => open.value);
    const panel = panelRef.value;
    if (!isOpen || !panel) return;
    const stop = bindDismissable({
      root: panel,
      owner: rootRef.value ?? undefined,
      onDismiss: () => { open.value = false; },
    });
    cleanup(() => stop());
  });
  return (
    <div ref={rootRef} style={{ position: 'relative', display: 'inline-block' }}>
      <Button variant="secondary" aria-expanded={open.value} aria-controls={id} onClick$={() => { open.value = !open.value; }}>
        {props.label}
        <Slot name="trigger" />
      </Button>
      {open.value ? (
        <div ref={panelRef} id={id} class="wpl-popover" style={{ position: 'absolute', insetBlockStart: 'calc(100% + 0.35rem)', insetInlineStart: 0 }}>
          <Slot />
        </div>
      ) : null}
    </div>
  );
});

export const Tooltip = component$<{ content: string }>((props) => {
  const open = useSignal(false);
  const id = useId();
  const timer = useSignal<number | null>(null);
  return (
    <span
      style={{ position: 'relative', display: 'inline-flex' }}
      onMouseEnter$={() => { timer.value = window.setTimeout(() => { open.value = true; }, 400); }}
      onMouseLeave$={() => {
        if (timer.value) window.clearTimeout(timer.value);
        open.value = false;
      }}
      onFocus$={() => { timer.value = window.setTimeout(() => { open.value = true; }, 400); }}
      onBlur$={() => {
        if (timer.value) window.clearTimeout(timer.value);
        open.value = false;
      }}
    >
      <span aria-describedby={open.value ? id : undefined} onKeyDown$={(event) => { if (event.key === 'Escape') open.value = false; }}>
        <Slot />
      </span>
      {open.value ? (
        <span id={id} role="tooltip" class="wpl-tooltip" style={{ position: 'absolute', insetBlockEnd: 'calc(100% + 0.35rem)', insetInlineStart: 0 }}>
          {props.content}
        </span>
      ) : null}
    </span>
  );
});
