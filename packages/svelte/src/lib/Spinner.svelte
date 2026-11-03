<script lang="ts">
  import { useWhitePlumeria } from './context.svelte.ts';
  let { label }: { label?: string } = $props();
  const wpl = useWhitePlumeria();
</script>
<span class="wpl-spinner" role="status"><span class="wpl-sr-only">{label || wpl.t('loading')}</span></span>
