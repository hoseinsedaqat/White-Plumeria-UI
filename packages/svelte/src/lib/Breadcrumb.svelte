<script lang="ts">
  import Icon from './Icon.svelte';
  import { useWhitePlumeria } from './context.svelte.ts';
  let { items }: { items: Array<{ href?: string; label: string }> } = $props();
  const wpl = useWhitePlumeria();
</script>
<nav class="wpl-breadcrumb" aria-label={wpl.t('breadcrumb')}>
  <ol>
    {#each items as item, index (item.label + index)}
      <li>
        {#if index > 0}<Icon name="chevronRight" />{/if}
        {#if index === items.length - 1 || !item.href}
          <span aria-current={index === items.length - 1 ? 'page' : undefined}>{item.label}</span>
        {:else}
          <a class="wpl-link" href={item.href}>{item.label}</a>
        {/if}
      </li>
    {/each}
  </ol>
</nav>
