<script lang="ts">
  import { chartFigureHtml, resolveDirection, type ChartPoint } from '@white-plumeria/core';
  import { useWhitePlumeria } from './context.svelte.ts';

  let {
    title,
    description = '',
    data = [],
    type = 'area',
  }: {
    title: string;
    description?: string;
    data?: ChartPoint[];
    type?: 'line' | 'area' | 'bar';
  } = $props();
  const wpl = useWhitePlumeria();
  const markup = $derived(
    chartFigureHtml({
      title,
      description,
      data,
      type,
      direction: resolveDirection(wpl.preferences),
      locale: wpl.preferences.locale,
    }),
  );
</script>

<figure class="wpl-graph">{@html markup}</figure>
