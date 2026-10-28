import { clampInteger, inputClassName, otpApply, otpCells, otpDelete, otpLength, readingDirection } from '@white-plumeria/core';
import { defineComponent, h, ref } from 'vue';
import { Icon } from './icon.ts';
import { useWhitePlumeria } from './provider.ts';

export const PasswordField = defineComponent({
  name: 'PasswordField',
  props: {
    label: { type: String, required: true },
    modelValue: { type: String, default: undefined },
    name: { type: String, default: undefined },
    autocomplete: { type: String, default: 'current-password' },
    invalid: { type: Boolean, default: false },
    disabled: { type: Boolean, default: false },
  },
  emits: ['update:modelValue'],
  setup(props, { emit }) {
    const { t } = useWhitePlumeria();
    const internal = ref('');
    const visible = ref(false);
    const inputId = `wpl-password-${Math.random().toString(36).slice(2, 8)}`;
    return () => {
      const current = props.modelValue ?? internal.value;
      return h('div', { class: 'wpl-field' }, [
        h('label', { class: 'wpl-label', for: inputId }, props.label),
        h('div', { class: 'wpl-password' }, [
          h('input', {
            id: inputId,
            class: 'wpl-input',
            type: visible.value ? 'text' : 'password',
            name: props.name,
            value: current,
            autocomplete: props.autocomplete,
            disabled: props.disabled,
            'aria-invalid': props.invalid || undefined,
            onInput: (event: Event) => {
              const next = (event.target as HTMLInputElement).value;
              if (props.modelValue === undefined) internal.value = next;
              emit('update:modelValue', next);
            },
          }),
          h(
            'button',
            {
              type: 'button',
              class: 'wpl-icon-btn wpl-btn-ghost',
              'aria-pressed': visible.value ? 'true' : 'false',
              'aria-label': visible.value ? t('hidePassword') : t('showPassword'),
              disabled: props.disabled,
              onClick: () => {
                visible.value = !visible.value;
              },
            },
            [h(Icon, { name: visible.value ? 'eyeOff' : 'eye' })],
          ),
        ]),
      ]);
    };
  },
});

export const OtpField = defineComponent({
  name: 'OtpField',
  props: {
    label: { type: String, required: true },
    length: { type: Number, default: 6 },
    modelValue: { type: String, default: undefined },
    name: { type: String, default: undefined },
    numeric: { type: Boolean, default: true },
    disabled: { type: Boolean, default: false },
  },
  emits: ['update:modelValue'],
  setup(props, { emit }) {
    const { t } = useWhitePlumeria();
    const uid = `wpl-otp-${Math.random().toString(36).slice(2, 8)}`;
    const internal = ref('');
    const refs: Array<HTMLInputElement | null> = [];
    return () => {
      const size = otpLength(props.length);
      const current = props.modelValue ?? internal.value;
      const cells = otpCells(current, size, props.numeric);
      const commit = (next: string, focus: number) => {
        if (props.modelValue === undefined) internal.value = next;
        emit('update:modelValue', next);
        queueMicrotask(() => refs[focus]?.focus());
      };
      return h('div', { class: 'wpl-field' }, [
        h('label', { class: 'wpl-label', id: `${uid}-label` }, props.label),
        h(
          'div',
          { class: 'wpl-otp', role: 'group', 'aria-labelledby': `${uid}-label` },
          cells.map((cell, index) =>
            h('input', {
              key: index,
              ref: (node: unknown) => {
                refs[index] = node instanceof HTMLInputElement ? node : null;
              },
              class: inputClassName({ className: 'wpl-otp-cell' }),
              value: cell,
              inputmode: props.numeric ? 'numeric' : 'text',
              autocomplete: index === 0 ? 'one-time-code' : 'off',
              'aria-label': `${t('character')} ${index + 1} ${t('of')} ${size}`,
              disabled: props.disabled,
              maxlength: 1,
              onInput: (event: Event) => {
                const raw = (event.target as HTMLInputElement).value;
                const result = raw
                  ? otpApply(current, size, props.numeric, index, raw.slice(-1))
                  : otpDelete(current, size, props.numeric, index);
                commit(result.value, result.focus);
              },
              onPaste: (event: ClipboardEvent) => {
                event.preventDefault();
                const result = otpApply(current, size, props.numeric, index, event.clipboardData?.getData('text') ?? '');
                commit(result.value, result.focus);
              },
              onKeydown: (event: KeyboardEvent) => {
                if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
                  event.preventDefault();
                  const direction = readingDirection(event.currentTarget as HTMLElement);
                  const delta = event.key === 'ArrowRight' ? (direction === 'rtl' ? -1 : 1) : direction === 'rtl' ? 1 : -1;
                  refs[Math.min(size - 1, Math.max(0, index + delta))]?.focus();
                }
                if (event.key === 'Backspace' && !cells[index]) {
                  event.preventDefault();
                  const result = otpDelete(current, size, props.numeric, index);
                  commit(result.value, result.focus);
                }
              },
            }),
          ),
        ),
        props.name ? h('input', { type: 'hidden', name: props.name, value: current }) : null,
      ]);
    };
  },
});

export const Rating = defineComponent({
  name: 'Rating',
  props: {
    label: { type: String, required: true },
    max: { type: Number, default: 5 },
    modelValue: { type: Number, default: undefined },
    name: { type: String, default: undefined },
    readOnly: { type: Boolean, default: false },
  },
  emits: ['update:modelValue'],
  setup(props, { emit }) {
    const { t } = useWhitePlumeria();
    const internal = ref(0);
    const groupName = props.name ?? `wpl-rating-${Math.random().toString(36).slice(2, 8)}`;
    return () => {
      const count = clampInteger(props.max, 1, 10, 5);
      const current = clampInteger(props.modelValue ?? internal.value, 0, count, 0);
      if (props.readOnly) {
        return h(
          'div',
          { class: 'wpl-rating', role: 'img', 'aria-label': `${props.label}: ${current} ${t('of')} ${count}` },
          Array.from({ length: count }, (_, index) =>
            h('span', { class: index < current ? 'wpl-rating-icon is-on' : 'wpl-rating-icon', 'aria-hidden': 'true' }, [h(Icon, { name: 'star' })]),
          ),
        );
      }
      return h('fieldset', { class: 'wpl-rating' }, [
        h('legend', { class: 'wpl-label' }, props.label),
        ...Array.from({ length: count }, (_, index) => {
          const score = index + 1;
          return h('label', { class: 'wpl-rating-option', key: score }, [
            h('input', {
              type: 'radio',
              name: groupName,
              value: score,
              checked: current === score,
              onChange: () => {
                if (props.modelValue === undefined) internal.value = score;
                emit('update:modelValue', score);
              },
            }),
            h('span', { class: score <= current ? 'wpl-rating-icon is-on' : 'wpl-rating-icon', 'aria-hidden': 'true' }, [h(Icon, { name: 'star' })]),
            h('span', { class: 'wpl-sr-only' }, `${score} ${t('of')} ${count}`),
          ]);
        }),
      ]);
    };
  },
});
