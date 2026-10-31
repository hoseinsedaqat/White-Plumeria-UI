<script lang="ts">
  import { notificationClassName } from '@white-plumeria/core';
  import type { Snippet } from 'svelte';
  import { useWhitePlumeria } from './context.svelte.ts';
  import IconButton from './IconButton.svelte';

  let {
    title,
    description = '',
    variant = 'neutral',
    ondismiss,
    children,
  }: {
    title: string;
    description?: string;
    variant?: string;
    ondismiss?: () => void;
    children?: Snippet;
  } = $props();

  const wpl = useWhitePlumeria();
</script>

<div class={notificationClassName(variant)} role={variant === 'danger' ? 'alert' : 'status'}>
  <div>
    <p class="wpl-toast-title">{title}</p>
    {#if description}<p class="wpl-toast-description">{description}</p>{/if}
    {#if children}{@render children()}{/if}
  </div>
  {#if ondismiss}
    <IconButton label={wpl.t('dismiss')} onclick={() => ondismiss?.()} />
  {/if}
</div>
