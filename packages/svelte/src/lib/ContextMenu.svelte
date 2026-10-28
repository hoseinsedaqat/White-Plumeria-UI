<script lang="ts">
  import type { Snippet } from 'svelte';
  let { items, children, onselect }: { items: Array<{ id: string; label: string }>; children?: Snippet; onselect?: (id: string) => void } = $props();
  let point = $state<{ x: number; y: number } | null>(null);
</script>

<div
  role="group"
  oncontextmenu={(event) => {
    event.preventDefault();
    point = { x: event.clientX, y: event.clientY };
  }}
  onkeydown={(event) => {
    if (event.key === 'Escape') point = null;
  }}
>
  {@render children?.()}
  {#if point}
    <div role="menu" class="wpl-menu-panel" style:position="fixed" style:inset-inline-start="{point.x}px" style:inset-block-start="{point.y}px">
      {#each items as item (item.id)}
        <button
          type="button"
          role="menuitem"
          class="wpl-menu-item"
          onclick={() => {
            onselect?.(item.id);
            point = null;
          }}
        >
          {item.label}
        </button>
      {/each}
    </div>
  {/if}
</div>
