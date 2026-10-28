<script lang="ts">
  import type { Snippet } from 'svelte';
  import Button from './Button.svelte';
  let { label = 'Details', children }: { label?: string; children?: Snippet } = $props();
  let open = $state(false);
  const id = $props.id();
</script>

<div style:position="relative" style:display="inline-block">
  <Button variant="secondary" aria-expanded={open} aria-controls={id} onclick={() => (open = !open)}>{label}</Button>
  {#if open}
    <div {id} class="wpl-popover" style:position="absolute" style:inset-block-start="calc(100% + 0.35rem)">{@render children?.()}</div>
  {/if}
</div>
