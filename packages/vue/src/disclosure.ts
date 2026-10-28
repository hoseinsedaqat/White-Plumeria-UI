import { nextIndex, readingDirection } from '@white-plumeria/core';
import { defineComponent, h, ref, useId, type PropType } from 'vue';

export interface TabItem {
  id: string;
  label: string;
  panel: string;
}

export const Tabs = defineComponent({
  name: 'Tabs',
  props: {
    tabs: { type: Array as PropType<TabItem[]>, required: true },
    modelValue: { type: String, default: '' },
    orientation: { type: String as PropType<'horizontal' | 'vertical'>, default: 'horizontal' },
  },
  emits: ['update:modelValue'],
  setup(props, { emit }) {
    const internal = ref(props.tabs[0]?.id ?? '');
    const base = useId();
    return () => {
      const selected = props.modelValue || internal.value;
      function select(id: string) {
        if (!props.modelValue) internal.value = id;
        emit('update:modelValue', id);
      }
      return h('div', { class: props.orientation === 'vertical' ? 'wpl-tabs wpl-tabs-vertical' : 'wpl-tabs' }, [
        h(
          'div',
          {
            role: 'tablist',
            'aria-orientation': props.orientation,
            onKeydown: (event: KeyboardEvent) => {
              const dir = readingDirection(event.currentTarget as HTMLElement);
              const index = props.tabs.findIndex((tab) => tab.id === selected);
              const next = nextIndex(index, props.tabs.length, event.key, props.orientation, dir);
              if (next === null) return;
              event.preventDefault();
              const tab = props.tabs[next];
              if (tab) select(tab.id);
            },
          },
          props.tabs.map((tab) =>
            h(
              'button',
              {
                key: tab.id,
                id: `${base}-tab-${tab.id}`,
                type: 'button',
                role: 'tab',
                class: 'wpl-tab',
                'aria-selected': selected === tab.id,
                'aria-controls': `${base}-panel-${tab.id}`,
                tabindex: selected === tab.id ? 0 : -1,
                onClick: () => select(tab.id),
              },
              tab.label,
            ),
          ),
        ),
        ...props.tabs.map((tab) =>
          h(
            'div',
            {
              key: tab.id,
              id: `${base}-panel-${tab.id}`,
              role: 'tabpanel',
              class: 'wpl-tab-panel',
              hidden: selected !== tab.id,
              'aria-labelledby': `${base}-tab-${tab.id}`,
            },
            tab.panel,
          ),
        ),
      ]);
    };
  },
});

export interface AccordionItem {
  id: string;
  title: string;
  content: string;
}

export const Accordion = defineComponent({
  name: 'Accordion',
  props: {
    items: { type: Array as PropType<AccordionItem[]>, required: true },
    multiple: { type: Boolean, default: false },
  },
  setup(props) {
    const open = ref<string[]>(props.items[0] ? [props.items[0].id] : []);
    const base = useId();
    return () =>
      h(
        'div',
        { class: 'wpl-accordion' },
        props.items.map((item) => {
          const expanded = open.value.includes(item.id);
          return h('div', { key: item.id, class: 'wpl-accordion-item' }, [
            h(
              'button',
              {
                type: 'button',
                class: 'wpl-accordion-trigger',
                'aria-expanded': expanded,
                'aria-controls': `${base}-${item.id}`,
                onClick: () => {
                  open.value = expanded
                    ? open.value.filter((id) => id !== item.id)
                    : props.multiple
                      ? [...open.value, item.id]
                      : [item.id];
                },
              },
              item.title,
            ),
            h('div', { id: `${base}-${item.id}`, class: 'wpl-accordion-panel', hidden: !expanded }, item.content),
          ]);
        }),
      );
  },
});
