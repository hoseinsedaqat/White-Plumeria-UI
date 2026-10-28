<script lang="ts">
  import { iconButtonClassName, type ButtonAppearance, type ButtonSize, type ButtonVariant } from '@white-plumeria/core';
  import type { Snippet } from 'svelte';
  import Icon from './Icon.svelte';

  let {
    label,
    variant = 'ghost',
    size = 'md',
    appearance = 'solid',
    children,
    onclick,
  }: {
    label: string;
    variant?: ButtonVariant;
    size?: ButtonSize;
    appearance?: ButtonAppearance;
    children?: Snippet;
    onclick?: (event: MouseEvent) => void;
  } = $props();
</script>

<button type="button" class={iconButtonClassName({ variant, size, appearance })} aria-label={label} {onclick}>
  {#if children}
    {@render children()}
  {:else}
    <Icon name="close" />
  {/if}
</button>
