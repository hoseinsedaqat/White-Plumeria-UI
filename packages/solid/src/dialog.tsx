import { createFocusTrap, supportsModalDialog, type FocusTrap } from '@white-plumeria/core';
import { createEffect, onCleanup, type JSX , createUniqueId } from 'solid-js';
import { IconButton } from './button.tsx';
import { useWhitePlumeria } from './provider.tsx';

export interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children?: JSX.Element;
  footer?: JSX.Element;
  hideTitle?: boolean;
  class?: string;
}

export function Dialog(props: DialogProps) {
  let dialogRef: HTMLDialogElement | undefined;
  let fallbackRef: HTMLDivElement | undefined;
  const titleId = createUniqueId();
  const descriptionId = createUniqueId();
  const { t } = useWhitePlumeria();
  const native = supportsModalDialog();

  createEffect(() => {
    const dialog = dialogRef;
    if (!native || !dialog) return;
    if (props.open && !dialog.open) dialog.showModal();
    if (!props.open && dialog.open) dialog.close();
  });

  createEffect(() => {
    if (native || !props.open) return;
    const root = fallbackRef;
    if (!root) return;
    const trap: FocusTrap = createFocusTrap(root);
    trap.activate();
    onCleanup(() => trap.deactivate());
  });

  const body = () => (
    <>
      <header class="wpl-dialog-header">
        <div>
          <h2 id={titleId} class={props.hideTitle ? 'wpl-sr-only' : 'wpl-dialog-title'}>
            {props.title}
          </h2>
          {props.description ? (
            <p id={descriptionId} class={props.hideTitle ? 'wpl-sr-only' : 'wpl-dialog-description'}>
              {props.description}
            </p>
          ) : null}
        </div>
        <IconButton label={t('close')} onClick={() => props.onOpenChange(false)} />
      </header>
      <div class="wpl-dialog-body">{props.children}</div>
      {props.footer ? <footer class="wpl-dialog-footer">{props.footer}</footer> : null}
    </>
  );

  if (!native) {
    return (
      <ShowOpen open={() => props.open}>
        <div class="wpl-overlay">
          <div
            ref={fallbackRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            aria-describedby={props.description ? descriptionId : undefined}
            class={props.class ? `wpl-dialog-panel ${props.class}` : 'wpl-dialog-panel'}
            onKeyDown={(event) => {
              if (event.key === 'Escape') {
                event.stopPropagation();
                props.onOpenChange(false);
              }
            }}
          >
            {body()}
          </div>
        </div>
      </ShowOpen>
    );
  }

  return (
    <dialog
      ref={dialogRef}
      class={props.class ? `wpl-dialog ${props.class}` : 'wpl-dialog'}
      aria-labelledby={titleId}
      aria-describedby={props.description ? descriptionId : undefined}
      onCancel={(event) => {
        event.preventDefault();
        props.onOpenChange(false);
      }}
    >
      {body()}
    </dialog>
  );
}

function ShowOpen(props: { open: () => boolean; children: JSX.Element }) {
  return <>{props.open() ? props.children : null}</>;
}

export function Modal(props: DialogProps) {
  return <Dialog {...props} />;
}

export function Drawer(props: DialogProps & { side?: 'start' | 'end' }) {
  const native = supportsModalDialog();
  const side = () => props.side ?? 'end';
  const className = () =>
    [native ? 'wpl-drawer' : 'wpl-drawer-panel', side() === 'start' && native ? 'wpl-drawer-start' : '', props.class]
      .filter(Boolean)
      .join(' ');
  return <Dialog {...props} class={className()} />;
}
