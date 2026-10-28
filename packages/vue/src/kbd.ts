import { defineComponent, h, type PropType } from 'vue';

export const Kbd = defineComponent({
  name: 'Kbd',
  props: {
    keys: { type: Array as PropType<string[]>, default: undefined },
  },
  setup(props, { slots }) {
    return () => {
      if (props.keys && props.keys.length > 0) {
        return h(
          'span',
          { class: 'wpl-kbd-group' },
          props.keys.flatMap((key, index) => [
            index > 0 ? h('span', { 'aria-hidden': 'true' }, '+') : null,
            h('kbd', { class: 'wpl-kbd', key: `${key}-${index}` }, key),
          ]),
        );
      }
      return h('kbd', { class: 'wpl-kbd' }, slots.default?.());
    };
  },
});
