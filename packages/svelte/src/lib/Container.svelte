<script lang="ts">
  import { containerClassName, type ContainerSize } from '@white-plumeria/core';
  import type { Snippet } from 'svelte';
  let { size = 'lg', children }: { size?: ContainerSize; children?: Snippet } = $props();
</script>
<div class={containerClassName(size)}>{@render children?.()}</div>
