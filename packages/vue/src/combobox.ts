import { bindDismissable, nextIndex } from '@white-plumeria/core';
import { computed, defineComponent, h, onBeforeUnmount, ref, useId, watch, type PropType } from 'vue';
import { Icon } from './icon.ts';
import { useWhitePlumeria } from './provider.ts';

export interface ComboOption {
  value: string;
  label: string;
}

export const Combobox = defineComponent({
  name: 'Combobox',
  props: {
    label: { type: String, required: true },
    options: { type: Array as PropType<ComboOption[]>, required: true },
    modelValue: { type: String, default: '' },
    placeholder: { type: String, default: '' },
  },
  emits: ['update:modelValue'],
  setup(props, { emit }) {
    const id = useId();
    const listId = `${id}-list`;
    const { t } = useWhitePlumeria();
    const query = ref('');
    const open = ref(false);
    const active = ref(0);
    const root = ref<HTMLElement | null>(null);
    let stop: (() => void) | undefined;
    const filtered = computed(() => {
      const needle = query.value.trim().toLocaleLowerCase();
      const selected = props.options.find((option) => option.value === props.modelValue);
      if (!needle || needle === selected?.label.toLocaleLowerCase()) return props.options;
      return props.options.filter((option) => option.label.toLocaleLowerCase().includes(needle));
    });
    watch(open, (value) => {
      stop?.();
      stop = value && root.value ? bindDismissable({ root: root.value, onDismiss: () => (open.value = false) }) : undefined;
    });
    onBeforeUnmount(() => stop?.());
    return () =>
      h('div', { ref: root, class: 'wpl-combo' }, [
        h('label', { class: 'wpl-label', for: id }, props.label),
        h('div', { class: 'wpl-combo-control' }, [
          h('span', { class: 'wpl-combo-icon', 'aria-hidden': 'true' }, [h(Icon, { name: 'search' })]),
          h('input', {
          id,
          class: 'wpl-input',
          role: 'combobox',
          'aria-expanded': open.value,
          'aria-controls': listId,
          'aria-autocomplete': 'list',
          placeholder: props.placeholder,
          value: query.value,
          onFocus: () => (open.value = true),
          onInput: (event: Event) => {
            query.value = (event.target as HTMLInputElement).value;
            open.value = true;
            active.value = 0;
          },
          onKeydown: (event: KeyboardEvent) => {
            if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
              event.preventDefault();
              open.value = true;
              active.value = nextIndex(active.value, filtered.value.length, event.key, 'vertical') ?? active.value;
            }
            if (event.key === 'Enter') {
              const option = filtered.value[active.value];
              if (option) {
                emit('update:modelValue', option.value);
                query.value = option.label;
                open.value = false;
              }
            }
            if (event.key === 'Escape') open.value = false;
          },
        }),
        ]),
        open.value
          ? h(
              'ul',
              { id: listId, role: 'listbox', class: 'wpl-menu-panel' },
              filtered.value.length
                ? filtered.value.map((option, index) =>
                    h(
                      'li',
                      {
                        key: option.value,
                        role: 'option',
                        'aria-selected': props.modelValue === option.value,
                        class: index === active.value ? 'wpl-menu-item wpl-menu-item-active' : 'wpl-menu-item',
                        onMousedown: (event: MouseEvent) => {
                          event.preventDefault();
                          emit('update:modelValue', option.value);
                          query.value = option.label;
                          open.value = false;
                        },
                      },
                      option.label,
                    ),
                  )
                : [h('li', { class: 'wpl-muted' }, t('noResults'))],
            )
          : null,
      ]);
  },
});
