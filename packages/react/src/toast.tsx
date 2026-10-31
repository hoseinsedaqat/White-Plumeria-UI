import { notificationClassName, toastClassName, type ToastVariant } from '@white-plumeria/core';
import { useEffect, type ReactNode } from 'react';
import { IconButton } from './button.tsx';
import { useWhitePlumeria, type ToastRecord } from './provider.tsx';

export function ToastRegion() {
  const { toasts, dismissToast, t, preferences } = useWhitePlumeria();
  const reduce =
    preferences.reducedMotion === 'reduce' ||
    (preferences.reducedMotion === 'system' &&
      typeof matchMedia !== 'undefined' &&
      matchMedia('(prefers-reduced-motion: reduce)').matches);

  useEffect(() => {
    if (reduce) return;
    const timers = toasts.map((toast) =>
      window.setTimeout(() => dismissToast(toast.id), toast.duration ?? 5000),
    );
    return () => {
      for (const timer of timers) window.clearTimeout(timer);
    };
  }, [dismissToast, reduce, toasts]);

  if (typeof document === 'undefined') return null;
  return (
    <div className="wpl-toast-region" aria-label={t('notifications')}>
      {toasts.map((toast) => (
        <ToastView key={toast.id} toast={toast} onDismiss={() => dismissToast(toast.id)} />
      ))}
    </div>
  );
}

function ToastView({ toast, onDismiss }: { toast: ToastRecord; onDismiss: () => void }) {
  const { t } = useWhitePlumeria();
  const variant = toast.variant ?? 'neutral';
  return (
    <div className={toastClassName(variant)} role={variant === 'danger' ? 'alert' : 'status'}>
      <div>
        <p className="wpl-toast-title">{toast.title}</p>
        {toast.description ? <p className="wpl-toast-description">{toast.description}</p> : null}
      </div>
      <IconButton label={t('dismiss')} onClick={onDismiss} />
    </div>
  );
}

export function Notification({
  title,
  description,
  children,
  variant = 'neutral',
  onDismiss,
}: {
  title: string;
  description?: string;
  children?: ReactNode;
  variant?: ToastVariant | 'info';
  onDismiss?: () => void;
}) {
  const { t } = useWhitePlumeria();
  return (
    <div className={notificationClassName(variant)} role={variant === 'danger' ? 'alert' : 'status'}>
      <div>
        <p className="wpl-toast-title">{title}</p>
        {description ? <p className="wpl-toast-description">{description}</p> : null}
        {children}
      </div>
      {onDismiss ? <IconButton label={t('dismiss')} onClick={onDismiss} /> : null}
    </div>
  );
}
