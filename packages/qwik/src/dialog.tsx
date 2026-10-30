import { createFocusTrap, supportsModalDialog } from '@white-plumeria/core';
import { component$, Slot, useId, useSignal, useVisibleTask$, type QRL } from '@qwik.dev/core';
import { IconButton } from './button';
import { useWhitePlumeria } from './provider';

export interface DialogProps {
  open: boolean;
  title: string;
  description?: string;
  hideTitle?: boolean;
  class?: string;
  onOpenChange$: QRL<(open: boolean) => void>;
}

export const Dialog = component$<DialogProps>((props) => {
  const dialogRef = useSignal<HTMLDialogElement>();
  const fallbackRef = useSignal<HTMLDivElement>();
  const titleId = useId();
  const descriptionId = useId();
  const wpl = useWhitePlumeria();
  const native = supportsModalDialog();

  useVisibleTask$(({ track, cleanup }) => {
    const open = track(() => props.open);
    const dialog = dialogRef.value;
    if (native && dialog) {
      if (open && !dialog.open) dialog.showModal();
      if (!open && dialog.open) dialog.close();
      return;
    }
    if (!open) return;
    const root = fallbackRef.value;
    if (!root) return;
    const trap = createFocusTrap(root);
    trap.activate();
    cleanup(() => trap.deactivate());
  });

  const titleClass = props.hideTitle ? 'wpl-sr-only' : 'wpl-dialog-title';
  const descriptionClass = props.hideTitle ? 'wpl-sr-only' : 'wpl-dialog-description';
  const body = (
    <>
      <header class="wpl-dialog-header">
        <div>
          <h2 id={titleId} class={titleClass}>{props.title}</h2>
          {props.description ? <p id={descriptionId} class={descriptionClass}>{props.description}</p> : null}
        </div>
        <IconButton label={wpl.t('close')} icon="close" onClick$={() => { void props.onOpenChange$?.(false); }} />
      </header>
      <div class="wpl-dialog-body">
        <Slot />
      </div>
    </>
  );

  if (!native) {
    if (!props.open) return null;
    return (
      <div class="wpl-overlay">
        <div
          ref={fallbackRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          aria-describedby={props.description ? descriptionId : undefined}
          class={props.class ? `wpl-dialog-panel ${props.class}` : 'wpl-dialog-panel'}
          onKeyDown$={(event) => {
            if (event.key === 'Escape') {
              event.stopPropagation();
              void props.onOpenChange$?.(false);
            }
          }}
        >
          {body}
        </div>
      </div>
    );
  }

  return (
    <dialog
      ref={dialogRef}
      class={props.class ? `wpl-dialog ${props.class}` : 'wpl-dialog'}
      aria-labelledby={titleId}
      aria-describedby={props.description ? descriptionId : undefined}
      preventdefault:cancel
      onCancel$={() => { void props.onOpenChange$?.(false); }}
    >
      {body}
    </dialog>
  );
});

export const Modal = component$<DialogProps>((props) => {
  return (
    <Dialog open={props.open} title={props.title} description={props.description} hideTitle={props.hideTitle} class={props.class} onOpenChange$={props.onOpenChange$}>
      <Slot />
    </Dialog>
  );
});

export const Drawer = component$<DialogProps & { side?: 'start' | 'end' }>((props) => {
  const native = supportsModalDialog();
  const side = props.side ?? 'end';
  const className = native
    ? ['wpl-drawer', side === 'start' ? 'wpl-drawer-start' : '', props.class].filter(Boolean).join(' ')
    : ['wpl-drawer-panel', props.class].filter(Boolean).join(' ');
  return (
    <Dialog open={props.open} title={props.title} description={props.description} hideTitle={props.hideTitle} class={className} onOpenChange$={props.onOpenChange$}>
      <Slot />
    </Dialog>
  );
});
