<script lang="ts">
  import Icon from './Icon.svelte';
  import { useWhitePlumeria } from './context.svelte.ts';
  let { page = $bindable(1), pageCount, label = '' }: { page?: number; pageCount: number; label?: string } = $props();
  const wpl = useWhitePlumeria();
</script>
<nav class="wpl-pagination" aria-label={label || wpl.t('pagination')}>
  <button type="button" class="wpl-page" disabled={page <= 1} onclick={() => (page -= 1)}><Icon name="chevronLeft" /><span class="wpl-sr-only">{wpl.t('previous')}</span></button>
  <span>{wpl.t('page')} {page}</span>
  <button type="button" class="wpl-page" disabled={page >= pageCount} onclick={() => (page += 1)}><Icon name="chevronRight" /><span class="wpl-sr-only">{wpl.t('next')}</span></button>
</nav>
