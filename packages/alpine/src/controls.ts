import {
  buttonClassName,
  buttonGroupClassName,
  clampRangeEdge,
  fieldClassName,
  formatNumber,
  iconButtonClassName,
  inputClassName,
  isControlSize,
  normalizeRange,
  numberFieldCommit,
  numberFieldDraftValue,
  numberFieldStep,
  numberFieldText,
  otpApply,
  otpCells,
  otpDelete,
  otpLength,
  rangeBounds,
  rangeFill,
  readingDirection,
  toggleGroupMove,
  selectClassName,
  textareaClassName,
  type ButtonAppearance,
  type ButtonSize,
  type ButtonVariant,
  type ControlSize,
  type NumberRange,
} from '@white-plumeria/core';
import type { IconName } from '@white-plumeria/core';
import {
  emit,
  field,
  flag,
  h,
  labelOf,
  list,
  localeOf,
  num,
  svgIcon,
  text,
  translate,
  uid,
  type Config,
  type Magic,
} from './runtime.ts';

export interface ButtonConfig {
  variant?: ButtonVariant;
  appearance?: ButtonAppearance;
  size?: ButtonSize;
  loading?: boolean;
  disabled?: boolean;
  block?: boolean;
  type?: 'button' | 'submit' | 'reset';
  label?: string;
  className?: string;
}

function controlSize(value: unknown): ControlSize | undefined {
  return typeof value === 'string' && isControlSize(value) ? value : undefined;
}

function paintButton(
  button: HTMLButtonElement,
  config: ButtonConfig,
  label: string,
  onClick: () => void,
): void {
  const loading = config.loading === true;
  const disabled = config.disabled === true || loading;
  button.type = config.type ?? 'button';
  button.className = buttonClassName({
    variant: config.variant,
    size: config.size,
    appearance: config.appearance,
    loading,
    block: config.block,
    className: config.className,
  });
  button.disabled = disabled;
  if (loading) button.setAttribute('aria-busy', 'true');
  else button.removeAttribute('aria-busy');
  button.replaceChildren();
  if (loading) {
    button.append(h('span', { className: 'wpl-spinner', attrs: { 'aria-hidden': 'true' } }));
  }
  button.append(document.createTextNode(label));
  button.addEventListener('click', (event) => {
    if (disabled) {
      event.preventDefault();
      event.stopPropagation();
      return;
    }
    onClick();
  });
}

export function Button(config: ButtonConfig = {}) {
  return {
    root: {
      type: config.type ?? 'button',
      class: buttonClassName(config),
      'aria-busy': config.loading ? 'true' : undefined,
      disabled: config.loading || config.disabled || undefined,
    },
    init(this: Magic) {
      const label = labelOf(this, config as Config, 'Button');
      const click = () => emit(this, 'wpl-click', { variant: config.variant ?? 'primary' });
      if (this.$el instanceof HTMLButtonElement) {
        paintButton(this.$el, config, label, click);
        return;
      }
      const button = document.createElement('button');
      paintButton(button, config, label, click);
      this.$el.replaceChildren(button);
    },
  };
}

export function IconButton(config: ButtonConfig & { icon?: IconName } = {}) {
  return {
    init(this: Magic) {
      const label = labelOf(this, config as Config, 'Action');
      const button = document.createElement('button');
      const loading = config.loading === true;
      button.type = 'button';
      button.className = iconButtonClassName({
        variant: config.variant,
        size: config.size,
        appearance: config.appearance,
        className: config.className,
      });
      button.disabled = config.disabled === true || loading;
      button.setAttribute('aria-label', label);
      if (loading) button.setAttribute('aria-busy', 'true');
      if (config.icon) button.append(svgIcon(config.icon));
      else button.append(svgIcon('plus'));
      button.addEventListener('click', (event) => {
        if (button.disabled) {
          event.preventDefault();
          event.stopPropagation();
          return;
        }
        emit(this, 'wpl-click', { label });
      });
      this.$el.replaceChildren(button);
    },
  };
}

export function ButtonGroup(config: Config = {}) {
  return {
    init(this: Magic) {
      this.$el.className = buttonGroupClassName(
        flag(config.joined),
        text(config.className) || undefined,
      );
      const items = list<ButtonConfig>(config.items);
      if (!items.length) return;
      this.$el.replaceChildren(
        ...items.map((item) => {
          const host = document.createElement('div');
          const data = Button(item);
          data.init.call({ ...this, $el: host });
          return host;
        }),
      );
    },
  };
}

