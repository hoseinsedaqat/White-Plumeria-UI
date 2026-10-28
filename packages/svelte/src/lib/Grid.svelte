<script lang="ts">
  import { gridClassName, type GridColumns } from '@white-plumeria/core';
  import type { Snippet } from 'svelte';
  let { columns = 2, children }: { columns?: GridColumns; children?: Snippet } = $props();
</script>
<div class={gridClassName(columns)}>{@render children?.()}</div>
