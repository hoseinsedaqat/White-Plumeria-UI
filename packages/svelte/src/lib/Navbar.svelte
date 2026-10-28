<script lang="ts">
  import IconButton from './IconButton.svelte';
  import NavigationMenu from './NavigationMenu.svelte';
  import { useWhitePlumeria } from './context.svelte.ts';
  let { brand, href = '#', items }: { brand: string; href?: string; items: Array<{ href: string; label: string; current?: boolean }> } = $props();
  let open = $state(false);
  const wpl = useWhitePlumeria();
</script>
<header class="wpl-navbar" data-open={open || undefined}>
  <a class="wpl-navbar-brand" {href}>{brand}</a>
  <IconButton label={wpl.t('openMenu')} onclick={() => (open = !open)} />
  <NavigationMenu label={brand} {items} />
</header>
