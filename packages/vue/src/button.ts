import { buttonClassName, buttonGroupClassName, iconButtonClassName, type ButtonVariant, type ControlSize } from '@white-plumeria/core';
import { defineComponent, h, type PropType } from 'vue';
import { Icon } from './icon.ts';
import { useWhitePlumeria } from './provider.ts';
import { callListener, mergeClass } from './util.ts';

export const Button = defineComponent({
  name: 'Button',
  inheritAttrs: false,
  props: {
    variant: { type: String as PropType<ButtonVariant>, default: 'primary' },
    size: { type: String as PropType<ControlSize>, default: 'md' },
    loading: { type: Boolean, default: false },
    disabled: { type: Boolean, default: false },
    block: { type: Boolean, default: false },
    type: { type: String as PropType<'button' | 'submit' | 'reset'>, default: 'button' },
  },
  setup(props, { slots, attrs }) {
    const { t } = useWhitePlumeria();
    return () => {
      const inactive = props.disabled || props.loading;
      return h(
        'button',
        {
          ...attrs,
          type: props.type,
          class: mergeClass(
            buttonClassName({
              variant: props.variant,
              size: props.size,
              loading: props.loading,
              block: props.block,
            }),
            attrs.class,
          ),
          disabled: inactive,
          'aria-busy': props.loading || undefined,
          onClick: (event: MouseEvent) => {
            if (inactive) {
              event.preventDefault();
              return;
            }
            callListener(attrs.onClick, event);
          },
        },
        [
          props.loading ? h('span', { class: 'wpl-spinner wpl-spinner-sm', 'aria-hidden': 'true' }) : null,
          props.loading ? h('span', { class: 'wpl-sr-only' }, t('loading')) : null,
          slots.default?.(),
        ],
      );
    };
  },
});

export const IconButton = defineComponent({
  name: 'IconButton',
  inheritAttrs: false,
  props: {
    label: { type: String, required: true },
    variant: { type: String as PropType<ButtonVariant>, default: 'ghost' },
    size: { type: String as PropType<ControlSize>, default: 'md' },
  },
  setup(props, { slots, attrs }) {
    return () =>
      h(
        'button',
        {
          ...attrs,
          type: 'button',
          class: mergeClass(iconButtonClassName({ variant: props.variant, size: props.size }), attrs.class),
          'aria-label': props.label,
          onClick: (event: MouseEvent) => callListener(attrs.onClick, event),
        },
        slots.default?.() ?? [h(Icon, { name: 'close' })],
      );
  },
});

export const ButtonGroup = defineComponent({
  name: 'ButtonGroup',
  props: {
    label: { type: String, required: true },
    joined: { type: Boolean, default: false },
  },
  setup(props, { slots }) {
    return () =>
      h(
        'div',
        { role: 'group', 'aria-label': props.label, class: buttonGroupClassName(props.joined) },
        slots.default?.(),
      );
  },
});
