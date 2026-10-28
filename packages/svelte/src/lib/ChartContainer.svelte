<script lang="ts">
  import { formatNumber } from '@white-plumeria/core';
  import { useWhitePlumeria } from './context.svelte.ts';
  let { title, description = '', data }: { title: string; description?: string; data: Array<{ label: string; value: number }> } = $props();
  const wpl = useWhitePlumeria();
  const invalid = $derived(data.some((point) => !Number.isFinite(point.value) || point.value < 0));
  const max = $derived(Math.max(1, ...data.map((point) => point.value)));
</script>
<figure class="wpl-chart">
  <figcaption class="wpl-card-title">{title}</figcaption>
  {#if description}<p class="wpl-muted">{description}</p>{/if}
  {#if invalid}
    <p class="wpl-field-error" role="alert">ChartContainer accepts finite, non-negative values only.</p>
  {:else}
    <div aria-hidden="true">
      {#each data as point (point.label)}
        <div class="wpl-chart-bar"><span>{point.label}</span><span class="wpl-chart-fill" style:inline-size={`${(point.value / max) * 100}%`}></span></div>
      {/each}
    </div>
  {/if}
  <table class="wpl-table">
    <caption>{title}</caption>
    <tbody>
      {#each data as point (point.label)}
        <tr><th scope="row">{point.label}</th><td>{formatNumber(point.value, wpl.preferences.locale)}</td></tr>
      {/each}
    </tbody>
  </table>
</figure>
