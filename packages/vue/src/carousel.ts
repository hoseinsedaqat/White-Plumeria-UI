import {
  canMove,
  carouselIndexFromKey,
  clampIndex,
  cx,
  formatNumber,
  moveIndex,
  readingDirection,
} from '@white-plumeria/core';
import { defineComponent, h, ref, type PropType } from 'vue';
import { Icon } from './icon.ts';
import { useWhitePlumeria } from './provider.ts';

export interface CarouselSlide {
  id: string;
  label: string;
  content?: string;
  src?: string;
  alt?: string;
  caption?: string;
}

export const Carousel = defineComponent({
  name: 'Carousel',
  props: {
    label: { type: String, required: true },
    slides: { type: Array as PropType<CarouselSlide[]>, required: true },
    modelValue: { type: Number, default: undefined },
    loop: { type: Boolean, default: false },
  },
  emits: ['update:modelValue'],
  setup(props, { emit }) {
    const { t, locale } = useWhitePlumeria();
    const uid = `wpl-carousel-${Math.random().toString(36).slice(2, 8)}`;
    const internal = ref(0);
    const startX = ref<number | null>(null);
    return () => {
      const count = props.slides.length;
      if (count === 0) return h('p', { class: 'wpl-muted' }, t('empty'));
      const current = clampIndex(props.modelValue ?? internal.value, count);
      const media = props.slides.some((slide) => Boolean(slide.src));
      const commit = (next: number) => {
        const clamped = clampIndex(next, count);
        if (props.modelValue === undefined) internal.value = clamped;
        emit('update:modelValue', clamped);
      };
      const go = (delta: number) => {
        if (!canMove(current, delta, count, props.loop)) return;
        commit(moveIndex(current, delta, count, props.loop));
      };
      const onTabKeyDown = (event: KeyboardEvent) => {
        const next = carouselIndexFromKey(current, count, event.key, readingDirection(event.currentTarget as HTMLElement), props.loop);
        if (next === null) return;
        event.preventDefault();
        commit(next);
      };
      const tabs = props.slides.map((slide, slideIndex) =>
        h(
          'button',
          {
            key: slide.id,
            type: 'button',
            role: 'tab',
            class: media ? 'wpl-carousel-thumb' : 'wpl-carousel-dot',
            'aria-selected': slideIndex === current ? 'true' : 'false',
            'aria-controls': `${uid}-panel-${slide.id}`,
            tabindex: slideIndex === current ? 0 : -1,
            onClick: () => commit(slideIndex),
            onKeydown: onTabKeyDown,
          },
          media
            ? [
                slide.src ? h('img', { src: slide.src, alt: '', draggable: false }) : String(slideIndex + 1),
                h('span', { class: 'wpl-sr-only' }, slide.label),
              ]
            : [h('span', { class: 'wpl-sr-only' }, slide.label)],
        ),
      );
      const control = (name: 'previous' | 'next', delta: number) =>
        h(
          'button',
          {
            type: 'button',
            class: media ? 'wpl-carousel-control' : 'wpl-btn wpl-btn-outline wpl-btn-sm',
            'aria-label': media ? t(name) : undefined,
            disabled: !canMove(current, delta, count, props.loop),
            onClick: () => go(delta),
          },
          [h(Icon, { name: delta < 0 ? 'chevronLeft' : 'chevronRight' }), media ? null : h('span', { class: 'wpl-sr-only' }, t(name))],
        );
      return h('section', { class: cx('wpl-carousel', media && 'wpl-carousel-media'), 'aria-roledescription': 'carousel', 'aria-label': props.label || t('carousel') }, [
        h(
          'div',
          {
            class: 'wpl-carousel-viewport',
            onPointerdown: (event: PointerEvent) => {
              if (event.target instanceof Element && event.target.closest('button, a, input, textarea, select')) return;
              startX.value = event.clientX;
            },
            onPointerup: (event: PointerEvent) => {
              if (startX.value === null) return;
              const delta = event.clientX - startX.value;
              startX.value = null;
              if (Math.abs(delta) < 48) return;
              const direction = readingDirection(event.currentTarget as HTMLElement);
              go(direction === 'rtl' ? (delta > 0 ? 1 : -1) : delta < 0 ? 1 : -1);
            },
          },
          [
            h(
              'div',
              {
                class: 'wpl-carousel-track',
                style: { '--wpl-carousel-index': String(current), '--wpl-carousel-count': String(count) },
              },
              props.slides.map((slide, slideIndex) => {
                const active = slideIndex === current;
                return h(
                  'div',
                  {
                    key: slide.id,
                    id: `${uid}-panel-${slide.id}`,
                    class: 'wpl-carousel-slide',
                    role: 'tabpanel',
                    'aria-roledescription': 'slide',
                    'aria-label': `${slide.label}, ${slideIndex + 1} ${t('of')} ${count}`,
                    'aria-hidden': active ? undefined : 'true',
                    inert: active ? undefined : true,
                    tabindex: active ? -1 : undefined,
                  },
                  slideBody(slide, active),
                );
              }),
            ),
            media
              ? h('p', { class: 'wpl-carousel-count', 'aria-hidden': 'true' }, `${formatNumber(current + 1, locale.value)} / ${formatNumber(count, locale.value)}`)
              : null,
            media ? h('div', { class: 'wpl-carousel-nav' }, [control('previous', -1), control('next', 1)]) : null,
          ],
        ),
        media
          ? h('div', { class: 'wpl-carousel-thumbs', role: 'tablist', 'aria-label': props.label || t('carousel') }, tabs)
          : h('div', { class: 'wpl-carousel-bar' }, [
              control('previous', -1),
              h('div', { class: 'wpl-carousel-dots', role: 'tablist', 'aria-label': props.label || t('carousel') }, tabs),
              control('next', 1),
            ]),
      ]);
    };
  },
});

function slideBody(slide: CarouselSlide, active: boolean) {
  return [
    slide.src
      ? h('figure', { class: 'wpl-carousel-figure' }, [
          h('img', {
            class: 'wpl-carousel-image',
            src: slide.src,
            alt: slide.alt ?? '',
            draggable: false,
            loading: active ? 'eager' : 'lazy',
          }),
          h('figcaption', { class: 'wpl-carousel-caption' }, [
            h('strong', slide.label),
            slide.caption ? h('span', slide.caption) : null,
          ]),
        ])
      : null,
    slide.content ? h('div', { class: 'wpl-carousel-copy' }, slide.content) : null,
    !slide.src && !slide.content ? h('p', { class: 'wpl-carousel-copy' }, slide.label) : null,
  ];
}
