import { cx, directionalIcons, iconPaths, type IconName } from '@white-plumeria/core';
import { defineComponent, h, type PropType } from 'vue';

export const Icon = defineComponent({
  name: 'Icon',
  inheritAttrs: false,
  props: {
    name: { type: String as PropType<IconName>, required: true },
  },
  setup(props, { attrs }) {
    return () =>
      h(
        'svg',
        {
          viewBox: '0 0 24 24',
          'aria-hidden': 'true',
          focusable: 'false',
          fill: 'none',
          stroke: 'currentColor',
          'stroke-width': '1.75',
          'stroke-linecap': 'round',
          'stroke-linejoin': 'round',
          class: cx('wpl-icon', directionalIcons.has(props.name) && 'wpl-icon-dir', attrs.class as string | undefined),
        },
        [h('path', { d: iconPaths[props.name] })],
      );
  },
});

export const Mark = defineComponent({
  name: 'Mark',
  setup() {
    return () =>
      h('svg', { class: 'wpl-mark', viewBox: '0 0 64 64', 'aria-hidden': 'true' }, [
        h(
          'g',
          { fill: 'none', stroke: 'currentColor', 'stroke-width': '1.6', 'stroke-linejoin': 'round', 'stroke-linecap': 'round' },
          [0, 72, 144, 216, 288].map((angle) =>
            h('path', {
              d: 'M32 10.5c5.2 6.7 6.6 14.1 1.6 21.1-1.1-2.2-2.1-2.2-3.2 0-5-7-3.6-14.4 1.6-21.1z',
              transform: `rotate(${angle} 32 32)`,
            }),
          ),
        ),
        h('circle', { cx: '32', cy: '32', r: '2.15', fill: 'currentColor' }),
      ]);
  },
});
