<script lang="ts">
  let { label, items }: { label: string; items: Array<{ href: string; label: string; current?: boolean }> } = $props();
</script>
<nav aria-label={label}>
  <ul class="wpl-nav-menu">
    {#each items as item (item.href + item.label)}
      <li><a href={item.href} class="wpl-nav-link" aria-current={item.current ? 'page' : undefined}>{item.label}</a></li>
    {/each}
  </ul>
</nav>
