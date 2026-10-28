import { bindDismissable, nextIndex } from '@white-plumeria/core';
import { defineComponent, h, onBeforeUnmount, ref, useId, watch, type PropType } from 'vue';
import { Button } from './button.ts';

export interface MenuItem {
  id: string;
  label: string;
  disabled?: boolean;
  shortcut?: string;
}

export const DropdownMenu = defineComponent({
  name: 'DropdownMenu',
  props: {
    label: { type: String, required: true },
    items: { type: Array as PropType<MenuItem[]>, required: true },
  },
  emits: ['select'],
  setup(props, { emit }) {
    const open = ref(false);
    const active = ref(0);
    const root = ref<HTMLElement | null>(null);
    const menuId = useId();
    let stop: (() => void) | undefined;

    watch(open, (value) => {
      stop?.();
      stop = undefined;
      if (value && root.value) {
        stop = bindDismissable({ root: root.value, onDismiss: () => (open.value = false) });
      }
    });
    onBeforeUnmount(() => stop?.());

    function choose(id: string) {
      emit('select', id);
      open.value = false;
    }

    return () =>
      h('div', { ref: root, class: 'wpl-menu' }, [
        h(Button, {
          variant: 'secondary',
          'aria-expanded': open.value,
          'aria-controls': menuId,
          'aria-haspopup': 'menu',
          onClick: () => (open.value = !open.value),
        }, () => props.label),
        open.value
          ? h(
              'div',
              {
                id: menuId,
                role: 'menu',
                class: 'wpl-menu-panel',
                onKeydown: (event: KeyboardEvent) => {
                  const enabled = props.items.filter((item) => !item.disabled);
                  if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
                    event.preventDefault();
                    active.value = nextIndex(active.value, enabled.length, event.key, 'vertical') ?? active.value;
                  }
                  if (event.key === 'Enter') {
                    const item = enabled[active.value];
                    if (item) choose(item.id);
                  }
                  if (event.key === 'Escape') open.value = false;
                },
              },
              props.items.map((item, index) =>
                h(
                  'button',
                  {
                    key: item.id,
                    type: 'button',
                    role: 'menuitem',
                    class: 'wpl-menu-item',
                    disabled: item.disabled,
                    tabindex: index === active.value ? 0 : -1,
                    onClick: () => choose(item.id),
                  },
                  [item.label, item.shortcut ? h('span', { class: 'wpl-muted' }, item.shortcut) : null],
                ),
              ),
            )
          : null,
      ]);
  },
});

export const Popover = defineComponent({
  name: 'Popover',
  props: { label: { type: String, default: 'Details' } },
  setup(props, { slots }) {
    const open = ref(false);
    const id = useId();
    const root = ref<HTMLElement | null>(null);
    let stop: (() => void) | undefined;
    watch(open, (value) => {
      stop?.();
      if (value && root.value) stop = bindDismissable({ root: root.value, onDismiss: () => (open.value = false) });
    });
    onBeforeUnmount(() => stop?.());
    return () =>
      h('div', { ref: root, style: { position: 'relative', display: 'inline-block' } }, [
        h(Button, { variant: 'secondary', 'aria-expanded': open.value, 'aria-controls': id, onClick: () => (open.value = !open.value) }, () => props.label),
        open.value
          ? h('div', { id, class: 'wpl-popover', style: { position: 'absolute', insetBlockStart: 'calc(100% + 0.35rem)', insetInlineStart: 0 } }, slots.default?.())
          : null,
      ]);
  },
});

export const Tooltip = defineComponent({
  name: 'Tooltip',
  props: { content: { type: String, required: true } },
  setup(props, { slots }) {
    const open = ref(false);
    const id = useId();
    let timer: number | undefined;
    function show() {
      timer = window.setTimeout(() => (open.value = true), 400);
    }
    function hide() {
      if (timer) window.clearTimeout(timer);
      open.value = false;
    }
    return () =>
      h(
        'span',
        { style: { position: 'relative', display: 'inline-flex' }, onMouseenter: show, onMouseleave: hide, onFocusin: show, onFocusout: hide },
        [
          h('span', { 'aria-describedby': open.value ? id : undefined }, slots.default?.()),
          open.value
            ? h('span', { id, role: 'tooltip', class: 'wpl-tooltip', style: { position: 'absolute', insetBlockEnd: 'calc(100% + 0.35rem)' } }, props.content)
            : null,
        ],
      );
  },
});

export const ContextMenu = defineComponent({
  name: 'ContextMenu',
  props: { items: { type: Array as PropType<MenuItem[]>, required: true } },
  emits: ['select'],
  setup(props, { slots, emit }) {
    const point = ref<{ x: number; y: number } | null>(null);
    return () =>
      h(
        'div',
        {
          onContextmenu: (event: MouseEvent) => {
            event.preventDefault();
            point.value = { x: event.clientX, y: event.clientY };
          },
          onKeydown: (event: KeyboardEvent) => {
            if (event.key === 'Escape') point.value = null;
            if (event.shiftKey && event.key === 'F10') {
              event.preventDefault();
              const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
              point.value = { x: rect.left, y: rect.bottom };
            }
          },
        },
        [
          slots.default?.(),
          point.value
            ? h(
                'div',
                {
                  role: 'menu',
                  class: 'wpl-menu-panel',
                  style: { position: 'fixed', insetInlineStart: `${point.value.x}px`, insetBlockStart: `${point.value.y}px` },
                },
                props.items.map((item) =>
                  h(
                    'button',
                    {
                      key: item.id,
                      type: 'button',
                      role: 'menuitem',
                      class: 'wpl-menu-item',
                      disabled: item.disabled,
                      onClick: () => {
                        emit('select', item.id);
                        point.value = null;
                      },
                    },
                    item.label,
                  ),
                ),
              )
            : null,
        ],
      );
  },
});
