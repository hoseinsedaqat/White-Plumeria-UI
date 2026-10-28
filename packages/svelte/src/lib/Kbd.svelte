<script lang="ts">
  import type { Snippet } from 'svelte';

  let { keys = [], children }: { keys?: string[]; children?: Snippet } = $props();
</script>

{#if keys.length > 0}
  <span class="wpl-kbd-group">
    {#each keys as key, index (key + index)}
      {#if index > 0}<span aria-hidden="true">+</span>{/if}
      <kbd class="wpl-kbd">{key}</kbd>
    {/each}
  </span>
{:else}
  <kbd class="wpl-kbd">{@render children?.()}</kbd>
{/if}
