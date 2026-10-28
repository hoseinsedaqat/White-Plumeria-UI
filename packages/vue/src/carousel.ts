import { canMove, carouselIndexFromKey, clampIndex, moveIndex, readingDirection } from '@white-plumeria/core';
import { defineComponent, h, ref, type PropType } from 'vue';
import { Icon } from './icon.ts';
import { useWhitePlumeria } from './provider.ts';

export interface CarouselSlide {
  id: string;
  label: string;
  content: string;
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
    const { t } = useWhitePlumeria();
    const uid = `wpl-carousel-${Math.random().toString(36).slice(2, 8)}`;
    const internal = ref(0);
    const startX = ref<number | null>(null);
    return () => {
      const count = props.slides.length;
      if (count === 0) return h('p', { class: 'wpl-muted' }, t('empty'));
      const current = clampIndex(props.modelValue ?? internal.value, count);
      const commit = (next: number) => {
        const clamped = clampIndex(next, count);
        if (props.modelValue === undefined) internal.value = clamped;
        emit('update:modelValue', clamped);
      };
      const go = (delta: number) => {
        if (!canMove(current, delta, count, props.loop)) return;
        commit(moveIndex(current, delta, count, props.loop));
      };
      return h('section', { class: 'wpl-carousel', 'aria-roledescription': 'carousel', 'aria-label': props.label || t('carousel') }, [
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
                  slide.content,
                );
              }),
            ),
          ],
        ),
        h('div', { class: 'wpl-carousel-bar' }, [
          h(
            'button',
            { type: 'button', class: 'wpl-btn wpl-btn-outline wpl-btn-sm', disabled: !canMove(current, -1, count, props.loop), onClick: () => go(-1) },
            [h(Icon, { name: 'chevronLeft' }), h('span', { class: 'wpl-sr-only' }, t('previous'))],
          ),
          h(
            'div',
            { class: 'wpl-carousel-dots', role: 'tablist', 'aria-label': props.label || t('carousel') },
            props.slides.map((slide, slideIndex) =>
              h(
                'button',
                {
                  key: slide.id,
                  type: 'button',
                  role: 'tab',
                  class: 'wpl-carousel-dot',
                  'aria-selected': slideIndex === current ? 'true' : 'false',
                  'aria-controls': `${uid}-panel-${slide.id}`,
                  tabindex: slideIndex === current ? 0 : -1,
                  onClick: () => commit(slideIndex),
                  onKeydown: (event: KeyboardEvent) => {
                    const next = carouselIndexFromKey(current, count, event.key, readingDirection(event.currentTarget as HTMLElement), props.loop);
                    if (next === null) return;
                    event.preventDefault();
                    commit(next);
                  },
                },
                [h('span', { class: 'wpl-sr-only' }, slide.label)],
              ),
            ),
          ),
          h(
            'button',
            { type: 'button', class: 'wpl-btn wpl-btn-outline wpl-btn-sm', disabled: !canMove(current, 1, count, props.loop), onClick: () => go(1) },
            [h(Icon, { name: 'chevronRight' }), h('span', { class: 'wpl-sr-only' }, t('next'))],
          ),
        ]),
      ]);
    };
  },
});