function changeValue(magic: Magic, value: string) {
  emit(magic, 'wpl-change', { value });
}

export function Input(config: Config = {}) {
  return {
    init(this: Magic) {
      const id = text(config.id) || uid('input');
      const input = h('input', {
        className: inputClassName({
          size: controlSize(config.size),
          className: text(config.className),
        }),
        attrs: {
          id,
          type: text(config.type, 'text'),
          name: text(config.name) || undefined,
          placeholder: text(config.placeholder) || undefined,
          value: text(config.value),
          required: flag(config.required) || undefined,
          disabled: flag(config.disabled) || undefined,
          readOnly: flag(config.readOnly) || undefined,
          'aria-invalid': flag(config.invalid) || undefined,
        },
        on: {
          input: (event) => changeValue(this, (event.target as HTMLInputElement).value),
        },
      });
      this.$el.replaceChildren(field(text(config.label), input));
    },
  };
}

export function Textarea(config: Config = {}) {
  return {
    init(this: Magic) {
      const id = text(config.id) || uid('textarea');
      const area = h('textarea', {
        className: textareaClassName({ size: controlSize(config.size) }),
        text: text(config.value),
        attrs: {
          id,
          name: text(config.name) || undefined,
          placeholder: text(config.placeholder) || undefined,
          required: flag(config.required) || undefined,
          disabled: flag(config.disabled) || undefined,
          'aria-invalid': flag(config.invalid) || undefined,
        },
        on: { input: (event) => changeValue(this, (event.target as HTMLTextAreaElement).value) },
      });
      this.$el.replaceChildren(field(text(config.label), area));
    },
  };
}

export function SearchInput(config: Config = {}) {
  return {
    init(this: Magic) {
      const id = uid('search');
      const initial = text(config.value);
      let clear: HTMLButtonElement;
      const input = h('input', {
        className: 'wpl-input',
        attrs: {
          id,
          type: 'search',
          placeholder: text(config.placeholder, translate(this.$el, 'search')),
          value: initial,
          'aria-label': text(config.label, translate(this.$el, 'search')),
        },
        on: {
          input: (event) => {
            const value = (event.target as HTMLInputElement).value;
            clear.hidden = value.length === 0;
            changeValue(this, value);
          },
        },
      });
      clear = h(
        'button',
        {
          className: 'wpl-icon-btn wpl-icon-btn-sm wpl-btn-ghost wpl-search-clear',
          attrs: {
            type: 'button',
            'aria-label': translate(this.$el, 'clear'),
            hidden: initial ? undefined : true,
          },
          on: {
            click: () => {
              input.value = '';
              clear.hidden = true;
              changeValue(this, '');
            },
          },
        },
        [svgIcon('close')],
      );
      const wrap = h('div', { className: 'wpl-search' }, [
        h('div', { className: 'wpl-search-control' }, [
          svgIcon('search', 'wpl-icon wpl-search-icon'),
          input,
          clear,
        ]),
      ]);
      this.$el.replaceChildren(wrap);
    },
  };
}

interface Option {
  value: string;
  label: string;
  disabled?: boolean;
}

export function Select(config: Config = {}) {
  return {
    init(this: Magic) {
      const id = uid('select');
      const options = list<Option>(config.options);
      const select = h(
        'select',
        {
          className: selectClassName({ size: controlSize(config.size) }),
          attrs: {
            id,
            name: text(config.name) || undefined,
            disabled: flag(config.disabled) || undefined,
          },
          on: { change: (event) => changeValue(this, (event.target as HTMLSelectElement).value) },
        },
        options.map((option) =>
          h('option', {
            text: option.label,
            attrs: {
              value: option.value,
              disabled: option.disabled || undefined,
              selected: option.value === config.value || undefined,
            },
          }),
        ),
      );
      this.$el.replaceChildren(field(text(config.label), select));
    },
  };
}

export function Checkbox(config: Config = {}) {
  return {
    init(this: Magic) {
      const id = uid('check');
      let checked = flag(config.checked);
      const input = h('input', {
        attrs: {
          id,
          type: 'checkbox',
          name: text(config.name) || undefined,
          checked: checked || undefined,
          disabled: flag(config.disabled) || undefined,
        },
        on: {
          change: (event) => {
            checked = (event.target as HTMLInputElement).checked;
            emit(this, 'wpl-change', { checked });
          },
        },
      });
      this.$el.replaceChildren(
        h('label', { className: 'wpl-check' }, [input, text(config.label, 'Checkbox')]),
      );
    },
  };
}

