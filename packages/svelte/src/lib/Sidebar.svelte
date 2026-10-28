<script lang="ts">
  let { label, items }: { label: string; items: Array<{ href: string; label: string; current?: boolean }> } = $props();
</script>
<nav class="wpl-sidebar" aria-label={label}>
  {#each items as item (item.href + item.label)}
    <a href={item.href} class="wpl-sidebar-link" aria-current={item.current ? 'page' : undefined}>{item.label}</a>
  {/each}
</nav>
