<script lang="ts">
  import type { Snippet } from 'svelte';
  let { title = '', description = '', children, footer }: { title?: string; description?: string; children?: Snippet; footer?: Snippet } = $props();
</script>
<section class="wpl-card">
  {#if title || description}
    <header class="wpl-card-header">
      {#if title}<h2 class="wpl-card-title">{title}</h2>{/if}
      {#if description}<p class="wpl-card-description">{description}</p>{/if}
    </header>
  {/if}
  {#if children}<div class="wpl-card-body">{@render children()}</div>{/if}
  {#if footer}<div class="wpl-card-footer">{@render footer()}</div>{/if}
</section>
