import {
  fieldClassName,
  formatNumber,
  inputClassName,
  selectClassName,
  textareaClassName,
  type ControlSize,
} from '@white-plumeria/core';
import { defineComponent, h, inject, provide, reactive, ref, useId, type InjectionKey, type PropType } from 'vue';
import { useWhitePlumeria } from './provider.ts';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

interface FieldContext {
  id: string;
  describedBy?: string;
  invalid: boolean;
  required: boolean;
  disabled: boolean;
}

const fieldKey: InjectionKey<FieldContext> = Symbol('wpl-field');

export const Label = defineComponent({
  name: 'Label',
  props: {
    for: { type: String, default: '' },
    required: { type: Boolean, default: false },
  },
  setup(props, { slots }) {
    const { t } = useWhitePlumeria();
    return () =>
      h('label', { class: 'wpl-label', for: props.for || undefined }, [
        slots.default?.(),
        props.required
          ? [h('span', { class: 'wpl-required', 'aria-hidden': 'true' }, '*'), h('span', { class: 'wpl-sr-only' }, t('required'))]
          : null,
      ]);
  },
});

export const FormMessage = defineComponent({
  name: 'FormMessage',
  props: {
    tone: { type: String as PropType<'hint' | 'error'>, default: 'hint' },
    id: { type: String, default: '' },
  },
  setup(props, { slots }) {
    return () =>
      h(
        'p',
        {
          id: props.id || undefined,
          class: props.tone === 'error' ? 'wpl-field-error' : 'wpl-field-hint',
          role: props.tone === 'error' ? 'alert' : undefined,
        },
        slots.default?.(),
      );
  },
});

export const ValidationMessage = defineComponent({
  name: 'ValidationMessage',
  props: { id: { type: String, default: '' } },
  setup(props, { slots }) {
    return () => h(FormMessage, { tone: 'error', id: props.id }, slots.default?.());
  },
});

export const FormField = defineComponent({
  name: 'FormField',
  props: {
    label: { type: String, required: true },
    hint: { type: String, default: '' },
    error: { type: String, default: '' },
    required: { type: Boolean, default: false },
    disabled: { type: Boolean, default: false },
  },
  setup(props, { slots }) {
    const uid = useId();
    const id = `wpl-field-${uid}`;
    const field = reactive<FieldContext>({
      id,
      describedBy: undefined,
      invalid: false,
      required: false,
      disabled: false,
    });
    provide(fieldKey, field);
    return () => {
      const hintId = props.hint ? `${id}-hint` : undefined;
      const errorId = props.error ? `${id}-error` : undefined;
      field.describedBy = [hintId, errorId].filter(Boolean).join(' ') || undefined;
      field.invalid = Boolean(props.error);
      field.required = props.required;
      field.disabled = props.disabled;
      return h('div', { class: fieldClassName(Boolean(props.error)) }, [
        h(Label, { for: id, required: props.required }, () => props.label),
        slots.default?.(),
        props.hint ? h(FormMessage, { id: hintId }, () => props.hint) : null,
        props.error ? h(ValidationMessage, { id: errorId }, () => props.error) : null,
      ]);
    };
  },
});

function useFieldAttrs(invalid: () => boolean) {
  const field = inject(fieldKey, null);
  return () => ({
    id: field?.id,
    'aria-invalid': invalid() || field?.invalid || undefined,
    'aria-describedby': field?.describedBy,
    'aria-required': field?.required || undefined,
    required: field?.required || undefined,
    disabled: field?.disabled || undefined,
  });
}

export const Input = defineComponent({
  name: 'Input',
  inheritAttrs: false,
  props: {
    modelValue: { type: String, default: undefined },
    size: { type: String as PropType<ControlSize>, default: 'md' },
    invalid: { type: Boolean, default: false },
  },
  emits: ['update:modelValue'],
  setup(props, { attrs, emit }) {
    const fieldAttrs = useFieldAttrs(() => props.invalid);
    return () =>
      h('input', {
        ...attrs,
        ...fieldAttrs(),
        class: inputClassName({ size: props.size, className: typeof attrs.class === 'string' ? attrs.class : undefined }),
        value: props.modelValue,
        onInput: (event: Event) => {
          const value = (event.target as HTMLInputElement).value;
          emit('update:modelValue', value);
          const listener = attrs.onInput;
          if (typeof listener === 'function') listener(event);
        },
      });
  },
});

export const Textarea = defineComponent({
  name: 'Textarea',
  inheritAttrs: false,
  props: {
    modelValue: { type: String, default: undefined },
    size: { type: String as PropType<ControlSize>, default: 'md' },
    invalid: { type: Boolean, default: false },
    rows: { type: Number, default: 4 },
  },
  emits: ['update:modelValue'],
  setup(props, { attrs, emit }) {
    const fieldAttrs = useFieldAttrs(() => props.invalid);
    return () =>
      h('textarea', {
        ...attrs,
        ...fieldAttrs(),
        rows: props.rows,
        class: textareaClassName({ size: props.size }),
        value: props.modelValue,
        onInput: (event: Event) => emit('update:modelValue', (event.target as HTMLTextAreaElement).value),
      });
  },
});

