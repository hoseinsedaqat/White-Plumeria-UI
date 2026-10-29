<script lang="ts">
  import {
    bindDismissable,
    firstEnabledIndex,
    menuCommand,
    menuHasSubmenu,
    moveEnabledIndex,
    readingDirection,
    type MenuMotion,
  } from '@white-plumeria/core';
  import Button from './Button.svelte';

  interface Item {
    id: string;
    label: string;
    disabled?: boolean;
    shortcut?: string;
    items?: Item[];
  }

  let { label, items, onselect }: { label: string; items: Item[]; onselect?: (id: string) => void } = $props();
  let open = $state(false);
  let active = $state(0);
  let subActive = $state<number | null>(null);
  let root = $state<HTMLElement>();
  const menuId = $props.id();
  const parent = $derived(items[active]);
  const children = $derived(parent?.items ?? []);
  const current = $derived(subActive === null ? parent : children[subActive]);

  $effect(() => {
    if (!open || !root) return;
    const nested = subActive !== null;
    return bindDismissable({
      root,
      onDismiss: () => {
        if (nested) {
          subActive = null;
          return;
        }
        open = false;
      },
    });
  });

  function choose(id: string) {
    onselect?.(id);
    open = false;
    subActive = null;
  }

  function openSubmenu(index = active) {
    const item = items[index];
    if (!menuHasSubmenu(item)) return;
    active = index;
    subActive = firstEnabledIndex(item.items ?? []);
  }

  function onKeydown(event: KeyboardEvent) {
    const command = menuCommand({
      key: event.key,
      direction: readingDirection(root),
      open,
      submenuOpen: subActive !== null,
      hasSubmenu: menuHasSubmenu(current),
    });
    if (!command) return;
    event.preventDefault();
    if (command === 'close' || command === 'close-submenu') event.stopPropagation();
    if (command === 'open') {
      open = true;
      active = firstEnabledIndex(items);
      subActive = null;
      return;
    }
    if (command === 'close') {
      open = false;
      subActive = null;
      return;
    }
    if (command === 'close-submenu') {
      subActive = null;
      return;
    }
    if (command === 'open-submenu') {
      open = true;
      openSubmenu();
      return;
    }
    if (command === 'activate') {
      if (current && !current.disabled && !menuHasSubmenu(current)) choose(current.id);
      return;
    }
    if (!open) {
      open = true;
      active = firstEnabledIndex(items);
      subActive = null;
      return;
    }
    const motion = command as MenuMotion;
    if (subActive === null) active = moveEnabledIndex(items, active, motion);
    else subActive = moveEnabledIndex(children, subActive, motion);
  }
</script>

<div class="wpl-menu-root" bind:this={root}>
  <Button
    variant="secondary"
    aria-expanded={open}
    aria-haspopup="menu"
    aria-controls={menuId}
    aria-activedescendant={open && current ? `${menuId}-${current.id}` : undefined}
    onclick={() => {
      open = !open;
      subActive = null;
      active = firstEnabledIndex(items);
    }}
    onkeydown={onKeydown}
  >{label}</Button>
  {#if open}
    <div id={menuId} role="menu" aria-label={label} class="wpl-menu wpl-menu-panel">
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
            data-active={subActive === null && index === active ? 'true' : undefined}
            onmouseenter={() => {
              active = index;
              if (nested) openSubmenu(index);
              else subActive = null;
            }}
            onclick={() => {
              if (nested) openSubmenu(index);
              else if (!item.disabled) choose(item.id);
            }}
          >
            <span>{item.label}</span>
            {#if nested}<span class="wpl-menu-caret" aria-hidden="true"></span>{/if}
            {#if !nested && item.shortcut}<span class="wpl-menu-shortcut">{item.shortcut}</span>{/if}
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
                    if (!child.disabled) choose(child.id);
                  }}
                >
                  <span>{child.label}</span>
                </button>
              {/each}
            </div>
          {/if}
        </div>
      {/each}
    </div>
  {/if}
</div>