export function Switch(config: Config = {}) {
  return {
    init(this: Magic) {
      let checked = flag(config.checked);
      const button = h(
        'button',
        {
          className: 'wpl-switch',
          attrs: {
            type: 'button',
            role: 'switch',
            'aria-checked': String(checked),
            disabled: flag(config.disabled) || undefined,
          },
          on: {
            click: () => {
              if (flag(config.disabled)) return;
              checked = !checked;
              button.setAttribute('aria-checked', String(checked));
              emit(this, 'wpl-change', { checked });
            },
          },
        },
        [
          h('span', { className: 'wpl-switch-control', attrs: { 'aria-hidden': 'true' } }),
          text(config.label, 'Switch'),
        ],
      );
      this.$el.replaceChildren(button);
    },
  };
}

export function RadioGroup(config: Config = {}) {
  return {
    init(this: Magic) {
      const name = text(config.name) || uid('radio');
      let value = text(config.value);
      const options = list<Option>(config.options);
      const group = h(
        'div',
        { attrs: { role: 'radiogroup', 'aria-label': text(config.label, 'Options') } },
        [
          text(config.label)
            ? h('span', { className: 'wpl-label', text: text(config.label) })
            : null,
          ...options.map((option) => {
            const input = h('input', {
              attrs: {
                type: 'radio',
                name,
                value: option.value,
                checked: option.value === value || undefined,
                disabled: option.disabled || undefined,
              },
              on: {
                change: () => {
                  value = option.value;
                  emit(this, 'wpl-change', { value });
                },
              },
            });
            return h('label', { className: 'wpl-radio' }, [input, option.label]);
          }),
        ],
      );
      this.$el.replaceChildren(group);
    },
  };
}

export function Slider(config: Config = {}) {
  return {
    init(this: Magic) {
      const id = uid('slider');
      const min = num(config.min, 0);
      const max = num(config.max, 100);
      const step = num(config.step, 1);
      let value = num(config.value, min);
      const output = h('output', {
        attrs: { for: id },
        text: formatNumber(value, localeOf(this.$el)),
      });
      const input = h('input', {
        className: 'wpl-slider',
        attrs: {
          id,
          type: 'range',
          min,
          max,
          step,
          value,
          'aria-valuetext': formatNumber(value, localeOf(this.$el)),
        },
        on: {
          input: (event) => {
            value = Number((event.target as HTMLInputElement).value);
            const formatted = formatNumber(value, localeOf(this.$el));
            output.textContent = formatted;
            input.setAttribute('aria-valuetext', formatted);
            emit(this, 'wpl-change', { value });
          },
        },
      });
      this.$el.replaceChildren(
        h('div', { className: 'wpl-field' }, [
          h('div', { className: 'wpl-flex wpl-flex-between' }, [
            h('label', {
              className: 'wpl-label',
              text: text(config.label, 'Value'),
              attrs: { for: id },
            }),
            output,
          ]),
          input,
        ]),
      );
    },
  };
}

