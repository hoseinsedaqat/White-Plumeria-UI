<script lang="ts">
  import type { Snippet } from 'svelte';
  import Icon from './Icon.svelte';
  let { href, external = false, children }: { href: string; external?: boolean; children?: Snippet } = $props();
</script>

<a class="wpl-link" {href} target={external ? '_blank' : undefined} rel={external ? 'noreferrer noopener' : undefined}>
  {@render children?.()}
  {#if external}<span class="wpl-sr-only"> (opens in a new tab)</span><Icon name="external" />{/if}
</a>
