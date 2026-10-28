<script lang="ts">
  import type { Snippet } from 'svelte';
  let { title, description = '', children }: { title: string; description?: string; children?: Snippet } = $props();
</script>
<div class="wpl-empty">
  <h2 class="wpl-empty-title">{title}</h2>
  {#if description}<p class="wpl-empty-description">{description}</p>{/if}
  {@render children?.()}
</div>
