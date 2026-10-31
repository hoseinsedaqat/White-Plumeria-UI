import { notificationClassName, toastClassName, type ToastVariant } from '@white-plumeria/core';
import { createEffect, onCleanup, type JSX } from 'solid-js';
import { IconButton } from './button.tsx';
import { useWhitePlumeria, type ToastRecord } from './provider.tsx';

export function ToastRegion() {
  const { toasts, dismissToast, t, preferences } = useWhitePlumeria();
  const reduce = () =>
    preferences().reducedMotion === 'reduce' ||
    (preferences().reducedMotion === 'system' &&
      typeof matchMedia !== 'undefined' &&
      matchMedia('(prefers-reduced-motion: reduce)').matches);

  createEffect(() => {
    if (reduce()) return;
    const timers = toasts().map((toast) => window.setTimeout(() => dismissToast(toast.id), toast.duration ?? 5000));
    onCleanup(() => {
      for (const timer of timers) window.clearTimeout(timer);
    });
  });

  return (
    <div class="wpl-toast-region" aria-label={t('notifications')}>
      {toasts().map((toast) => (
        <ToastView toast={toast} onDismiss={() => dismissToast(toast.id)} />
      ))}
    </div>
  );
}

function ToastView(props: { toast: ToastRecord; onDismiss: () => void }) {
  const { t } = useWhitePlumeria();
  const variant = () => props.toast.variant ?? 'neutral';
  return (
    <div class={toastClassName(variant())} role={variant() === 'danger' ? 'alert' : 'status'}>
      <div>
        <p class="wpl-toast-title">{props.toast.title}</p>
        {props.toast.description ? <p class="wpl-toast-description">{props.toast.description}</p> : null}
      </div>
      <IconButton label={t('dismiss')} onClick={props.onDismiss} />
    </div>
  );
}

export function Notification(props: {
  title: string;
  description?: string;
  children?: JSX.Element;
  variant?: ToastVariant | 'info';
  onDismiss?: () => void;
}) {
  const { t } = useWhitePlumeria();
  return (
    <div class={notificationClassName(props.variant)} role={props.variant === 'danger' ? 'alert' : 'status'}>
      <div>
        <p class="wpl-toast-title">{props.title}</p>
        {props.description ? <p class="wpl-toast-description">{props.description}</p> : null}
        {props.children}
      </div>
      {props.onDismiss ? <IconButton label={t('dismiss')} onClick={props.onDismiss} /> : null}
    </div>
  );
}
