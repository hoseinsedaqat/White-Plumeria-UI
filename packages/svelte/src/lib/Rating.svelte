<script lang="ts">
  import { clampInteger } from '@white-plumeria/core';
  import Icon from './Icon.svelte';
  import { useWhitePlumeria } from './context.svelte.ts';

  let {
    label,
    max = 5,
    value = $bindable(0),
    name = '',
    readOnly = false,
    onvaluechange,
  }: {
    label: string;
    max?: number;
    value?: number;
    name?: string;
    readOnly?: boolean;
    onvaluechange?: (value: number) => void;
  } = $props();

  const wpl = useWhitePlumeria();
  const uid = $props.id();
  const count = $derived(clampInteger(max, 1, 10, 5));
  const current = $derived(clampInteger(value, 0, count, 0));
  const groupName = $derived(name || uid);

  function select(score: number) {
    value = score;
    onvaluechange?.(score);
  }
</script>

{#if readOnly}
  <div class="wpl-rating" role="img" aria-label="{label}: {current} {wpl.t('of')} {count}">
    {#each Array.from({ length: count }, (_, index) => index) as index (index)}
      <span class={index < current ? 'wpl-rating-icon is-on' : 'wpl-rating-icon'} aria-hidden="true">
        <Icon name="star" />
      </span>
    {/each}
  </div>
{:else}
  <fieldset class="wpl-rating">
    <legend class="wpl-label">{label}</legend>
    {#each Array.from({ length: count }, (_, index) => index + 1) as score (score)}
      <label class="wpl-rating-option">
        <input type="radio" name={groupName} value={score} checked={current === score} onchange={() => select(score)} />
        <span class={score <= current ? 'wpl-rating-icon is-on' : 'wpl-rating-icon'} aria-hidden="true">
          <Icon name="star" />
        </span>
        <span class="wpl-sr-only">{score} {wpl.t('of')} {count}</span>
      </label>
    {/each}
  </fieldset>
{/if}
