<script lang="ts">
  import { iconButtonClassName, type ButtonVariant, type ControlSize } from '@white-plumeria/core';
  import type { Snippet } from 'svelte';
  import Icon from './Icon.svelte';

  let {
    label,
    variant = 'ghost',
    size = 'md',
    children,
    onclick,
  }: {
    label: string;
    variant?: ButtonVariant;
    size?: ControlSize;
    children?: Snippet;
    onclick?: (event: MouseEvent) => void;
  } = $props();
</script>

<button type="button" class={iconButtonClassName({ variant, size })} aria-label={label} {onclick}>
  {#if children}
    {@render children()}
  {:else}
    <Icon name="close" />
  {/if}
</button>
