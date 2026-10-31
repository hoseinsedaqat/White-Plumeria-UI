<script lang="ts">
  import { readingDirection, toggleGroupMove } from '@white-plumeria/core';

  let {
    label,
    options,
    value = $bindable(''),
    name = '',
    hideLabel = false,
    disabled = false,
  }: {
    label: string;
    options: Array<{ value: string; label: string; disabled?: boolean }>;
    value?: string;
    name?: string;
    hideLabel?: boolean;
    disabled?: boolean;
  } = $props();

  const labelId = $props.id();
  const selected = $derived(options.findIndex((option) => option.value === value));
  const firstEnabled = $derived(options.findIndex((option) => !option.disabled));

  function commit(next: string) {
    value = next;
  }

  function onKey(event: KeyboardEvent) {
    const next = toggleGroupMove(options, selected, event.key, readingDirection(event.currentTarget instanceof HTMLElement ? event.currentTarget : null));
    if (next === null) return;
    const option = options[next];
    if (!option) return;
    event.preventDefault();
    commit(option.value);
    const group = event.currentTarget instanceof HTMLElement ? event.currentTarget.parentElement : null;
    queueMicrotask(() => group?.querySelectorAll<HTMLButtonElement>('[role="radio"]')[next]?.focus());
  }
</script>

{#snippet group()}
  <div class="wpl-toggle" role="radiogroup" aria-label={hideLabel ? label : undefined} aria-labelledby={hideLabel ? undefined : labelId}>
    {#each options as option, index (option.value)}
      {@const checked = option.value === value}
      {@const tabbable = !option.disabled && !disabled && (checked || (selected < 0 && index === firstEnabled))}
      <button
        type="button"
        class="wpl-toggle-item"
        role="radio"
        aria-checked={checked}
        disabled={disabled || option.disabled}
        tabindex={tabbable ? 0 : -1}
        onclick={() => commit(option.value)}
        onkeydown={onKey}
      >
        {option.label}
      </button>
    {/each}
    {#if name}<input type="hidden" {name} {value} />{/if}
  </div>
{/snippet}

{#if hideLabel}
  {@render group()}
{:else}
  <div class="wpl-field">
    <span id={labelId} class="wpl-label">{label}</span>
    {@render group()}
  </div>
{/if}
