<script lang="ts">
  import { nextIndex } from '@white-plumeria/core';
  import Button from './Button.svelte';
  let {
    label,
    items,
    onselect,
  }: {
    label: string;
    items: Array<{ id: string; label: string; disabled?: boolean }>;
    onselect?: (id: string) => void;
  } = $props();
  let open = $state(false);
  let active = $state(0);
</script>

<div class="wpl-menu">
  <Button variant="secondary" aria-expanded={open} aria-haspopup="menu" onclick={() => (open = !open)}>{label}</Button>
  {#if open}
    <div
      role="menu"
      tabindex="-1"
      class="wpl-menu-panel"
      onkeydown={(event) => {
        if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
          event.preventDefault();
          active = nextIndex(active, items.length, event.key, 'vertical') ?? active;
        }
        if (event.key === 'Escape') open = false;
      }}
    >
      {#each items as item, index (item.id)}
        <button
          type="button"
          role="menuitem"
          class="wpl-menu-item"
          disabled={item.disabled}
          tabindex={index === active ? 0 : -1}
          onclick={() => {
            onselect?.(item.id);
            open = false;
          }}
        >
          {item.label}
        </button>
      {/each}
    </div>
  {/if}
</div>
