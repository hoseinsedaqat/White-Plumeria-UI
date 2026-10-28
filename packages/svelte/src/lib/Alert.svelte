<script lang="ts">
  import { alertClassName, type AlertVariant } from '@white-plumeria/core';
  import type { Snippet } from 'svelte';
  import Icon from './Icon.svelte';
  let { variant = 'neutral', title = '', children }: { variant?: AlertVariant; title?: string; children?: Snippet } = $props();
</script>
<div class={alertClassName(variant)} role={variant === 'danger' ? 'alert' : 'status'}>
  <Icon name={variant === 'success' ? 'success' : variant === 'neutral' ? 'info' : 'alert'} />
  <div>
    {#if title}<p class="wpl-alert-title">{title}</p>{/if}
    {#if children}<div class="wpl-alert-description">{@render children()}</div>{/if}
  </div>
</div>
