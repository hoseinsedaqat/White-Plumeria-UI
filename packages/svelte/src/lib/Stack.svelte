<script lang="ts">
  import { stackClassName, type StackGap } from '@white-plumeria/core';
  import type { Snippet } from 'svelte';
  let { gap = 'md', children }: { gap?: StackGap; children?: Snippet } = $props();
</script>
<div class={stackClassName(gap)}>{@render children?.()}</div>
