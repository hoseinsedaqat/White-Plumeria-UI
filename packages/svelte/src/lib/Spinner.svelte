<script lang="ts">
  import { spinnerClassName, type ControlSize } from '@white-plumeria/core';
  import { useWhitePlumeria } from './context.svelte.ts';
  let { label, size = 'md' }: { label?: string; size?: ControlSize } = $props();
  const wpl = useWhitePlumeria();
  const diameter = $derived(size === 'sm' || size === 'lg' ? size : 'md');
</script>

<span class={spinnerClassName(diameter)} role="status"><span class="wpl-sr-only">{label || wpl.t('loading')}</span></span>
