<script lang="ts">
  import { nextIndex } from '@white-plumeria/core';
  import { useWhitePlumeria } from './context.svelte.ts';
  let {
    label,
    options,
    value = $bindable(''),
    placeholder = '',
  }: {
    label: string;
    options: Array<{ value: string; label: string }>;
    value?: string;
    placeholder?: string;
  } = $props();
  const wpl = useWhitePlumeria();
  const id = $props.id();
  let query = $state('');
  let open = $state(false);
  let active = $state(0);
  const filtered = $derived.by(() => {
    const needle = query.trim().toLocaleLowerCase();
    const selected = options.find((option) => option.value === value);
    if (!needle || needle === selected?.label.toLocaleLowerCase()) return options;
    return options.filter((option) => option.label.toLocaleLowerCase().includes(needle));
  });

  function choose(option: { value: string; label: string }) {
    value = option.value;
    query = option.label;
    open = false;
  }
</script>

<div class="wpl-field">
  <label class="wpl-label" for={id}>{label}</label>
  <input
    {id}
    class="wpl-input"
    role="combobox"
    aria-expanded={open}
    aria-controls="{id}-list"
    aria-autocomplete="list"
    {placeholder}
    bind:value={query}
    onfocus={() => (open = true)}
    onkeydown={(event) => {
      if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
        event.preventDefault();
        open = true;
        active = nextIndex(active, filtered.length, event.key, 'vertical') ?? active;
      }
      if (event.key === 'Enter') {
        const option = filtered[active];
        if (option) choose(option);
      }
      if (event.key === 'Escape') open = false;
    }}
  />
  {#if open}
    <ul id="{id}-list" role="listbox" class="wpl-menu-panel">
      {#if filtered.length === 0}
        <li class="wpl-muted">{wpl.t('noResults')}</li>
      {:else}
        {#each filtered as option, index (option.value)}
          <li>
            <button type="button" role="option" class="wpl-menu-item" aria-selected={value === option.value} onclick={() => choose(option)}>
              {option.label}
            </button>
          </li>
        {/each}
      {/if}
    </ul>
  {/if}
</div>
