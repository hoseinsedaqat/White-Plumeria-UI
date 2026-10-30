import {
  bindDismissable,
  firstEnabledIndex,
  menuCommand,
  menuHasSubmenu,
  moveEnabledIndex,
  typeaheadMove,
  placeOverlay,
  readingDirection,
  type MenuMotion,
} from '@white-plumeria/core';
import { defineComponent, h, nextTick, onBeforeUnmount, ref, useId, watch, type PropType } from 'vue';
import { Button } from './button.ts';

export interface MenuItem {
  id: string;
  label: string;
  disabled?: boolean;
  shortcut?: string;
  items?: MenuItem[];
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
    const subActive = ref<number | null>(null);
    const root = ref<HTMLElement | null>(null);
    const typeahead = { query: '', at: 0 };
    const menuId = useId();
    let stop: (() => void) | undefined;

    watch(open, (value) => {
      stop?.();
      stop = undefined;
      if (value && root.value) {
        stop = bindDismissable({
          root: root.value,
          onDismiss: () => {
            if (subActive.value !== null) {
              subActive.value = null;
              return;
            }
            open.value = false;
          },
        });
      }
    });
    onBeforeUnmount(() => stop?.());

    function choose(id: string) {
      emit('select', id);
      open.value = false;
      subActive.value = null;
    }

    function openSubmenu(index = active.value) {
      const item = props.items[index];
      if (!menuHasSubmenu(item)) return;
      active.value = index;
      subActive.value = firstEnabledIndex(item.items ?? []);
    }

    function onKeydown(event: KeyboardEvent) {
      const parent = props.items[active.value];
      const children = parent?.items ?? [];
      const current = subActive.value === null ? parent : children[subActive.value];
      const command = menuCommand({
        key: event.key,
        direction: readingDirection(root.value),
        open: open.value,
        submenuOpen: subActive.value !== null,
        hasSubmenu: menuHasSubmenu(current),
      });
      if (!command) {
        if (!open.value) return;
        const pool = subActive.value === null ? props.items : children;
        const from = subActive.value === null ? active.value : subActive.value;
        const next = typeaheadMove(typeahead, pool, event.key, Date.now(), from);
        if (next === null) return;
        event.preventDefault();
        if (subActive.value === null) active.value = next;
        else subActive.value = next;
        return;
      }
      event.preventDefault();
      if (command === 'close' || command === 'close-submenu') event.stopPropagation();
      if (command === 'open') {
        open.value = true;
        active.value = firstEnabledIndex(props.items);
        subActive.value = null;
        return;
      }
      if (command === 'close') {
        open.value = false;
        subActive.value = null;
        return;
      }
      if (command === 'close-submenu') {
        subActive.value = null;
        return;
      }
      if (command === 'open-submenu') {
        open.value = true;
        openSubmenu();
        return;
      }
      if (command === 'activate') {
        if (current && !current.disabled && !menuHasSubmenu(current)) choose(current.id);
        return;
      }
      if (!open.value) {
        open.value = true;
        active.value = firstEnabledIndex(props.items);
        subActive.value = null;
        return;
      }
      const motion = command as MenuMotion;
      if (subActive.value === null) active.value = moveEnabledIndex(props.items, active.value, motion);
      else subActive.value = moveEnabledIndex(children, subActive.value, motion);
    }

