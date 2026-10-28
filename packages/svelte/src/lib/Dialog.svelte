<script lang="ts">
  import { createFocusTrap, supportsModalDialog, type FocusTrap } from '@white-plumeria/core';
  import type { Snippet } from 'svelte';
  import IconButton from './IconButton.svelte';
  import { useWhitePlumeria } from './context.svelte.ts';

  let {
    open = $bindable(false),
    title,
    description = '',
    hideTitle = false,
    panelClass = '',
    children,
    footer,
  }: {
    open?: boolean;
    title: string;
    description?: string;
    hideTitle?: boolean;
    panelClass?: string;
    children?: Snippet;
    footer?: Snippet;
  } = $props();

  const wpl = useWhitePlumeria();
  const titleId = $props.id();
  const descriptionId = `${titleId}-description`;
  let dialog = $state<HTMLDialogElement | null>(null);
  let fallback = $state<HTMLDivElement | null>(null);
  let trap: FocusTrap | null = null;
  const native = supportsModalDialog();

  $effect(() => {
    if (native && dialog) {
      if (open && !dialog.open) dialog.showModal();
      if (!open && dialog.open) dialog.close();
    }
    trap?.deactivate();
    trap = null;
    if (!native && open && fallback) {
      trap = createFocusTrap(fallback);
      trap.activate();
    }
    return () => trap?.deactivate();
  });
</script>

{#if native}
  <dialog
    bind:this={dialog}
    class={panelClass ? `wpl-dialog ${panelClass}` : 'wpl-dialog'}
    aria-labelledby={titleId}
    aria-describedby={description ? descriptionId : undefined}
    oncancel={(event) => {
      event.preventDefault();
      open = false;
    }}
  >
    <header class="wpl-dialog-header">
      <div>
        <h2 id={titleId} class={hideTitle ? 'wpl-sr-only' : 'wpl-dialog-title'}>{title}</h2>
        {#if description}<p id={descriptionId} class={hideTitle ? 'wpl-sr-only' : 'wpl-dialog-description'}>{description}</p>{/if}
      </div>
      <IconButton label={wpl.t('close')} onclick={() => (open = false)} />
    </header>
    <div class="wpl-dialog-body">{@render children?.()}</div>
    {#if footer}<footer class="wpl-dialog-footer">{@render footer()}</footer>{/if}
  </dialog>
{:else if open}
  <div class="wpl-overlay">
    <div
      bind:this={fallback}
      role="dialog"
      tabindex="-1"
      aria-modal="true"
      aria-labelledby={titleId}
      class={panelClass ? `wpl-dialog-panel ${panelClass}` : 'wpl-dialog-panel'}
      onkeydown={(event) => {
        if (event.key === 'Escape') open = false;
      }}
    >
      <header class="wpl-dialog-header">
        <h2 id={titleId} class="wpl-dialog-title">{title}</h2>
        <IconButton label={wpl.t('close')} onclick={() => (open = false)} />
      </header>
      <div class="wpl-dialog-body">{@render children?.()}</div>
    </div>
  </div>
{/if}
