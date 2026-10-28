<script lang="ts">
  import type { Snippet } from 'svelte';
  let { open = false, sidebar, children }: { open?: boolean; sidebar?: Snippet; children?: Snippet } = $props();
</script>
<div class="wpl-layout" data-open={open || undefined}>
  {@render sidebar?.()}
  <div class="wpl-layout-main">{@render children?.()}</div>
</div>
