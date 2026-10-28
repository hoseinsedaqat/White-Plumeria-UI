import {
  containerClassName,
  cx,
  gridClassName,
  stackClassName,
  type ContainerSize,
  type GridColumns,
  type StackGap,
} from '@white-plumeria/core';
import { defineComponent, h, ref, type PropType } from 'vue';
import { IconButton } from './button.ts';
import { useWhitePlumeria } from './provider.ts';

export interface NavItem {
  href: string;
  label: string;
  current?: boolean;
}

export const Container = defineComponent({
  name: 'Container',
  props: { size: { type: String as PropType<ContainerSize>, default: 'lg' } },
  setup(props, { slots }) {
    return () => h('div', { class: containerClassName(props.size) }, slots.default?.());
  },
});

export const Stack = defineComponent({
  name: 'Stack',
  props: { gap: { type: String as PropType<StackGap>, default: 'md' } },
  setup(props, { slots }) {
    return () => h('div', { class: stackClassName(props.gap) }, slots.default?.());
  },
});

export const Flex = defineComponent({
  name: 'Flex',
  props: {
    justify: { type: String as PropType<'start' | 'between' | 'end'>, default: 'start' },
    wrap: { type: Boolean, default: false },
  },
  setup(props, { slots }) {
    return () =>
      h(
        'div',
        {
          class: cx(
            'wpl-flex',
            props.wrap && 'wpl-flex-wrap',
            props.justify === 'between' && 'wpl-flex-between',
            props.justify === 'end' && 'wpl-flex-end',
          ),
        },
        slots.default?.(),
      );
  },
});

export const Grid = defineComponent({
  name: 'Grid',
  props: { columns: { type: Number as PropType<GridColumns>, default: 2 } },
  setup(props, { slots }) {
    return () => h('div', { class: gridClassName(props.columns) }, slots.default?.());
  },
});

export const NavigationMenu = defineComponent({
  name: 'NavigationMenu',
  props: {
    label: { type: String, required: true },
    items: { type: Array as PropType<NavItem[]>, required: true },
  },
  setup(props) {
    return () =>
      h(
        'nav',
        { class: 'wpl-nav', 'aria-label': props.label },
        props.items.map((item) =>
          h('a', { href: item.href, 'aria-current': item.current ? 'page' : undefined, class: 'wpl-nav-link' }, item.label),
        ),
      );
  },
});

export const Navbar = defineComponent({
  name: 'Navbar',
  props: {
    brand: { type: String, required: true },
    href: { type: String, default: '#' },
    items: { type: Array as PropType<NavItem[]>, required: true },
  },
  setup(props) {
    const open = ref(false);
    const { t } = useWhitePlumeria();
    return () =>
      h('header', { class: 'wpl-navbar', 'data-open': open.value || undefined }, [
        h('a', { class: 'wpl-navbar-brand', href: props.href }, props.brand),
        h(IconButton, { class: 'wpl-navbar-toggle', label: t('openMenu'), onClick: () => (open.value = !open.value) }),
        h(NavigationMenu, { label: props.brand, items: props.items }),
      ]);
  },
});

export const Sidebar = defineComponent({
  name: 'Sidebar',
  props: {
    label: { type: String, required: true },
    items: { type: Array as PropType<NavItem[]>, required: true },
  },
  setup(props) {
    return () =>
      h(
        'nav',
        { class: 'wpl-sidebar', 'aria-label': props.label },
        props.items.map((item) =>
          h('a', { href: item.href, class: 'wpl-sidebar-link', 'aria-current': item.current ? 'page' : undefined }, item.label),
        ),
      );
  },
});

export const PageHeader = defineComponent({
  name: 'PageHeader',
  props: {
    title: { type: String, required: true },
    description: { type: String, default: '' },
  },
  setup(props, { slots }) {
    return () =>
      h('header', { class: 'wpl-page-header' }, [
        h('div', [h('h1', { class: 'wpl-page-title' }, props.title), props.description ? h('p', { class: 'wpl-muted' }, props.description) : null]),
        slots.actions ? h('div', { class: 'wpl-cluster' }, slots.actions()) : null,
      ]);
  },
});

export const Footer = defineComponent({
  name: 'Footer',
  props: { note: { type: String, default: '' } },
  setup(props, { slots }) {
    return () => h('footer', { class: 'wpl-footer' }, [props.note ? h('p', props.note) : null, slots.default?.()]);
  },
});

export const ResponsiveLayout = defineComponent({
  name: 'ResponsiveLayout',
  props: { open: { type: Boolean, default: false } },
  setup(props, { slots }) {
    return () =>
      h('div', { class: 'wpl-layout', 'data-open': props.open || undefined }, [
        slots.sidebar?.(),
        h('div', { class: 'wpl-layout-main' }, slots.default?.()),
      ]);
  },
});

export const SplitPane = defineComponent({
  name: 'SplitPane',
  props: {
    label: { type: String, required: true },
    size: { type: Number, default: 50 },
  },
  emits: ['update:size'],
  setup(props, { slots, emit }) {
    const internal = ref(props.size);
    const root = ref<HTMLElement | null>(null);
    return () => {
      const current = props.size;
      return h(
        'div',
        { ref: root, class: 'wpl-split', style: { '--wpl-split-size': `${internal.value}%` } },
        [
          h('div', { class: 'wpl-split-pane' }, slots.start?.()),
          h('div', {
            role: 'separator',
            'aria-orientation': 'vertical',
            'aria-label': props.label,
            'aria-valuenow': current,
            tabindex: 0,
            class: 'wpl-split-handle',
            onKeydown: (event: KeyboardEvent) => {
              const delta = event.key === 'ArrowRight' ? 5 : event.key === 'ArrowLeft' ? -5 : 0;
              if (!delta) return;
              event.preventDefault();
              internal.value = Math.min(80, Math.max(20, internal.value + delta));
              emit('update:size', internal.value);
            },
          }),
          h('div', { class: 'wpl-split-pane' }, slots.end?.()),
        ],
      );
    };
  },
});
