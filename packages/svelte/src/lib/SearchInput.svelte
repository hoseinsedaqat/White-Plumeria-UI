<script lang="ts">
  import Icon from './Icon.svelte';
  import { useWhitePlumeria } from './context.svelte.ts';
  let {
    label,
    value = $bindable(''),
    placeholder = '',
    visuallyHiddenLabel = false,
    onsearch,
  }: { label: string; value?: string; placeholder?: string; visuallyHiddenLabel?: boolean; onsearch?: (value: string) => void } = $props();
  const id = $props.id();
  const wpl = useWhitePlumeria();
</script>

<div class="wpl-search">
  <label class={visuallyHiddenLabel ? 'wpl-label wpl-sr-only' : 'wpl-label'} for={id}>{label}</label>
  <div class="wpl-search-control">
    <span class="wpl-search-icon" aria-hidden="true"><Icon name="search" /></span>
    <input {id} class="wpl-input" type="search" bind:value placeholder={placeholder || label} onkeydown={(event) => { if (event.key === 'Enter') onsearch?.(value); }} />
    {#if value}
      <button type="button" class="wpl-icon-btn wpl-icon-btn-sm wpl-btn-ghost wpl-search-clear" aria-label={wpl.t('clear')} onclick={() => (value = '')}>
        <Icon name="close" />
      </button>
    {/if}
  </div>
</div>
