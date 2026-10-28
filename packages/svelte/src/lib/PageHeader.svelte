<script lang="ts">
  import type { Snippet } from 'svelte';
  let { title, description = '', actions }: { title: string; description?: string; actions?: Snippet } = $props();
</script>
<header class="wpl-page-header">
  <div>
    <h1 class="wpl-page-title">{title}</h1>
    {#if description}<p class="wpl-muted">{description}</p>{/if}
  </div>
  {#if actions}<div class="wpl-cluster">{@render actions()}</div>{/if}
</header>