export function RangeSlider(config: Config = {}) {
  return {
    init(this: Magic) {
      const min = num(config.min, 0);
      const max = num(config.max, 100);
      const step = num(config.step, 1);
      const bounds = rangeBounds(min, max, step);
      let current = normalizeRange(
        num(config.start, bounds.min),
        num(config.end, bounds.max),
        bounds,
      );
      const label = text(config.label, 'Range');
      const output = h('output', { text: readout(current) });
      const fill = h('span', { className: 'wpl-range-fill' });
      const start = rangeInput(this, 'start');
      const end = rangeInput(this, 'end');
      const root = h('div', { className: 'wpl-field' }, [
        h('div', { className: 'wpl-flex wpl-flex-between' }, [
          h('span', { className: 'wpl-label', text: label }),
          output,
        ]),
        h(
          'div',
          {
            className: 'wpl-range',
            attrs: { 'data-disabled': flag(config.disabled) ? 'true' : undefined },
          },
          [h('span', { className: 'wpl-range-track' }, [fill]), start, end],
        ),
      ]);
      const paint = () => {
        const next = rangeFill(current, bounds);
        fill.style.setProperty('--wpl-range-start', next.start);
        fill.style.setProperty('--wpl-range-size', next.size);
        start.value = String(current.start);
        end.value = String(current.end);
        output.textContent = readout(current);
      };
      function readout(range: NumberRange): string {
        const locale = localeOf(root);
        return `${formatNumber(range.start, locale)} – ${formatNumber(range.end, locale)}`;
      }
      function rangeInput(magic: Magic, edge: 'start' | 'end'): HTMLInputElement {
        return h('input', {
          className: 'wpl-range-input',
          attrs: {
            type: 'range',
            min,
            max,
            step,
            disabled: flag(config.disabled) || undefined,
            'data-edge': edge,
            'aria-label': `${label} ${edge}`,
          },
          on: {
            input: (event) => {
              const next = Number((event.target as HTMLInputElement).value);
              current = clampRangeEdge(edge, next, current, bounds);
              paint();
              emit(magic, 'wpl-change', { start: current.start, end: current.end });
            },
          },
        });
      }
      paint();
      this.$el.replaceChildren(root);
    },
  };
}

export function PasswordField(config: Config = {}) {
  return {
    init(this: Magic) {
      const id = uid('password');
      let visible = false;
      const input = h('input', {
        className: 'wpl-input',
        attrs: {
          id,
          type: 'password',
          name: text(config.name) || undefined,
          autocomplete: 'current-password',
        },
        on: { input: (event) => changeValue(this, (event.target as HTMLInputElement).value) },
      });
      const toggle = h(
        'button',
        {
          className: 'wpl-btn wpl-btn-ghost wpl-btn-sm',
          attrs: { type: 'button', 'aria-pressed': 'false', 'aria-label': 'Show password' },
          on: {
            click: () => {
              visible = !visible;
              input.type = visible ? 'text' : 'password';
              toggle.setAttribute('aria-pressed', String(visible));
              toggle.setAttribute('aria-label', visible ? 'Hide password' : 'Show password');
              toggle.textContent = visible ? 'Hide' : 'Show';
            },
          },
        },
        ['Show'],
      );
      this.$el.replaceChildren(
        field(text(config.label, 'Password'), h('div', { className: 'wpl-flex' }, [input, toggle])),
      );
    },
  };
}

export function OtpField(config: Config = {}) {
  return {
    init(this: Magic) {
      const length = otpLength(num(config.length, 6));
      const numeric = config.numeric !== false;
      let value = text(config.value);
      const cells: HTMLInputElement[] = [];
      const paint = () => {
        const parts = otpCells(value, length, numeric);
        cells.forEach((cell, index) => {
          cell.value = parts[index] ?? '';
        });
      };
      for (let index = 0; index < length; index += 1) {
        const cell = h('input', {
          className: 'wpl-input wpl-otp-cell',
          attrs: {
            type: numeric ? 'text' : 'text',
            inputmode: numeric ? 'numeric' : 'text',
            maxlength: 1,
            'aria-label': `${text(config.label, 'Code')} ${index + 1}`,
          },
          on: {
            input: (event) => {
              const incoming = (event.target as HTMLInputElement).value;
              const next = otpApply(value, length, numeric, index, incoming);
              value = next.value;
              paint();
              cells[next.focus]?.focus();
              emit(this, 'wpl-change', { value });
            },
            keydown: (event) => {
              if ((event as KeyboardEvent).key !== 'Backspace') return;
              event.preventDefault();
              const next = otpDelete(value, length, numeric, index);
              value = next.value;
              paint();
              cells[next.focus]?.focus();
              emit(this, 'wpl-change', { value });
            },
          },
        });
        cells.push(cell);
      }
      paint();
      this.$el.replaceChildren(
        h('div', { className: fieldClassName() }, [
          h('span', { className: 'wpl-label', text: text(config.label, 'Code') }),
          h('div', { className: 'wpl-otp' }, cells),
        ]),
      );
    },
  };
}

