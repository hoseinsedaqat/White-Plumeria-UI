<script lang="ts">
  let { label, value, hint = '' }: { label: string; value: string; hint?: string } = $props();
</script>
<article class="wpl-card wpl-stat">
  <p class="wpl-stat-label">{label}</p>
  <p class="wpl-stat-value">{value}</p>
  {#if hint}<p class="wpl-stat-hint">{hint}</p>{/if}
</article>
