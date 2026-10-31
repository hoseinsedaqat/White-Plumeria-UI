import { notificationClassName, toastClassName, type ToastVariant } from '@white-plumeria/core';
import { defineComponent, getCurrentInstance, h, onMounted, onUnmounted } from 'vue';
import { IconButton } from './button.ts';
import { useWhitePlumeria } from './provider.ts';

export const ToastRegion = defineComponent({
  name: 'ToastRegion',
  setup() {
    const { toasts, dismissToast, t } = useWhitePlumeria();
    const timers = new Map<string, number>();

    function arm(id: string, duration = 5000) {
      if (timers.has(id)) return;
      timers.set(
        id,
        window.setTimeout(() => {
          timers.delete(id);
          dismissToast(id);
        }, duration),
      );
    }

    onMounted(() => {
      for (const toast of toasts.value) arm(toast.id, toast.duration);
    });
    onUnmounted(() => {
      for (const timer of timers.values()) window.clearTimeout(timer);
    });

    return () => {
      for (const toast of toasts.value) arm(toast.id, toast.duration);
      return h(
        'div',
        { class: 'wpl-toast-region', role: 'region', 'aria-label': t('notifications') },
        toasts.value.map((toast) =>
          h('div', { key: toast.id, class: toastClassName(toast.variant), role: toast.variant === 'danger' ? 'alert' : 'status' }, [
            h('div', [
              h('p', { class: 'wpl-toast-title' }, toast.title),
              toast.description ? h('p', { class: 'wpl-toast-description' }, toast.description) : null,
            ]),
            h(IconButton, { label: t('dismiss'), onClick: () => dismissToast(toast.id) }),
          ]),
        ),
      );
    };
  },
});

export const Notification = defineComponent({
  name: 'Notification',
  props: {
    title: { type: String, required: true },
    description: { type: String, default: '' },
    variant: { type: String as () => ToastVariant | 'info', default: 'neutral' },
  },
  emits: ['dismiss'],
  setup(props, { slots, emit }) {
    const { t } = useWhitePlumeria();
    const instance = getCurrentInstance();
    return () => {
      const dismissable = Boolean(instance?.vnode.props?.onDismiss);
      return h('div', { class: notificationClassName(props.variant), role: props.variant === 'danger' ? 'alert' : 'status' }, [
        h('div', [
          h('p', { class: 'wpl-toast-title' }, props.title),
          props.description ? h('p', { class: 'wpl-toast-description' }, props.description) : null,
          slots.default?.(),
        ]),
        dismissable ? h(IconButton, { label: t('dismiss'), onClick: () => emit('dismiss') }) : null,
      ]);
    };
  },
});
