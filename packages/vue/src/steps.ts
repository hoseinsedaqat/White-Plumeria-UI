import { cx, stepIndex, stepState } from '@white-plumeria/core';
import { defineComponent, h, ref, type PropType } from 'vue';
import { Icon } from './icon.ts';
import { useWhitePlumeria } from './provider.ts';

export interface StepItem {
  id: string;
  title: string;
  description?: string;
}

export const Steps = defineComponent({
  name: 'Steps',
  props: {
    label: { type: String, required: true },
    items: { type: Array as PropType<StepItem[]>, required: true },
    modelValue: { type: String, default: undefined },
    orientation: { type: String as PropType<'horizontal' | 'vertical'>, default: 'horizontal' },
    linear: { type: Boolean, default: true },
  },
  emits: ['update:modelValue'],
  setup(props, { emit }) {
    const { t } = useWhitePlumeria();
    const internal = ref(props.modelValue ?? props.items[0]?.id ?? '');
    return () => {
      const selected = props.modelValue ?? internal.value;
      const current = stepIndex(props.items, selected);
      return h(
        'ol',
        {
          class: cx('wpl-steps', props.orientation === 'vertical' && 'wpl-steps-vertical'),
          'aria-label': props.label || t('steps'),
        },
        props.items.map((item, index) => {
          const state = stepState(index, current);
          const blocked = props.linear && index > current;
          const marker = h(
            'span',
            { class: 'wpl-step-marker', 'aria-hidden': 'true' },
            state === 'complete' ? [h(Icon, { name: 'check' })] : String(index + 1),
          );
          const copy = h('span', [
            h('span', { class: 'wpl-step-title' }, item.title),
            item.description ? h('span', { class: 'wpl-step-desc' }, item.description) : null,
          ]);
          const select = () => {
            if (blocked) return;
            if (props.modelValue === undefined) internal.value = item.id;
            emit('update:modelValue', item.id);
          };
          return h('li', { key: item.id, class: 'wpl-step', 'data-state': state }, [
            h(
              'button',
              {
                type: 'button',
                class: 'wpl-step-trigger',
                'aria-current': state === 'current' ? 'step' : undefined,
                disabled: blocked,
                onClick: select,
              },
              [marker, copy],
            ),
          ]);
        }),
      );
    };
  },
});
