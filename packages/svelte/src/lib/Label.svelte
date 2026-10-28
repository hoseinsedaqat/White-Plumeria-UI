<script lang="ts">
  import type { Snippet } from 'svelte';
  import { useWhitePlumeria } from './context.svelte.ts';
  let { for: htmlFor = '', required = false, children }: { for?: string; required?: boolean; children?: Snippet } = $props();
  const wpl = useWhitePlumeria();
</script>
<label class="wpl-label" for={htmlFor || undefined}>
  {@render children?.()}
  {#if required}<span class="wpl-required" aria-hidden="true">*</span><span class="wpl-sr-only">{wpl.t('required')}</span>{/if}
</label>
