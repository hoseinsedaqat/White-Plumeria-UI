<script lang="ts">
  import type { Snippet } from 'svelte';
  import Icon from './Icon.svelte';
  import { useWhitePlumeria } from './context.svelte.ts';
  let { href, external = false, children }: { href: string; external?: boolean; children?: Snippet } = $props();
  const wpl = useWhitePlumeria();
</script>

<a class="wpl-link" {href} target={external ? '_blank' : undefined} rel={external ? 'noreferrer noopener' : undefined}>
  {@render children?.()}
  {#if external}<span class="wpl-sr-only"> ({wpl.t('newTab')})</span><Icon name="external" />{/if}
</a>
