import { nextIndex } from '@white-plumeria/core';
import { computed, defineComponent, h, ref, type PropType } from 'vue';
import { Dialog } from './dialog.ts';
import { useWhitePlumeria } from './provider.ts';

export interface CommandItem {
  id: string;
  label: string;
  group?: string;
  keywords?: string[];
}

export const CommandPalette = defineComponent({
  name: 'CommandPalette',
  props: {
    open: { type: Boolean, required: true },
    commands: { type: Array as PropType<CommandItem[]>, required: true },
  },
  emits: ['update:open', 'select'],
  setup(props, { emit }) {
    const { t } = useWhitePlumeria();
    const query = ref('');
    const active = ref(0);
    const filtered = computed(() => {
      const needle = query.value.trim().toLocaleLowerCase();
      if (!needle) return props.commands;
      return props.commands.filter((command) =>
        [command.label, command.group, ...(command.keywords ?? [])].join(' ').toLocaleLowerCase().includes(needle),
      );
    });
    return () =>
      h(
        Dialog,
        {
          open: props.open,
          title: t('command'),
          hideTitle: true,
          'onUpdate:open': (open: boolean) => emit('update:open', open),
        },
        () => [
          h('input', {
            class: 'wpl-input',
            value: query.value,
            placeholder: t('search'),
            'aria-label': t('search'),
            onInput: (event: Event) => {
              query.value = (event.target as HTMLInputElement).value;
              active.value = 0;
            },
            onKeydown: (event: KeyboardEvent) => {
              if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
                event.preventDefault();
                active.value = nextIndex(active.value, filtered.value.length, event.key, 'vertical') ?? active.value;
              }
              if (event.key === 'Enter') {
                const command = filtered.value[active.value];
                if (command) {
                  emit('select', command.id);
                  emit('update:open', false);
                }
              }
            },
          }),
          h(
            'ul',
            { role: 'listbox', class: 'wpl-menu-panel' },
            filtered.value.map((command, index) =>
              h(
                'li',
                { key: command.id, role: 'option', 'aria-selected': index === active.value, class: 'wpl-menu-item' },
                [command.group ? h('span', { class: 'wpl-muted' }, command.group) : null, ' ', command.label],
              ),
            ),
          ),
        ],
      );
  },
});
