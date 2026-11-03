<script lang="ts">
  import type { Snippet } from 'svelte';
  let { title = '', description = '', titleAs = 'h2', children, footer }: { title?: string; description?: string; titleAs?: 'h1' | 'h2' | 'h3' | 'h4'; children?: Snippet; footer?: Snippet } = $props();
  const heading = $derived(titleAs === 'h1' || titleAs === 'h3' || titleAs === 'h4' ? titleAs : 'h2');
</script>
<section class="wpl-card">
  {#if title || description}
    <header class="wpl-card-header">
      {#if title}<svelte:element this={heading} class="wpl-card-title">{title}</svelte:element>{/if}
      {#if description}<p class="wpl-card-description">{description}</p>{/if}
    </header>
  {/if}
  {#if children}<div class="wpl-card-body">{@render children()}</div>{/if}
  {#if footer}<div class="wpl-card-footer">{@render footer()}</div>{/if}
</section>
