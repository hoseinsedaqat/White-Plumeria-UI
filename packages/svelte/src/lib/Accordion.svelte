<script lang="ts">
  let { items, multiple = false }: { items: Array<{ id: string; title: string; content: string }>; multiple?: boolean } = $props();
  let open = $state<string[]>([]);
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
        aria-expanded={expanded}
        onclick={() => {
          open = expanded ? open.filter((id) => id !== item.id) : multiple ? [...open, item.id] : [item.id];
        }}
      >
        {item.title}
      </button>
      <div class="wpl-accordion-panel" hidden={!expanded}>{item.content}</div>
    </div>
  {/each}
</div>
