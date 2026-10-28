<script lang="ts">
  let { items }: { items: Array<{ id: string; title: string; description?: string; meta?: string }> } = $props();
</script>
<ul class="wpl-list">
  {#each items as item (item.id)}
    <li class="wpl-list-item">
      <div>
        <p class="wpl-timeline-title">{item.title}</p>
        {#if item.description}<p class="wpl-timeline-body">{item.description}</p>{/if}
      </div>
      {#if item.meta}<span class="wpl-muted">{item.meta}</span>{/if}
    </li>
  {/each}
</ul>
