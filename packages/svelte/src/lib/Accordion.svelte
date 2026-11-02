<script lang="ts">
  let { items, multiple = false }: { items: Array<{ id: string; title: string; content: string }>; multiple?: boolean } = $props();
  let open = $state<string[]>([]);
  const baseId = $props.id();
  let seeded = false;
  $effect(() => {
    const first = items[0]?.id;
    if (!seeded && first) {
      open = [first];
      seeded = true;
    }
  });
</script>

<div class="wpl-accordion">
  {#each items as item (item.id)}
    {@const expanded = open.includes(item.id)}
    <div class="wpl-accordion-item">
      <button
        type="button"
        class="wpl-accordion-trigger"
        id="{baseId}-trigger-{item.id}"
        aria-expanded={expanded}
        aria-controls="{baseId}-{item.id}"
        onclick={() => {
          open = expanded ? open.filter((id) => id !== item.id) : multiple ? [...open, item.id] : [item.id];
        }}
      >
        {item.title}
      </button>
      <div id="{baseId}-{item.id}" class="wpl-accordion-panel" role="region" aria-labelledby="{baseId}-trigger-{item.id}" hidden={!expanded}>{item.content}</div>
    </div>
  {/each}
</div>