export function Rating(config: Config = {}) {
  return {
    init(this: Magic) {
      const max = num(config.max, 5);
      let value = num(config.value, 0);
      const name = text(config.name) || uid('rating');
      const options: HTMLLabelElement[] = [];
      const paint = () => {
        options.forEach((option, index) => {
          const icon = option.querySelector('.wpl-rating-icon');
          icon?.classList.toggle('is-on', index < value);
        });
      };
      for (let index = 1; index <= max; index += 1) {
        const input = h('input', {
          attrs: { type: 'radio', name, value: index, checked: index === value || undefined },
          on: {
            change: () => {
              value = index;
              paint();
              emit(this, 'wpl-change', { value });
            },
          },
        });
        options.push(
          h('label', { className: 'wpl-rating-option' }, [
            input,
            h('span', { className: 'wpl-rating-icon', attrs: { 'aria-hidden': 'true' } }, [
              svgIcon('star'),
            ]),
            h('span', { className: 'wpl-sr-only', text: String(index) }),
          ]),
        );
      }
      paint();
      this.$el.replaceChildren(
        h(
          'div',
          {
            className: 'wpl-rating',
            attrs: { role: 'radiogroup', 'aria-label': text(config.label, 'Rating') },
          },
          options,
        ),
      );
    },
  };
}

export function NumberField(config: Config = {}) {
  return {
    init(this: Magic) {
      const bounds = rangeBounds(num(config.min, 0), num(config.max, 100), num(config.step, 1));
      let value = numberFieldCommit(String(num(config.value, bounds.min)), bounds, bounds.min);
      let draft = numberFieldText(value, bounds);
      let focused = false;
      const input = h('input', {
        className: 'wpl-input',
        attrs: {
          id: uid('number'),
          type: 'number',
          name: text(config.name) || undefined,
          inputmode: bounds.step < 1 ? 'decimal' : 'numeric',
          min: bounds.min,
          max: bounds.max,
          step: bounds.step,
          value: draft,
        },
      });
      const down = h('button', { className: 'wpl-number-step', attrs: { type: 'button' } }, [
        svgIcon('minus'),
      ]);
      const up = h('button', { className: 'wpl-number-step', attrs: { type: 'button' } }, [
        svgIcon('plus'),
      ]);
      const paint = () => {
        const shown = focused ? draft : numberFieldText(value, bounds);
        const parsed = numberFieldDraftValue(shown, bounds) ?? value;
        input.value = shown;
        down.disabled = flag(config.disabled) || parsed <= bounds.min;
        up.disabled = flag(config.disabled) || parsed >= bounds.max;
        down.setAttribute('aria-label', translate(this.$el, 'decrease'));
        up.setAttribute('aria-label', translate(this.$el, 'increase'));
        input.disabled = flag(config.disabled);
      };
      const commit = (next: number) => {
        value = numberFieldCommit(String(next), bounds, bounds.min);
        draft = numberFieldText(value, bounds);
        paint();
        emit(this, 'wpl-change', { value });
      };
      down.addEventListener('click', () =>
        commit(numberFieldStep(numberFieldDraftValue(input.value, bounds) ?? value, -1, bounds)),
      );
      up.addEventListener('click', () =>
        commit(numberFieldStep(numberFieldDraftValue(input.value, bounds) ?? value, 1, bounds)),
      );
      input.addEventListener('focus', () => {
        focused = true;
        draft = numberFieldText(value, bounds);
        paint();
      });
      input.addEventListener('blur', () => {
        focused = false;
        commit(numberFieldCommit(input.value, bounds, value));
      });
      input.addEventListener('input', () => {
        draft = input.value;
        const parsed = numberFieldDraftValue(input.value, bounds);
        if (parsed === null) {
          paint();
          return;
        }
        value = parsed;
        paint();
        emit(this, 'wpl-change', { value });
      });
      input.addEventListener('wheel', () => input.blur());
      paint();
      this.$el.replaceChildren(
        h('div', { className: 'wpl-field' }, [
          h('label', {
            className: 'wpl-label',
            attrs: { for: input.id },
            text: labelOf(this, config, 'Number'),
          }),
          h('div', { className: 'wpl-number' }, [down, input, up]),
        ]),
      );
    },
  };
}

export function Label(config: Config = {}) {
  return {
    init(this: Magic) {
      this.$el.replaceChildren(
        h(
          'label',
          {
            className: 'wpl-label',
            text: labelOf(this, config, 'Label'),
            attrs: { for: text(config.for) || undefined },
          },
          [
            flag(config.required)
              ? h('span', {
                  className: 'wpl-required',
                  attrs: { 'aria-hidden': 'true' },
                  text: '*',
                })
              : null,
          ],
        ),
      );
    },
  };
}

