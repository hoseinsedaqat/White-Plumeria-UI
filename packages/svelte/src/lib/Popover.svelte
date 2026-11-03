<script lang="ts">
  import { bindDismissable } from '@white-plumeria/core';
  import type { Snippet } from 'svelte';
  import Button from './Button.svelte';
  let { label = 'Details', children }: { label?: string; children?: Snippet } = $props();
  let open = $state(false);
  let root: HTMLElement | undefined = $state();
  let panel: HTMLElement | undefined = $state();
  const id = $props.id();
  $effect(() => {
    if (!open || !panel) return;
    return bindDismissable({ root: panel, owner: root, onDismiss: () => (open = false) });
  });
</script>

<div bind:this={root} style:position="relative" style:display="inline-block">
  <Button variant="secondary" aria-expanded={open} aria-controls={id} onclick={() => (open = !open)}>{label}</Button>
  {#if open}
    <div bind:this={panel} {id} class="wpl-popover" style:position="absolute" style:inset-block-start="calc(100% + 0.35rem)">{@render children?.()}</div>
  {/if}
</div>
