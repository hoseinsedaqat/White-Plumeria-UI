<script lang="ts">
  import { numberFieldCommit, numberFieldDraftValue, numberFieldStep, numberFieldText, rangeBounds } from '@white-plumeria/core';
  import Icon from './Icon.svelte';
  import { useWhitePlumeria } from './context.svelte.ts';

  let {
    label,
    min = 0,
    max = 100,
    step = 1,
    value = $bindable(0),
    name = '',
    disabled = false,
  }: {
    label: string;
    min?: number;
    max?: number;
    step?: number;
    value?: number;
    name?: string;
    disabled?: boolean;
  } = $props();

  const wpl = useWhitePlumeria();
  const id = $props.id();
  const bounds = $derived(rangeBounds(min, max, step));
  let draft = $state(numberFieldText(value, rangeBounds(min, max, step)));
  let focused = $state(false);
  const committed = $derived(numberFieldCommit(String(value), bounds, bounds.min));
  const shown = $derived(focused ? draft : numberFieldText(committed, bounds));
  const parsed = $derived(numberFieldDraftValue(shown, bounds) ?? committed);

  function commit(next: number) {
    const snapped = numberFieldCommit(String(next), bounds, bounds.min);
    draft = numberFieldText(snapped, bounds);
    value = snapped;
  }
</script>

<div class="wpl-field">
  <label class="wpl-label" for={id}>{label}</label>
  <div class="wpl-number">
    <button
      type="button"
      class="wpl-number-step"
      aria-label={wpl.t('decrease')}
      disabled={disabled || parsed <= bounds.min}
      onclick={() => commit(numberFieldStep(parsed, -1, bounds))}
    >
      <Icon name="minus" />
    </button>
    <input
      {id}
      class="wpl-input"
      type="number"
      {name}
      inputmode={bounds.step < 1 ? 'decimal' : 'numeric'}
      min={bounds.min}
      max={bounds.max}
      step={bounds.step}
      {disabled}
      value={shown}
      onfocus={() => {
        focused = true;
        draft = numberFieldText(committed, bounds);
      }}
      onblur={() => {
        focused = false;
        commit(numberFieldCommit(draft, bounds, committed));
      }}
      oninput={(event) => {
        const next = event.currentTarget.value;
        draft = next;
        const parsedNext = numberFieldDraftValue(next, bounds);
        if (parsedNext !== null) value = parsedNext;
      }}
      onwheel={(event) => event.currentTarget.blur()}
    />
    <button
      type="button"
      class="wpl-number-step"
      aria-label={wpl.t('increase')}
      disabled={disabled || parsed >= bounds.max}
      onclick={() => commit(numberFieldStep(parsed, 1, bounds))}
    >
      <Icon name="plus" />
    </button>
  </div>
</div>
