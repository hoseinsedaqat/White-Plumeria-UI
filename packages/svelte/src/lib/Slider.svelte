<script lang="ts">
  import { formatNumber } from '@white-plumeria/core';
  import { useWhitePlumeria } from './context.svelte.ts';
  let { label, min = 0, max = 100, step = 1, value = $bindable(0) }: { label: string; min?: number; max?: number; step?: number; value?: number } = $props();
  const wpl = useWhitePlumeria();
  const id = $props.id();
</script>
<div class="wpl-field">
  <div class="wpl-flex wpl-flex-between">
    <label class="wpl-label" for={id}>{label}</label>
    <output for={id}>{formatNumber(value, wpl.preferences.locale)}</output>
  </div>
  <input {id} class="wpl-slider" type="range" {min} {max} {step} bind:value aria-valuetext={formatNumber(value, wpl.preferences.locale)} />
</div>
