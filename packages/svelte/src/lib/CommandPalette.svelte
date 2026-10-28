<script lang="ts">
  import { nextIndex } from '@white-plumeria/core';
  import Dialog from './Dialog.svelte';
  import { useWhitePlumeria } from './context.svelte.ts';
  let {
    open = $bindable(false),
    commands,
    onselect,
  }: {
    open?: boolean;
    commands: Array<{ id: string; label: string; group?: string; keywords?: string[] }>;
    onselect?: (id: string) => void;
  } = $props();
  const wpl = useWhitePlumeria();
  let query = $state('');
  let active = $state(0);
  const filtered = $derived.by(() => {
    const needle = query.trim().toLocaleLowerCase();
    if (!needle) return commands;
    return commands.filter((command) => [command.label, command.group, ...(command.keywords ?? [])].join(' ').toLocaleLowerCase().includes(needle));
  });
</script>

<Dialog bind:open title={wpl.t('command')} hideTitle>
  <input
    class="wpl-input"
    bind:value={query}
    placeholder={wpl.t('search')}
    aria-label={wpl.t('search')}
    onkeydown={(event) => {
      if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
        event.preventDefault();
        active = nextIndex(active, filtered.length, event.key, 'vertical') ?? active;
      }
      if (event.key === 'Enter') {
        const command = filtered[active];
        if (command) {
          onselect?.(command.id);
          open = false;
        }
      }
    }}
  />
  <ul role="listbox" class="wpl-menu-panel">
    {#each filtered as command, index (command.id)}
      <li role="option" aria-selected={index === active} class="wpl-menu-item">{command.label}</li>
    {/each}
  </ul>
</Dialog>