export function FormField(config: Config = {}) {
  return {
    init(this: Magic) {
      this.$el.classList.add('wpl-field');
      if (flag(config.invalid)) this.$el.classList.add('wpl-field-invalid');
      const label = text(config.label);
      if (label && !this.$el.querySelector('.wpl-label')) {
        this.$el.prepend(
          h('label', {
            className: 'wpl-label',
            text: label,
            attrs: { for: text(config.for) || undefined },
          }),
        );
      }
      if (text(config.hint) && !this.$el.querySelector('.wpl-field-hint')) {
        this.$el.append(h('p', { className: 'wpl-field-hint', text: text(config.hint) }));
      }
      if (text(config.error) && !this.$el.querySelector('.wpl-field-error')) {
        this.$el.append(
          h('p', {
            className: 'wpl-field-error',
            attrs: { role: 'alert' },
            text: text(config.error),
          }),
        );
      }
    },
  };
}

export function FormMessage(config: Config = {}) {
  return {
    init(this: Magic) {
      const tone = config.tone === 'error' ? 'error' : 'hint';
      this.$el.replaceChildren(
        h('p', {
          className: tone === 'error' ? 'wpl-field-error' : 'wpl-field-hint',
          text: labelOf(this, config, tone === 'error' ? 'Error' : 'Hint'),
          attrs: { role: tone === 'error' ? 'alert' : undefined, id: text(config.id) || undefined },
        }),
      );
    },
  };
}

export function ValidationMessage(config: Config = {}) {
  return FormMessage({ ...config, tone: 'error' });
}

interface ToggleOption {
  value?: string;
  label?: string;
  disabled?: boolean;
}

export function ToggleGroup(config: Config = {}) {
  return {
    init(this: Magic) {
      const options = list<ToggleOption>(config.options).map((option) => ({
        value: text(option.value),
        label: text(option.label, text(option.value)),
        disabled: Boolean(option.disabled),
      }));
      let value = text(config.value, text(config.defaultValue));
      const label = text(config.label, 'Choices');
      const hideLabel = flag(config.hideLabel);
      const disabled = flag(config.disabled);
      const labelId = uid('toggle');
      const group = h('div', {
        className: 'wpl-toggle',
        attrs: {
          role: 'radiogroup',
          'aria-label': hideLabel ? label : undefined,
          'aria-labelledby': hideLabel ? undefined : labelId,
        },
      });
      const paint = () => {
        const selected = options.findIndex((option) => option.value === value);
        const firstEnabled = options.findIndex((option) => !option.disabled);
        const buttons: HTMLElement[] = options.map((option, index) => {
          const checked = option.value === value;
          const tabbable =
            !option.disabled && !disabled && (checked || (selected < 0 && index === firstEnabled));
          return h(
            'button',
            {
              className: 'wpl-toggle-item',
              attrs: {
                type: 'button',
                role: 'radio',
                'aria-checked': String(checked),
                disabled: disabled || option.disabled || undefined,
                tabindex: tabbable ? '0' : '-1',
              },
              on: {
                click: () => choose(option.value),
                keydown: (event) => onKey(event as KeyboardEvent),
              },
            },
            [option.label],
          );
        });
        if (text(config.name)) {
          buttons.push(h('input', { attrs: { type: 'hidden', name: text(config.name), value } }));
        }
        group.replaceChildren(...buttons);
      };
      const choose = (next: string) => {
        if (disabled) return;
        value = next;
        paint();
        emit(this, 'wpl-change', { value });
      };
      const onKey = (event: KeyboardEvent) => {
        const selected = options.findIndex((option) => option.value === value);
        const next = toggleGroupMove(
          options,
          selected,
          event.key,
          readingDirection(event.currentTarget instanceof HTMLElement ? event.currentTarget : null),
        );
        if (next === null) return;
        const option = options[next];
        if (!option) return;
        event.preventDefault();
        choose(option.value);
        queueMicrotask(() =>
          group.querySelectorAll<HTMLButtonElement>('[role="radio"]')[next]?.focus(),
        );
      };
      paint();
      if (hideLabel) {
        this.$el.replaceChildren(group);
        return;
      }
      this.$el.replaceChildren(
        h('div', { className: 'wpl-field' }, [
          h('span', { className: 'wpl-label', attrs: { id: labelId }, text: label }),
          group,
        ]),
      );
    },
  };
}
