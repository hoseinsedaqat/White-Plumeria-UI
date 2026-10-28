import { createFocusTrap, supportsModalDialog, type FocusTrap } from '@white-plumeria/core';
import { useEffect, useId, useRef, type ReactNode } from 'react';
import { IconButton } from './button.tsx';
import { useWhitePlumeria } from './provider.tsx';

export interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children?: ReactNode;
  footer?: ReactNode;
  hideTitle?: boolean;
  className?: string;
}

export function Dialog({
  open,
  onOpenChange,
  title,
  description,
  children,
  footer,
  hideTitle = false,
  className,
}: DialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const fallbackRef = useRef<HTMLDivElement>(null);
  const trapRef = useRef<FocusTrap | null>(null);
  const titleId = useId();
  const descriptionId = useId();
  const { t } = useWhitePlumeria();
  const native = supportsModalDialog();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!native || !dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [native, open]);

  useEffect(() => {
    if (native || !open) return;
    const root = fallbackRef.current;
    if (!root) return;
    const trap = createFocusTrap(root);
    trapRef.current = trap;
    trap.activate();
    return () => {
      trap.deactivate();
      trapRef.current = null;
    };
  }, [native, open]);

  const body = (
    <>
      <header className="wpl-dialog-header">
        <div>
          <h2 id={titleId} className={hideTitle ? 'wpl-sr-only' : 'wpl-dialog-title'}>
            {title}
          </h2>
          {description ? (
            <p id={descriptionId} className={hideTitle ? 'wpl-sr-only' : 'wpl-dialog-description'}>
              {description}
            </p>
          ) : null}
        </div>
        <IconButton label={t('close')} onClick={() => onOpenChange(false)} />
      </header>
      <div className="wpl-dialog-body">{children}</div>
      {footer ? <footer className="wpl-dialog-footer">{footer}</footer> : null}
    </>
  );

  if (!native) {
    if (!open) return null;
    return (
      <div className="wpl-overlay">
        <div
          ref={fallbackRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          aria-describedby={description ? descriptionId : undefined}
          className={className ? `wpl-dialog-panel ${className}` : 'wpl-dialog-panel'}
          onKeyDown={(event) => {
            if (event.key === 'Escape') {
              event.stopPropagation();
              onOpenChange(false);
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
      className={className ? `wpl-dialog ${className}` : 'wpl-dialog'}
      aria-labelledby={titleId}
      aria-describedby={description ? descriptionId : undefined}
      onCancel={(event) => {
        event.preventDefault();
        onOpenChange(false);
      }}
    >
      {body}
    </dialog>
  );
}

export function Modal(props: DialogProps) {
  return <Dialog {...props} />;
}

export function Drawer({
  side = 'end',
  className,
  ...props
}: DialogProps & { side?: 'start' | 'end' }) {
  const native = supportsModalDialog();
  if (!native) {
    return (
      <Dialog
        {...props}
        className={[side === 'start' ? 'wpl-drawer-panel' : 'wpl-drawer-panel', className]
          .filter(Boolean)
          .join(' ')}
      />
    );
  }
  return (
    <Dialog
      {...props}
      className={['wpl-drawer', side === 'start' ? 'wpl-drawer-start' : '', className]
        .filter(Boolean)
        .join(' ')}
    />
  );
}
