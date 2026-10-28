<script lang="ts">
  import { buttonClassName, type ButtonAppearance, type ButtonSize, type ButtonVariant } from '@white-plumeria/core';
  import type { Snippet } from 'svelte';
  import type { HTMLButtonAttributes } from 'svelte/elements';
  import { useWhitePlumeria } from './context.svelte.ts';

  interface Props extends Omit<HTMLButtonAttributes, 'class'> {
    variant?: ButtonVariant;
    size?: ButtonSize;
    appearance?: ButtonAppearance;
    loading?: boolean;
    block?: boolean;
    class?: string;
    children?: Snippet;
  }

  let {
    variant = 'primary',
    size = 'md',
    appearance = 'solid',
    loading = false,
    block = false,
    disabled = false,
    type = 'button',
    class: className,
    children,
    onclick,
    ...rest
  }: Props = $props();

  const wpl = useWhitePlumeria();
  const inactive = $derived(Boolean(disabled) || loading);
</script>

<button
  {...rest}
  {type}
  class={buttonClassName({ variant, size, appearance, loading, block, className })}
  disabled={inactive}
  aria-busy={loading || undefined}
  onclick={(event) => {
    if (inactive) {
      event.preventDefault();
      return;
    }
    onclick?.(event);
  }}
>
  {#if loading}
    <span class="wpl-spinner wpl-spinner-sm" aria-hidden="true"></span>
    <span class="wpl-sr-only">{wpl.t('loading')}</span>
  {/if}
  {@render children?.()}
</button>
