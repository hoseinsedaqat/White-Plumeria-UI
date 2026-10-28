<script lang="ts">
  import { badgeClassName, type BadgeVariant } from '@white-plumeria/core';
  import type { Snippet } from 'svelte';
  let { variant = 'neutral', children }: { variant?: BadgeVariant; children?: Snippet } = $props();
</script>
<span class={badgeClassName(variant)}>{@render children?.()}</span>
