<script lang="ts">
  import { iconButtonClassName } from '@white-plumeria/core';
  import { useWhitePlumeria } from './context.svelte.ts';

  let {
    brand,
    href = '#',
    items,
  }: {
    brand: string;
    href?: string;
    items: Array<{ href: string; label: string; current?: boolean }>;
  } = $props();

  let open = $state(false);
  const wpl = useWhitePlumeria();
  const menuId = $props.id();
</script>

<header class="wpl-navbar" data-open={open || undefined}>
  <a class="wpl-navbar-brand" {href}>{brand}</a>
  <button
    type="button"
    class="{iconButtonClassName({ variant: 'ghost' })} wpl-navbar-toggle"
    aria-label={open ? wpl.t('closeMenu') : wpl.t('openMenu')}
    aria-expanded={open}
    aria-controls={menuId}
    onclick={() => (open = !open)}
  >
    ☰
  </button>
  <ul id={menuId} class="wpl-nav-menu">
    {#each items as item (item.href + item.label)}
      <li>
        <a class="wpl-nav-link" href={item.href} aria-current={item.current ? 'page' : undefined} onclick={() => (open = false)}>
          {item.label}
        </a>
      </li>
    {/each}
  </ul>
</header>
