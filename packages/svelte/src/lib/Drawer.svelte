<script lang="ts">
  import type { Snippet } from 'svelte';
  import Dialog from './Dialog.svelte';
  let {
    open = $bindable(false),
    title,
    description = '',
    side = 'end',
    children,
  }: {
    open?: boolean;
    title: string;
    description?: string;
    side?: 'start' | 'end';
    children?: Snippet;
  } = $props();
</script>

<Dialog bind:open {title} {description} panelClass={side === 'start' ? 'wpl-drawer wpl-drawer-start' : 'wpl-drawer'}>
  {@render children?.()}
</Dialog>
