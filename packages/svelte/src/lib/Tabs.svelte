<script lang="ts">
  import { nextIndex, readingDirection } from '@white-plumeria/core';
  let {
    tabs,
    value = $bindable(''),
    orientation = 'horizontal',
  }: {
    tabs: Array<{ id: string; label: string; panel: string }>;
    value?: string;
    orientation?: 'horizontal' | 'vertical';
  } = $props();
  const selected = $derived(value || tabs[0]?.id || '');
  const base = $props.id();
</script>

<div class={orientation === 'vertical' ? 'wpl-tabs wpl-tabs-vertical' : 'wpl-tabs'}>
  <div
    role="tablist"
    tabindex="-1"
    aria-orientation={orientation}
    onkeydown={(event) => {
      const next = nextIndex(
        tabs.findIndex((tab) => tab.id === selected),
        tabs.length,
        event.key,
        orientation,
        readingDirection(event.currentTarget as HTMLElement),
      );
      if (next === null) return;
      event.preventDefault();
      const tab = tabs[next];
      if (tab) value = tab.id;
    }}
  >
    {#each tabs as tab (tab.id)}
      <button
        type="button"
        role="tab"
        class="wpl-tab"
        aria-selected={selected === tab.id}
        aria-controls="{base}-{tab.id}"
        tabindex={selected === tab.id ? 0 : -1}
        onclick={() => (value = tab.id)}
      >
        {tab.label}
      </button>
    {/each}
  </div>
  {#each tabs as tab (tab.id)}
    <div id="{base}-{tab.id}" role="tabpanel" class="wpl-tab-panel" hidden={selected !== tab.id}>{tab.panel}</div>
  {/each}
</div>
