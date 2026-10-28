import { createFocusTrap, supportsModalDialog, type FocusTrap } from '@white-plumeria/core';
import { defineComponent, h, onBeforeUnmount, ref, useId, watch, type PropType } from 'vue';
import { IconButton } from './button.ts';
import { useWhitePlumeria } from './provider.ts';

export const Dialog = defineComponent({
  name: 'Dialog',
  props: {
    open: { type: Boolean, required: true },
    title: { type: String, required: true },
    description: { type: String, default: '' },
    hideTitle: { type: Boolean, default: false },
    panelClass: { type: String, default: '' },
  },
  emits: ['update:open'],
  setup(props, { slots, emit }) {
    const dialogRef = ref<HTMLDialogElement | null>(null);
    const fallbackRef = ref<HTMLDivElement | null>(null);
    const titleId = useId();
    const descriptionId = useId();
    const { t } = useWhitePlumeria();
    let trap: FocusTrap | null = null;

    function close() {
      emit('update:open', false);
    }

    watch(
      () => props.open,
      (open) => {
        const native = supportsModalDialog();
        const dialog = dialogRef.value;
        if (native && dialog) {
          if (open && !dialog.open) dialog.showModal();
          if (!open && dialog.open) dialog.close();
        }
        trap?.deactivate();
        trap = null;
        if (!native && open && fallbackRef.value) {
          trap = createFocusTrap(fallbackRef.value);
          trap.activate();
        }
      },
    );

    onBeforeUnmount(() => trap?.deactivate());

    return () => {
      const native = supportsModalDialog();
      const body = [
        h('header', { class: 'wpl-dialog-header' }, [
          h('div', [
            h('h2', { id: titleId, class: props.hideTitle ? 'wpl-sr-only' : 'wpl-dialog-title' }, props.title),
            props.description
              ? h('p', { id: descriptionId, class: props.hideTitle ? 'wpl-sr-only' : 'wpl-dialog-description' }, props.description)
              : null,
          ]),
          h(IconButton, { label: t('close'), onClick: close }),
        ]),
        h('div', { class: 'wpl-dialog-body' }, slots.default?.()),
        slots.footer ? h('footer', { class: 'wpl-dialog-footer' }, slots.footer()) : null,
      ];
      if (!native) {
        if (!props.open) return null;
        return h('div', { class: 'wpl-overlay' }, [
          h(
            'div',
            {
              ref: fallbackRef,
              role: 'dialog',
              'aria-modal': 'true',
              'aria-labelledby': titleId,
              'aria-describedby': props.description ? descriptionId : undefined,
              class: props.panelClass ? `wpl-dialog-panel ${props.panelClass}` : 'wpl-dialog-panel',
              onKeydown: (event: KeyboardEvent) => {
                if (event.key === 'Escape') {
                  event.stopPropagation();
                  close();
                }
              },
            },
            body,
          ),
        ]);
      }
      return h(
        'dialog',
        {
          ref: dialogRef,
          class: props.panelClass ? `wpl-dialog ${props.panelClass}` : 'wpl-dialog',
          'aria-labelledby': titleId,
          'aria-describedby': props.description ? descriptionId : undefined,
          onCancel: (event: Event) => {
            event.preventDefault();
            close();
          },
        },
        body,
      );
    };
  },
});

export const Modal = Dialog;

export const Drawer = defineComponent({
  name: 'Drawer',
  props: {
    open: { type: Boolean, required: true },
    title: { type: String, required: true },
    description: { type: String, default: '' },
    side: { type: String as PropType<'start' | 'end'>, default: 'end' },
  },
  emits: ['update:open'],
  setup(props, { slots, emit }) {
    return () =>
      h(
        Dialog,
        {
          open: props.open,
          title: props.title,
          description: props.description,
          panelClass: props.side === 'start' ? 'wpl-drawer wpl-drawer-start' : 'wpl-drawer',
          'onUpdate:open': (open: boolean) => emit('update:open', open),
        },
        { default: slots.default, footer: slots.footer },
      );
  },
});