export const Select = defineComponent({
  name: 'Select',
  inheritAttrs: false,
  props: {
    modelValue: { type: String, default: undefined },
    size: { type: String as PropType<ControlSize>, default: 'md' },
    invalid: { type: Boolean, default: false },
    options: { type: Array as PropType<SelectOption[]>, default: () => [] },
    placeholder: { type: String, default: '' },
  },
  emits: ['update:modelValue'],
  setup(props, { attrs, emit, slots }) {
    const fieldAttrs = useFieldAttrs(() => props.invalid);
    return () =>
      h(
        'select',
        {
          ...attrs,
          ...fieldAttrs(),
          class: selectClassName({ size: props.size }),
          value: props.modelValue,
          onChange: (event: Event) => emit('update:modelValue', (event.target as HTMLSelectElement).value),
        },
        [
          props.placeholder ? h('option', { value: '' }, props.placeholder) : null,
          ...props.options.map((option) =>
            h('option', { value: option.value, disabled: option.disabled, key: option.value }, option.label),
          ),
          slots.default?.(),
        ],
      );
  },
});

export const Checkbox = defineComponent({
  name: 'Checkbox',
  props: {
    label: { type: String, required: true },
    modelValue: { type: Boolean, default: undefined },
    name: { type: String, default: '' },
  },
  emits: ['update:modelValue'],
  setup(props, { emit }) {
    return () =>
      h('label', { class: 'wpl-check' }, [
        h('input', {
          type: 'checkbox',
          name: props.name || undefined,
          checked: props.modelValue,
          onChange: (event: Event) => emit('update:modelValue', (event.target as HTMLInputElement).checked),
        }),
        h('span', props.label),
      ]);
  },
});

export const RadioGroup = defineComponent({
  name: 'RadioGroup',
  props: {
    label: { type: String, required: true },
    name: { type: String, required: true },
    options: { type: Array as PropType<SelectOption[]>, required: true },
    modelValue: { type: String, default: undefined },
  },
  emits: ['update:modelValue'],
  setup(props, { emit }) {
    return () =>
      h('fieldset', { class: 'wpl-field' }, [
        h('legend', { class: 'wpl-label' }, props.label),
        ...props.options.map((option) =>
          h('label', { class: 'wpl-radio', key: option.value }, [
            h('input', {
              type: 'radio',
              name: props.name,
              value: option.value,
              checked: props.modelValue === option.value,
              disabled: option.disabled,
              onChange: () => emit('update:modelValue', option.value),
            }),
            h('span', option.label),
          ]),
        ),
      ]);
  },
});

export const Switch = defineComponent({
  name: 'Switch',
  props: {
    label: { type: String, required: true },
    modelValue: { type: Boolean, default: undefined },
    disabled: { type: Boolean, default: false },
    name: { type: String, default: '' },
  },
  emits: ['update:modelValue'],
  setup(props, { emit }) {
    const internal = ref(false);
    return () => {
      const checked = props.modelValue ?? internal.value;
      function commit(next: boolean) {
        if (props.modelValue === undefined) internal.value = next;
        emit('update:modelValue', next);
      }
      return h(
        'button',
        {
          type: 'button',
          role: 'switch',
          class: 'wpl-switch',
          'aria-checked': checked,
          disabled: props.disabled,
          onClick: () => commit(!checked),
        },
        [
          h('span', { class: 'wpl-switch-control', 'aria-hidden': 'true' }),
          h('span', props.label),
          props.name ? h('input', { type: 'checkbox', name: props.name, checked, hidden: true }) : null,
        ],
      );
    };
  },
});

export const Slider = defineComponent({
  name: 'Slider',
  props: {
    label: { type: String, required: true },
    min: { type: Number, default: 0 },
    max: { type: Number, default: 100 },
    step: { type: Number, default: 1 },
    modelValue: { type: Number, default: undefined },
  },
  emits: ['update:modelValue'],
  setup(props, { emit }) {
    const id = useId();
    const { locale } = useWhitePlumeria();
    const internal = ref(props.min);
    return () => {
      const current = props.modelValue ?? internal.value;
      return h('div', { class: 'wpl-field' }, [
        h('div', { class: 'wpl-flex wpl-flex-between' }, [
          h('label', { class: 'wpl-label', for: id }, props.label),
          h('output', { for: id }, formatNumber(current, locale.value)),
        ]),
        h('input', {
          id,
          class: 'wpl-slider',
          type: 'range',
          min: props.min,
          max: props.max,
          step: props.step,
          value: current,
          'aria-valuetext': formatNumber(current, locale.value),
          onInput: (event: Event) => {
            const next = Number((event.target as HTMLInputElement).value);
            if (props.modelValue === undefined) internal.value = next;
            emit('update:modelValue', next);
          },
        }),
      ]);
    };
  },
});

export const SearchInput = defineComponent({
  name: 'SearchInput',
  props: {
    label: { type: String, required: true },
    modelValue: { type: String, default: '' },
    placeholder: { type: String, default: '' },
  },
  emits: ['update:modelValue', 'search'],
  setup(props, { emit }) {
    const id = useId();
    return () =>
      h('div', { class: 'wpl-search' }, [
        h('label', { class: 'wpl-sr-only', for: id }, props.label),
        h('input', {
          id,
          class: 'wpl-input',
          type: 'search',
          value: props.modelValue,
          placeholder: props.placeholder || props.label,
          onInput: (event: Event) => emit('update:modelValue', (event.target as HTMLInputElement).value),
          onKeydown: (event: KeyboardEvent) => {
            if (event.key === 'Enter') emit('search', (event.target as HTMLInputElement).value);
          },
        }),
      ]);
  },
});
