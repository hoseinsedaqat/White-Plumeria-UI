<script lang="ts">
  import { buttonGroupClassName } from '@white-plumeria/core';
  import type { Snippet } from 'svelte';
  let { label, joined = false, children }: { label: string; joined?: boolean; children?: Snippet } = $props();
</script>

<div role="group" aria-label={label} class={buttonGroupClassName(joined)}>
  {@render children?.()}
</div>
