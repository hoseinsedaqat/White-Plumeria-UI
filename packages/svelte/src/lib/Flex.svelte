<script lang="ts">
  import { cx } from '@white-plumeria/core';
  import type { Snippet } from 'svelte';
  let { justify = 'start', wrap = false, children }: { justify?: 'start' | 'between' | 'end'; wrap?: boolean; children?: Snippet } = $props();
</script>
<div class={cx('wpl-flex', wrap && 'wpl-flex-wrap', justify === 'between' && 'wpl-flex-between', justify === 'end' && 'wpl-flex-end')}>{@render children?.()}</div>
