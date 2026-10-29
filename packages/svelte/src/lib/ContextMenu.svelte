<script lang="ts">
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
  import type { Snippet } from 'svelte';

  interface Item {
    id: string;
    label: string;
    disabled?: boolean;
    items?: Item[];
  }

  let {
    items,
    children,
    label = 'Context menu',
    onselect,
  }: { items: Item[]; children?: Snippet; label?: string; onselect?: (id: string) => void } = $props();
  let point = $state<{ x: number; y: number } | null>(null);
  let active = $state(0);
  let subActive = $state<number | null>(null);
  let root = $state<HTMLElement>();
  let menu = $state<HTMLElement>();
  const menuId = $props.id();
  const parent = $derived(items[active]);
  const childrenItems = $derived(parent?.items ?? []);
  const current = $derived(subActive === null ? parent : childrenItems[subActive]);

  function close() {
    subActive = null;
    point = null;
  }

  function openAt(x: number, y: number) {
    subActive = null;
    active = firstEnabledIndex(items);
    point = { x, y };
    root?.focus();
  }

  function openSubmenu(index = active) {
    const item = items[index];
    if (!menuHasSubmenu(item)) return;
    active = index;
    subActive = firstEnabledIndex(item.items);
  }

  $effect(() => {
    if (!point || !menu) return;
    const placed = placeOverlay(
      { x: point.x, y: point.y, width: 0, height: 0 },
      { width: menu.offsetWidth || 180, height: menu.offsetHeight || 120 },
      { width: window.innerWidth, height: window.innerHeight },
      'end',
    );
    menu.style.left = `${placed.left}px`;
    menu.style.top = `${placed.top}px`;
    const nested = subActive !== null;
    return bindDismissable({
      root: menu,
      onDismiss: () => {
        if (nested) {
          subActive = null;
          return;
        }
        point = null;
      },
    });
  });

  function onKeydown(event: KeyboardEvent) {
    if (event.shiftKey && event.key === 'F10') {
      event.preventDefault();
      const rect = root?.getBoundingClientRect();
      openAt(rect?.left ?? 0, rect?.bottom ?? 0);
      return;
    }
    if (!point) return;
    const command = menuCommand({
      key: event.key,
      direction: readingDirection(root),
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
      subActive = null;
      return;
    }
    if (command === 'open-submenu') {
      openSubmenu();
      return;
    }
    if (command === 'activate') {
      if (current && !current.disabled && !menuHasSubmenu(current)) {
        onselect?.(current.id);
        close();
      }
      return;
    }
    const motion = command as MenuMotion;
    if (subActive === null) active = moveEnabledIndex(items, active, motion);
    else subActive = moveEnabledIndex(childrenItems, subActive, motion);
  }
</script>

<!-- The region is the keyboard target for Shift+F10. It is not a button. -->
<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
<div
  bind:this={root}
  role="group"
  aria-label={label}
  tabindex="0"
  aria-controls={point ? menuId : undefined}
  aria-activedescendant={point && current ? `${menuId}-${current.id}` : undefined}
  oncontextmenu={(event) => {
    event.preventDefault();
    openAt(event.clientX, event.clientY);
  }}
  onkeydown={onKeydown}
>
  {@render children?.()}
  {#if point}
    <div bind:this={menu} id={menuId} role="menu" aria-label={label} class="wpl-menu wpl-menu-fixed" style:left="{point.x}px" style:top="{point.y}px">
      {#each items as item, index (item.id)}
        {@const nested = menuHasSubmenu(item)}
        {@const expanded = nested && index === active && subActive !== null}
        <div class="wpl-menu-row">
          <button
            id="{menuId}-{item.id}"
            type="button"
            role="menuitem"
            class="wpl-menu-item"
            disabled={item.disabled}
            aria-haspopup={nested ? 'menu' : undefined}
            aria-expanded={nested ? expanded : undefined}
            aria-controls={expanded ? `${menuId}-sub-${item.id}` : undefined}
            data-active={subActive === null && index === active ? 'true' : undefined}
            onmouseenter={() => {
              active = index;
              if (nested) openSubmenu(index);
              else subActive = null;
            }}
            onclick={() => {
              if (nested) openSubmenu(index);
              else if (!item.disabled) {
                onselect?.(item.id);
                close();
              }
            }}
          >
            <span>{item.label}</span>
            {#if nested}<span class="wpl-menu-caret" aria-hidden="true"></span>{/if}
          </button>
          {#if expanded}
            <div id="{menuId}-sub-{item.id}" role="menu" aria-label={item.label} class="wpl-menu wpl-menu-sub">
              {#each item.items ?? [] as child, childIndex (child.id)}
                <button
                  id="{menuId}-{child.id}"
                  type="button"
                  role="menuitem"
                  class="wpl-menu-item"
                  disabled={child.disabled}
                  data-active={childIndex === subActive ? 'true' : undefined}
                  onmouseenter={() => (subActive = childIndex)}
                  onclick={() => {
                    if (!child.disabled) {
                      onselect?.(child.id);
                      close();
                    }
                  }}
                >
                  {child.label}
                </button>
              {/each}
            </div>
          {/if}
        </div>
      {/each}
    </div>
  {/if}
</div>
