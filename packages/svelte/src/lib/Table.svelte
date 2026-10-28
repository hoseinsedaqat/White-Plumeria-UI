<script lang="ts">
  import type { Snippet } from 'svelte';
  let { caption, children }: { caption: string; children?: Snippet } = $props();
</script>
<div class="wpl-table-wrap"><table class="wpl-table"><caption>{caption}</caption>{@render children?.()}</table></div>
