<script lang="ts">
  import Icon from './Icon.svelte';
  import { useWhitePlumeria } from './context.svelte.ts';
  let { page = $bindable(1), pageCount, label = '' }: { page?: number; pageCount: number; label?: string } = $props();
  const wpl = useWhitePlumeria();
  const count = $derived(Math.max(1, pageCount));
  const current = $derived(Math.min(count, Math.max(1, page)));
  const pages = $derived(
    Array.from({ length: count }, (_, index) => index + 1).filter(
      (item) => item === 1 || item === count || Math.abs(item - current) <= 1,
    ),
  );
</script>

<nav class="wpl-pagination" aria-label={label || wpl.t('pagination')}>
  <button type="button" class="wpl-page" disabled={current <= 1} onclick={() => (page = current - 1)}>
    <Icon name="chevronLeft" />
    <span class="wpl-sr-only">{wpl.t('previous')}</span>
  </button>
  {#each pages as item, index (item)}
    {#if index > 0 && item - (pages[index - 1] ?? item) > 1}
      <span aria-hidden="true">…</span>
    {/if}
    <button type="button" class="wpl-page" aria-current={item === current ? 'page' : undefined} onclick={() => (page = item)}>
      {item}
    </button>
  {/each}
  <button type="button" class="wpl-page" disabled={current >= count} onclick={() => (page = current + 1)}>
    <Icon name="chevronRight" />
    <span class="wpl-sr-only">{wpl.t('next')}</span>
  </button>
</nav>
