<script lang="ts">
  let { items }: { items: Array<{ id: string; title: string; time: string; dateTime?: string; meta?: string }> } = $props();
</script>
<ol class="wpl-timeline">
  {#each items as item (item.id)}
    <li class="wpl-timeline-item">
      <p class="wpl-timeline-title">{item.title}</p>
      <p class="wpl-timeline-meta"><time datetime={item.dateTime}>{item.time}</time>{item.meta ? ` · ${item.meta}` : ''}</p>
    </li>
  {/each}
</ol>
