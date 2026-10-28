<script lang="ts">
  import type { Snippet } from 'svelte';
  import Dialog from './Dialog.svelte';
  let {
    open = $bindable(false),
    title,
    description = '',
    children,
  }: { open?: boolean; title: string; description?: string; children?: Snippet } = $props();
</script>

<Dialog bind:open {title} {description}>{@render children?.()}</Dialog>
