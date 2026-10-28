import {
  alertClassName,
  avatarClassName,
  badgeClassName,
  cardClassName,
  spinnerClassName,
  type AlertVariant,
  type AvatarSize,
  type BadgeVariant,
  type ControlSize,
} from '@white-plumeria/core';
import { defineComponent, h, ref, type PropType } from 'vue';
import { Icon } from './icon.ts';
import { mergeClass } from './util.ts';

export const Link = defineComponent({
  name: 'Link',
  inheritAttrs: false,
  props: {
    href: { type: String, required: true },
    external: { type: Boolean, default: false },
  },
  setup(props, { slots, attrs }) {
    return () =>
      h(
        'a',
        {
          ...attrs,
          href: props.href,
          class: mergeClass('wpl-link', attrs.class),
          ...(props.external ? { target: '_blank', rel: 'noreferrer' } : {}),
        },
        [
          slots.default?.(),
          props.external ? h(Icon, { name: 'external', class: 'wpl-icon-dir' }) : null,
        ],
      );
  },
});

export const Badge = defineComponent({
  name: 'Badge',
  props: {
    variant: { type: String as PropType<BadgeVariant>, default: 'neutral' },
  },
  setup(props, { slots }) {
    return () => h('span', { class: badgeClassName(props.variant) }, slots.default?.());
  },
});

export const Avatar = defineComponent({
  name: 'Avatar',
  props: {
    name: { type: String, required: true },
    src: { type: String, default: '' },
    alt: { type: String, default: '' },
    size: { type: String as PropType<AvatarSize>, default: 'md' },
    status: { type: String as PropType<'online' | 'busy' | 'offline' | ''>, default: '' },
    statusLabel: { type: String, default: '' },
  },
  setup(props) {
    const failed = ref(false);
    return () => {
      const initials = props.name
        .split(/\s+/)
        .slice(0, 2)
        .map((part) => part[0] ?? '')
        .join('')
        .toUpperCase();
      return h('span', { class: avatarClassName(props.size) }, [
        props.src && !failed.value
          ? h('img', {
              src: props.src,
              alt: props.alt || props.name,
              onError: () => {
                failed.value = true;
              },
            })
          : h('span', { 'aria-hidden': 'true' }, initials),
        !props.src && !props.alt ? h('span', { class: 'wpl-sr-only' }, props.name) : null,
        props.status && props.statusLabel
          ? [
              h('span', {
                class: 'wpl-avatar-status',
                style:
                  props.status === 'busy'
                    ? { background: 'var(--wpl-color-warning)' }
                    : props.status === 'offline'
                      ? { background: 'var(--wpl-color-text-subtle)' }
                      : undefined,
              }),
              h('span', { class: 'wpl-sr-only' }, props.statusLabel),
            ]
          : null,
      ]);
    };
  },
});

export const Card = defineComponent({
  name: 'Card',
  props: {
    title: { type: String, default: '' },
    description: { type: String, default: '' },
  },
  setup(props, { slots }) {
    return () =>
      h('section', { class: cardClassName() }, [
        props.title || props.description
          ? h('header', { class: 'wpl-card-header' }, [
              props.title ? h('h2', { class: 'wpl-card-title' }, props.title) : null,
              props.description ? h('p', { class: 'wpl-card-description' }, props.description) : null,
            ])
          : null,
        slots.default ? h('div', { class: 'wpl-card-body' }, slots.default()) : null,
        slots.footer ? h('footer', { class: 'wpl-card-footer' }, slots.footer()) : null,
      ]);
  },
});

export const Divider = defineComponent({
  name: 'Divider',
  props: { label: { type: String, default: '' } },
  setup(props) {
    return () =>
      h('div', { class: 'wpl-divider', role: 'separator' }, props.label ? [h('span', props.label)] : undefined);
  },
});

export const Separator = defineComponent({
  name: 'Separator',
  props: {
    orientation: { type: String as PropType<'horizontal' | 'vertical'>, default: 'horizontal' },
  },
  setup(props) {
    return () =>
      h('div', {
        class: props.orientation === 'vertical' ? 'wpl-separator wpl-separator-vertical' : 'wpl-separator',
        role: 'separator',
        'aria-orientation': props.orientation,
      });
  },
});

export const Spinner = defineComponent({
  name: 'Spinner',
  props: {
    label: { type: String, default: 'Loading' },
    size: { type: String as PropType<ControlSize>, default: 'md' },
  },
  setup(props) {
    return () =>
      h('span', { class: spinnerClassName(props.size), role: 'status' }, [
        h('span', { class: 'wpl-sr-only' }, props.label),
      ]);
  },
});

export const Skeleton = defineComponent({
  name: 'Skeleton',
  props: {
    width: { type: String, default: '100%' },
    height: { type: String, default: '1rem' },
  },
  setup(props) {
    return () =>
      h('span', {
        class: 'wpl-skeleton',
        style: { inlineSize: props.width, blockSize: props.height },
        'aria-hidden': 'true',
      });
  },
});

export const Progress = defineComponent({
  name: 'Progress',
  props: {
    label: { type: String, required: true },
    value: { type: Number, default: undefined },
    max: { type: Number, default: 100 },
  },
  setup(props) {
    return () => {
      const indeterminate = props.value === undefined;
      const safeMax = props.max > 0 ? props.max : 100;
      const percent = indeterminate ? undefined : Math.min(100, Math.max(0, ((props.value ?? 0) / safeMax) * 100));
      return h(
        'div',
        {
          class: indeterminate ? 'wpl-progress-track wpl-progress-indeterminate' : 'wpl-progress-track',
          role: 'progressbar',
          'aria-label': props.label,
          'aria-valuemin': 0,
          'aria-valuemax': safeMax,
          'aria-valuenow': indeterminate ? undefined : props.value,
        },
        [h('span', { class: 'wpl-progress-bar', style: percent === undefined ? undefined : { inlineSize: `${percent}%` } })],
      );
    };
  },
});

export const EmptyState = defineComponent({
  name: 'EmptyState',
  props: {
    title: { type: String, required: true },
    description: { type: String, default: '' },
  },
  setup(props, { slots }) {
    return () =>
      h('div', { class: 'wpl-empty' }, [
        h('h2', { class: 'wpl-empty-title' }, props.title),
        props.description ? h('p', { class: 'wpl-empty-description' }, props.description) : null,
        slots.default?.(),
      ]);
  },
});

export const Alert = defineComponent({
  name: 'Alert',
  props: {
    variant: { type: String as PropType<AlertVariant>, default: 'neutral' },
    title: { type: String, default: '' },
  },
  setup(props, { slots }) {
    const icon = props.variant === 'success' ? 'success' : props.variant === 'neutral' ? 'info' : 'alert';
    return () =>
      h('div', { class: alertClassName(props.variant), role: props.variant === 'danger' ? 'alert' : 'status' }, [
        h(Icon, { name: icon }),
        h('div', [
          props.title ? h('p', { class: 'wpl-alert-title' }, props.title) : null,
          slots.default ? h('div', { class: 'wpl-alert-description' }, slots.default()) : null,
        ]),
      ]);
  },
});

export const StatCard = defineComponent({
  name: 'StatCard',
  props: {
    label: { type: String, required: true },
    value: { type: String, required: true },
    hint: { type: String, default: '' },
  },
  setup(props) {
    return () =>
      h('article', { class: 'wpl-card wpl-stat' }, [
        h('p', { class: 'wpl-stat-label' }, props.label),
        h('p', { class: 'wpl-stat-value' }, props.value),
        props.hint ? h('p', { class: 'wpl-stat-hint' }, props.hint) : null,
      ]);
  },
});