    return () => {
      const parent = props.items[active.value];
      const current = subActive.value === null ? parent : parent?.items?.[subActive.value];
      return h('div', { ref: root, class: 'wpl-menu-root' }, [
        h(
          Button,
          {
            variant: 'secondary',
            'aria-expanded': open.value,
            'aria-controls': menuId,
            'aria-haspopup': 'menu',
            'aria-activedescendant': open.value && current ? `${menuId}-${current.id}` : undefined,
            onClick: () => {
              open.value = !open.value;
              subActive.value = null;
              active.value = firstEnabledIndex(props.items);
            },
            onKeydown,
          },
          () => props.label,
        ),
        open.value
          ? h(
              'div',
              { id: menuId, role: 'menu', 'aria-label': props.label, class: 'wpl-menu wpl-menu-panel' },
              props.items.map((item, index) => {
                const nested = menuHasSubmenu(item);
                const expanded = nested && index === active.value && subActive.value !== null;
                return h('div', { key: item.id, class: 'wpl-menu-row' }, [
                  h(
                    'button',
                    {
                      id: `${menuId}-${item.id}`,
                      type: 'button',
                      role: 'menuitem',
                      class: 'wpl-menu-item',
                      disabled: item.disabled,
                      'aria-haspopup': nested ? 'menu' : undefined,
                      'aria-expanded': nested ? expanded : undefined,
                      'data-active': subActive.value === null && index === active.value ? 'true' : undefined,
                      onMouseenter: () => {
                        active.value = index;
                        if (nested) openSubmenu(index);
                        else subActive.value = null;
                      },
                      onClick: () => {
                        if (nested) openSubmenu(index);
                        else if (!item.disabled) choose(item.id);
                      },
                    },
                    [
                      h('span', item.label),
                      nested ? h('span', { class: 'wpl-menu-caret', 'aria-hidden': 'true' }) : null,
                      !nested && item.shortcut ? h('span', { class: 'wpl-menu-shortcut' }, item.shortcut) : null,
                    ],
                  ),
                  expanded
                    ? h(
                        'div',
                        { id: `${menuId}-sub-${item.id}`, role: 'menu', 'aria-label': item.label, class: 'wpl-menu wpl-menu-sub' },
                        item.items?.map((child, childIndex) =>
                          h(
                            'button',
                            {
                              key: child.id,
                              id: `${menuId}-${child.id}`,
                              type: 'button',
                              role: 'menuitem',
                              class: 'wpl-menu-item',
                              disabled: child.disabled,
                              'data-active': childIndex === subActive.value ? 'true' : undefined,
                              onMouseenter: () => (subActive.value = childIndex),
                              onClick: () => {
                                if (!child.disabled) choose(child.id);
                              },
                            },
                            child.label,
                          ),
                        ),
                      )
                    : null,
                ]);
              }),
            )
          : null,
      ]);
    };
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
  props: {
    items: { type: Array as PropType<MenuItem[]>, required: true },
    label: { type: String, default: 'Context menu' },
  },
  emits: ['select'],
  setup(props, { slots, emit }) {
    const point = ref<{ x: number; y: number } | null>(null);
    const active = ref(0);
    const subActive = ref<number | null>(null);
    const typeahead = { query: '', at: 0 };
    const root = ref<HTMLElement | null>(null);
    const menu = ref<HTMLElement | null>(null);
    const menuId = useId();
    let stop: (() => void) | undefined;

    function close() {
      subActive.value = null;
      point.value = null;
    }

    function openAt(x: number, y: number) {
      subActive.value = null;
      active.value = firstEnabledIndex(props.items);
      point.value = { x, y };
      root.value?.focus();
    }

    function openSubmenu(index = active.value) {
      const item = props.items[index];
      if (!menuHasSubmenu(item)) return;
      active.value = index;
      subActive.value = firstEnabledIndex(item.items);
    }

    watch(point, async (value) => {
      stop?.();
      stop = undefined;
      if (!value) return;
      await nextTick();
      const el = menu.value;
      if (!el) return;
      const placed = placeOverlay(
        { x: value.x, y: value.y, width: 0, height: 0 },
        { width: el.offsetWidth || 180, height: el.offsetHeight || 120 },
        { width: window.innerWidth, height: window.innerHeight },
        'end',
      );
      el.style.left = `${placed.left}px`;
      el.style.top = `${placed.top}px`;
      stop = bindDismissable({
        root: el,
        onDismiss: () => {
          if (subActive.value !== null) {
            subActive.value = null;
            return;
          }
          point.value = null;
        },
      });
    });
    onBeforeUnmount(() => stop?.());

    function onKeydown(event: KeyboardEvent) {
      if (event.shiftKey && event.key === 'F10') {
        event.preventDefault();
        const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
        openAt(rect.left, rect.bottom);
        return;
      }
      if (!point.value) return;
      const parent = props.items[active.value];
      const children = parent?.items ?? [];
      const current = subActive.value === null ? parent : children[subActive.value];
      const command = menuCommand({
        key: event.key,
        direction: readingDirection(root.value),
        open: true,
        submenuOpen: subActive.value !== null,
        hasSubmenu: menuHasSubmenu(current),
      });
      if (!command) {
        const pool = subActive.value === null ? props.items : children;
        const from = subActive.value === null ? active.value : subActive.value;
        const next = typeaheadMove(typeahead, pool, event.key, Date.now(), from);
        if (next === null) return;
        event.preventDefault();
        if (subActive.value === null) active.value = next;
        else subActive.value = next;
        return;
      }
      if (command === 'open') return;
      event.preventDefault();
      if (command === 'close' || command === 'close-submenu') event.stopPropagation();
      if (command === 'close') {
        close();
        return;
      }
      if (command === 'close-submenu') {
        subActive.value = null;
        return;
      }
      if (command === 'open-submenu') {
        openSubmenu();
        return;
      }
      if (command === 'activate') {
        if (current && !current.disabled && !menuHasSubmenu(current)) {
          emit('select', current.id);
          close();
        }
        return;
      }
      const motion = command as MenuMotion;
      if (subActive.value === null) active.value = moveEnabledIndex(props.items, active.value, motion);
      else subActive.value = moveEnabledIndex(children, subActive.value, motion);
    }

    return () =>
      h(
        'div',
        {
          ref: root,
          role: 'group',
          'aria-label': props.label,
          tabindex: 0,
          'aria-controls': point.value ? menuId : undefined,
          'aria-activedescendant':
            point.value && props.items[active.value]
              ? `${menuId}-${(subActive.value === null ? props.items[active.value] : props.items[active.value]?.items?.[subActive.value])?.id}`
              : undefined,
          onContextmenu: (event: MouseEvent) => {
            event.preventDefault();
            openAt(event.clientX, event.clientY);
          },
          onKeydown,
        },
        [
          slots.default?.(),
          point.value
            ? h(
                'div',
                {
                  ref: menu,
                  id: menuId,
                  role: 'menu',
                  'aria-label': props.label,
                  class: 'wpl-menu wpl-menu-fixed',
                  style: { left: `${point.value.x}px`, top: `${point.value.y}px` },
                },
                props.items.map((item, index) => {
                  const nested = menuHasSubmenu(item);
                  const expanded = nested && index === active.value && subActive.value !== null;
                  return h('div', { key: item.id, class: 'wpl-menu-row' }, [
                    h(
                      'button',
                      {
                        id: `${menuId}-${item.id}`,
                        type: 'button',
                        role: 'menuitem',
                        class: 'wpl-menu-item',
                        disabled: item.disabled,
                        'aria-haspopup': nested ? 'menu' : undefined,
                        'aria-expanded': nested ? expanded : undefined,
                        'aria-controls': expanded ? `${menuId}-sub-${item.id}` : undefined,
                        'data-active': subActive.value === null && index === active.value ? 'true' : undefined,
                        onMouseenter: () => {
                          active.value = index;
                          if (nested) openSubmenu(index);
                          else subActive.value = null;
                        },
                        onClick: () => {
                          if (nested) openSubmenu(index);
                          else if (!item.disabled) {
                            emit('select', item.id);
                            close();
                          }
                        },
                      },
                      [h('span', item.label), nested ? h('span', { class: 'wpl-menu-caret', 'aria-hidden': 'true' }) : null],
                    ),
                    expanded
                      ? h(
                          'div',
                          { id: `${menuId}-sub-${item.id}`, role: 'menu', 'aria-label': item.label, class: 'wpl-menu wpl-menu-sub' },
                          item.items?.map((child, childIndex) =>
                            h(
                              'button',
                              {
                                key: child.id,
                                id: `${menuId}-${child.id}`,
                                type: 'button',
                                role: 'menuitem',
                                class: 'wpl-menu-item',
                                disabled: child.disabled,
                                'data-active': childIndex === subActive.value ? 'true' : undefined,
                                onMouseenter: () => (subActive.value = childIndex),
                                onClick: () => {
                                  if (!child.disabled) {
                                    emit('select', child.id);
                                    close();
                                  }
                                },
                              },
                              child.label,
                            ),
                          ),
                        )
                      : null,
                  ]);
                }),
              )
            : null,
        ],
      );
  },
});
