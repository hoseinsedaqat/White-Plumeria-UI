<script lang="ts">
  import { cx, stepIndex, stepState } from '@white-plumeria/core';
  import Icon from './Icon.svelte';
  import { useWhitePlumeria } from './context.svelte.ts';

  interface StepItem {
    id: string;
    title: string;
    description?: string;
  }

  let {
    label,
    items,
    value = $bindable(''),
    orientation = 'horizontal',
    linear = true,
    onvaluechange,
  }: {
    label: string;
    items: StepItem[];
    value?: string;
    orientation?: 'horizontal' | 'vertical';
    linear?: boolean;
    onvaluechange?: (value: string) => void;
  } = $props();

  const wpl = useWhitePlumeria();
  const current = $derived(stepIndex(items, value));

  function select(id: string, index: number) {
    if (linear && index > current) return;
    value = id;
    onvaluechange?.(id);
  }
</script>

<ol class={cx('wpl-steps', orientation === 'vertical' && 'wpl-steps-vertical')} aria-label={label || wpl.t('steps')}>
  {#each items as item, index (item.id)}
    {@const state = stepState(index, current)}
    <li class="wpl-step" data-state={state}>
      <button
        type="button"
        class="wpl-step-trigger"
        aria-current={state === 'current' ? 'step' : undefined}
        disabled={linear && index > current}
        onclick={() => select(item.id, index)}
      >
        <span class="wpl-step-marker" aria-hidden="true">
          {#if state === 'complete'}
            <Icon name="check" />
          {:else}
            {index + 1}
          {/if}
        </span>
        <span>
          <span class="wpl-step-title">{item.title}</span>
          {#if item.description}<span class="wpl-step-desc">{item.description}</span>{/if}
        </span>
      </button>
    </li>
  {/each}
</ol>
