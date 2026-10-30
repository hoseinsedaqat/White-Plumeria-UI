import {
  buttonClassName,
  buttonGroupClassName,
  clampRangeEdge,
  createId,
  fieldClassName,
  iconButtonClassName,
  inputClassName,
  iconPaths,
  message,
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
  selectClassName,
  textareaClassName,
  type ButtonAppearance,
  type ButtonSize,
  type ButtonVariant,
  type ControlSize,
} from '@white-plumeria/core';
import { bubble, flag, glimmer, list, localeOf, num, str, type Host } from './runtime.ts';

function sizeOf(value: unknown): ControlSize | undefined {
  return value === 'sm' || value === 'md' || value === 'lg' ? value : undefined;
}

function variantOf(value: unknown): ButtonVariant | undefined {
  return typeof value === 'string' ? (value as ButtonVariant) : undefined;
}

export const Button = glimmer(
  `<button type={{this.type}} class={{this.className}} disabled={{this.disabled}} aria-busy={{this.busy}} {{on "click" this.press}}>{{#if this.loading}}<span class="wpl-spinner" aria-hidden="true"></span>{{/if}}{{#if @label}}{{@label}}{{else}}{{yield}}{{/if}}</button>`,
  {
    getters: {
      loading(this: Host) {
        return flag(this.args.loading);
      },
      disabled(this: Host) {
        return flag(this.args.disabled) || flag(this.args.loading);
      },
      busy(this: Host) {
        return flag(this.args.loading) ? 'true' : '';
      },
      type(this: Host) {
        const type = str(this.args.type, 'button');
        return type === 'submit' || type === 'reset' ? type : 'button';
      },
      className(this: Host) {
        return buttonClassName({
          variant: variantOf(this.args.variant),
          size: typeof this.args.size === 'string' ? (this.args.size as ButtonSize) : undefined,
          appearance:
            typeof this.args.appearance === 'string'
              ? (this.args.appearance as ButtonAppearance)
              : undefined,
          loading: flag(this.args.loading),
          block: flag(this.args.block),
          className: str(this.args.className) || undefined,
        });
      },
    },
    methods: {
      press(event) {
        if (flag(this.args.disabled) || flag(this.args.loading)) return;
        bubble(event as Event, 'wpl-click', { variant: str(this.args.variant, 'primary') });
      },
    },
  },
);

export const IconButton = glimmer(
  `<button type="button" class={{this.className}} aria-label={{this.label}} disabled={{this.disabled}} {{on "click" this.press}}>{{yield}}</button>`,
  {
    getters: {
      label: (host) => str(host.args.label, 'Icon button'),
      disabled: (host) => flag(host.args.disabled),
      className(this: Host) {
        return iconButtonClassName({
          variant: variantOf(this.args.variant),
          size: typeof this.args.size === 'string' ? (this.args.size as ButtonSize) : undefined,
          appearance:
            typeof this.args.appearance === 'string'
              ? (this.args.appearance as ButtonAppearance)
              : undefined,
          className: str(this.args.className) || undefined,
        });
      },
    },
    methods: {
      press(event) {
        if (flag(this.args.disabled)) return;
        bubble(event as Event, 'wpl-click', { label: str(this.args.label) });
      },
    },
  },
);

export const ButtonGroup = glimmer(
  `<div class={{this.className}} role="group" aria-label={{@label}}>{{yield}}</div>`,
  {
    getters: {
      className: (host) =>
        buttonGroupClassName(flag(host.args.joined), str(host.args.className) || undefined),
    },
  },
);

export const Input = glimmer(
  `<div class={{this.fieldClass}}><label class="wpl-label" for={{this.fieldId}}>{{this.label}}</label><input id={{this.fieldId}} class={{this.controlClass}} type={{this.inputType}} value={{this.value}} placeholder={{@placeholder}} name={{@name}} disabled={{this.disabled}} aria-invalid={{this.invalid}} {{on "input" this.commit}} />{{#if @hint}}<p class="wpl-field-hint">{{@hint}}</p>{{/if}}{{#if @error}}<p class="wpl-field-error" role="alert">{{@error}}</p>{{/if}}</div>`,
  {
    state: (args) => ({ value: str(args.value), fieldId: createId('input') }),
    getters: {
      label: (host) => str(host.args.label, 'Input'),
      fieldId: (host) => str(host.state.fieldId),
      value: (host) => str(host.state.value, str(host.args.value)),
      disabled: (host) => flag(host.args.disabled),
      invalid: (host) => (flag(host.args.invalid) || str(host.args.error) ? 'true' : ''),
      inputType: (host) => str(host.args.type, 'text'),
      fieldClass: (host) =>
        fieldClassName(flag(host.args.invalid) || Boolean(str(host.args.error))),
      controlClass: (host) => inputClassName({ size: sizeOf(host.args.size) }),
    },
    methods: {
      commit(event) {
        const value =
          (event as Event).target instanceof HTMLInputElement
            ? (event as Event & { target: HTMLInputElement }).target.value
            : '';
        this.state.value = value;
        bubble(event as Event, 'wpl-change', { value });
      },
    },
  },
);

export const Textarea = glimmer(
  `<div class={{this.fieldClass}}><label class="wpl-label" for={{this.fieldId}}>{{this.label}}</label><textarea id={{this.fieldId}} class={{this.controlClass}} placeholder={{@placeholder}} name={{@name}} rows={{this.rows}} disabled={{this.disabled}} {{on "input" this.commit}}>{{this.value}}</textarea>{{#if @hint}}<p class="wpl-field-hint">{{@hint}}</p>{{/if}}</div>`,
  {
    state: (args) => ({ value: str(args.value), fieldId: createId('textarea') }),
    getters: {
      label: (host) => str(host.args.label, 'Textarea'),
      fieldId: (host) => str(host.state.fieldId),
      value: (host) => str(host.state.value, str(host.args.value)),
      disabled: (host) => flag(host.args.disabled),
      rows: (host) => String(num(host.args.rows, 4)),
      fieldClass: (host) => fieldClassName(flag(host.args.invalid)),
      controlClass: (host) => textareaClassName({ size: sizeOf(host.args.size) }),
    },
    methods: {
      commit(event) {
        const value =
          event instanceof Event && event.target instanceof HTMLTextAreaElement
            ? event.target.value
            : '';
        this.state.value = value;
        bubble(event as Event, 'wpl-change', { value });
      },
    },
  },
);

export const Select = glimmer(
  `<div class={{this.fieldClass}}><label class="wpl-label" for={{this.fieldId}}>{{this.label}}</label><select id={{this.fieldId}} class={{this.controlClass}} name={{@name}} disabled={{this.disabled}} {{on "change" this.commit}}>{{#each this.options as |option|}}<option value={{option.value}} selected={{option.selected}}>{{option.label}}</option>{{/each}}</select></div>`,
  {
    state: (args) => ({ value: str(args.value), fieldId: createId('select') }),
    getters: {
      label: (host) => str(host.args.label, 'Select'),
      fieldId: (host) => str(host.state.fieldId),
      disabled: (host) => flag(host.args.disabled),
      fieldClass: () => fieldClassName(),
      controlClass: (host) => selectClassName({ size: sizeOf(host.args.size) }),
      options(this: Host) {
        const current = str(this.state.value, str(this.args.value));
        return list<{ value?: string; label?: string; id?: string }>(this.args.options).map(
          (option) => {
            const value = str(option.value, str(option.id));
            return { value, label: str(option.label, value), selected: value === current };
          },
        );
      },
    },
    methods: {
      commit(event) {
        const value =
          event instanceof Event && event.target instanceof HTMLSelectElement
            ? event.target.value
            : '';
        this.state.value = value;
        bubble(event as Event, 'wpl-change', { value });
      },
    },
  },
);

export const Checkbox = glimmer(
  `<label class="wpl-check"><input type="checkbox" class="wpl-check-input" checked={{this.checked}} name={{@name}} disabled={{this.disabled}} {{on "change" this.commit}} /><span>{{this.label}}</span></label>`,
  {
    state: (args) => ({ checked: flag(args.checked) }),
    getters: {
      label: (host) => str(host.args.label, 'Checkbox'),
      checked: (host) => Boolean(host.state.checked),
      disabled: (host) => flag(host.args.disabled),
    },
    methods: {
      commit(event) {
        const checked =
          event instanceof Event && event.target instanceof HTMLInputElement
            ? event.target.checked
            : !this.state.checked;
        this.state.checked = checked;
        bubble(event as Event, 'wpl-change', { checked });
      },
    },
  },
);

export const Switch = glimmer(
  `<label class="wpl-switch"><input type="checkbox" role="switch" class="wpl-switch-input" checked={{this.checked}} disabled={{this.disabled}} {{on "change" this.commit}} /><span class="wpl-switch-control" aria-hidden="true"></span><span>{{this.label}}</span></label>`,
  {
    state: (args) => ({ checked: flag(args.checked) }),
    getters: {
      label: (host) => str(host.args.label, 'Switch'),
      checked: (host) => Boolean(host.state.checked),
      disabled: (host) => flag(host.args.disabled),
    },
    methods: {
      commit(event) {
        const checked =
          event instanceof Event && event.target instanceof HTMLInputElement
            ? event.target.checked
            : !this.state.checked;
        this.state.checked = checked;
        bubble(event as Event, 'wpl-change', { checked });
      },
    },
  },
);

export const RadioGroup = glimmer(
  `<div class="wpl-field" role="radiogroup" aria-label={{this.label}}><span class="wpl-label">{{this.label}}</span>{{#each this.options as |option|}}<label class="wpl-radio"><input type="radio" name={{this.group}} value={{option.value}} checked={{option.checked}} disabled={{this.disabled}} {{on "change" this.commit}} /><span>{{option.label}}</span></label>{{/each}}</div>`,
  {
    state: (args) => ({ value: str(args.value), group: str(args.name, createId('radio')) }),
    getters: {
      label: (host) => str(host.args.label, 'Options'),
      group: (host) => str(host.state.group),
      disabled: (host) => flag(host.args.disabled),
      options(this: Host) {
        const current = str(this.state.value, str(this.args.value));
        return list<{ value?: string; label?: string }>(this.args.options).map((option) => ({
          value: str(option.value),
          label: str(option.label, str(option.value)),
          checked: str(option.value) === current,
        }));
      },
    },
    methods: {
      commit(event) {
        const value =
          event instanceof Event && event.target instanceof HTMLInputElement
            ? event.target.value
            : '';
        this.state.value = value;
        bubble(event as Event, 'wpl-change', { value });
      },
    },
  },
);

export const Slider = glimmer(
  `<div class="wpl-field"><div class="wpl-flex wpl-flex-between"><label class="wpl-label" for={{this.fieldId}}>{{this.label}}</label><output for={{this.fieldId}}>{{this.value}}</output></div><input id={{this.fieldId}} class="wpl-slider" type="range" min={{this.min}} max={{this.max}} step={{this.step}} value={{this.value}} disabled={{this.disabled}} {{on "input" this.slide}} /></div>`,
  {
    state: (args) => ({ value: num(args.value, num(args.min, 0)), fieldId: createId('slider') }),
    getters: {
      label: (host) => str(host.args.label, 'Value'),
      fieldId: (host) => str(host.state.fieldId),
      min: (host) => String(num(host.args.min, 0)),
      max: (host) => String(num(host.args.max, 100)),
      step: (host) => String(num(host.args.step, 1)),
      value: (host) => num(host.state.value, num(host.args.value, 0)),
      disabled: (host) => flag(host.args.disabled),
    },
    methods: {
      slide(event) {
        const value =
          event instanceof Event && event.target instanceof HTMLInputElement
            ? Number(event.target.value)
            : num(this.state.value, 0);
        this.state.value = value;
        bubble(event as Event, 'wpl-change', { value });
      },
    },
  },
);

export const RangeSlider = glimmer(
  `<div class="wpl-field"><div class="wpl-flex wpl-flex-between"><span class="wpl-label">{{this.label}}</span><output>{{this.start}} – {{this.end}}</output></div><div class="wpl-range"><span class="wpl-range-track"><span class="wpl-range-fill" style={{this.fillStyle}}></span></span><input class="wpl-range-input" type="range" min={{this.min}} max={{this.max}} step={{this.step}} value={{this.start}} aria-label={{this.startLabel}} {{on "input" this.moveStart}} /><input class="wpl-range-input" type="range" min={{this.min}} max={{this.max}} step={{this.step}} value={{this.end}} aria-label={{this.endLabel}} {{on "input" this.moveEnd}} /></div></div>`,
  {
    state: (args) => {
      const bounds = rangeBounds(num(args.min, 0), num(args.max, 100), num(args.step, 1));
      const next = normalizeRange(num(args.start, bounds.min), num(args.end, bounds.max), bounds);
      return { start: next.start, end: next.end };
    },
    getters: {
      label: (host) => str(host.args.label, 'Range'),
      min: (host) => String(num(host.args.min, 0)),
      max: (host) => String(num(host.args.max, 100)),
      step: (host) => String(num(host.args.step, 1)),
      start: (host) => num(host.state.start, 0),
      end: (host) => num(host.state.end, 0),
      startLabel: (host) => `${str(host.args.label, 'Range')} start`,
      endLabel: (host) => `${str(host.args.label, 'Range')} end`,
      fillStyle(this: Host) {
        const bounds = rangeBounds(
          num(this.args.min, 0),
          num(this.args.max, 100),
          num(this.args.step, 1),
        );
        const fill = rangeFill(
          { start: num(this.state.start, bounds.min), end: num(this.state.end, bounds.max) },
          bounds,
        );
        return `--wpl-range-start:${fill.start};--wpl-range-size:${fill.size}`;
      },
    },
    methods: {
      moveStart(event) {
        this.move('start', event as Event);
      },
      moveEnd(event) {
        this.move('end', event as Event);
      },
      move(edge, event) {
        const input = (event as Event).target;
        const next = input instanceof HTMLInputElement ? Number(input.value) : 0;
        const bounds = rangeBounds(
          num(this.args.min, 0),
          num(this.args.max, 100),
          num(this.args.step, 1),
        );
        const ordered = clampRangeEdge(
          edge === 'end' ? 'end' : 'start',
          next,
          { start: num(this.state.start, bounds.min), end: num(this.state.end, bounds.max) },
          bounds,
        );
        this.state.start = ordered.start;
        this.state.end = ordered.end;
        bubble(event as Event, 'wpl-change', ordered);
      },
    },
  },
);

export const Label = glimmer(
  `<label class="wpl-label" for={{@for}}>{{#if @text}}{{@text}}{{else}}{{yield}}{{/if}}{{#if this.required}}<span class="wpl-required" aria-hidden="true">*</span>{{/if}}</label>`,
  { getters: { required: (host) => flag(host.args.required) } },
);

export const FormField = glimmer(
  `<div class={{this.className}}>{{#if @label}}<label class="wpl-label" for={{@for}}>{{@label}}</label>{{/if}}{{yield}}{{#if @hint}}<p class="wpl-field-hint">{{@hint}}</p>{{/if}}{{#if @error}}<p class="wpl-field-error" role="alert">{{@error}}</p>{{/if}}</div>`,
  {
    getters: {
      className: (host) => fieldClassName(flag(host.args.invalid) || Boolean(str(host.args.error))),
    },
  },
);

export const FormMessage = glimmer(
  `<p class={{this.className}} role={{this.role}}>{{#if @text}}{{@text}}{{else}}{{yield}}{{/if}}</p>`,
  {
    getters: {
      className: (host) => (str(host.args.tone) === 'error' ? 'wpl-field-error' : 'wpl-field-hint'),
      role: (host) => (str(host.args.tone) === 'error' ? 'alert' : 'status'),
    },
  },
);

export const ValidationMessage = glimmer(
  `<p class="wpl-field-error" role="alert">{{#if @text}}{{@text}}{{else}}{{yield}}{{/if}}</p>`,
);

export const SearchInput = glimmer(
  `<div class="wpl-search"><label class="wpl-sr-only" for={{this.fieldId}}>{{this.label}}</label><div class="wpl-search-control"><input id={{this.fieldId}} class="wpl-input" type="search" value={{this.value}} placeholder={{this.placeholder}} aria-label={{this.label}} {{on "input" this.commit}} /></div></div>`,
  {
    state: (args) => ({ value: str(args.value), fieldId: createId('search') }),
    getters: {
      label: (host) => str(host.args.label, 'Search'),
      placeholder: (host) => str(host.args.placeholder, 'Search'),
      fieldId: (host) => str(host.state.fieldId),
      value: (host) => str(host.state.value),
    },
    methods: {
      commit(event) {
        const value =
          event instanceof Event && event.target instanceof HTMLInputElement
            ? event.target.value
            : '';
        this.state.value = value;
        bubble(event as Event, 'wpl-change', { value });
      },
    },
  },
);

export const PasswordField = glimmer(
  `<div class="wpl-field"><label class="wpl-label" for={{this.fieldId}}>{{this.label}}</label><div class="wpl-flex"><input id={{this.fieldId}} class="wpl-input" type={{this.inputType}} value={{this.value}} autocomplete="current-password" {{on "input" this.commit}} /><button type="button" class="wpl-btn wpl-btn-ghost wpl-btn-sm" aria-pressed={{this.pressed}} aria-label={{this.toggleLabel}} {{on "click" this.toggle}}>{{this.toggleLabel}}</button></div></div>`,
  {
    state: (args) => ({ value: str(args.value), visible: false, fieldId: createId('password') }),
    getters: {
      label: (host) => str(host.args.label, 'Password'),
      fieldId: (host) => str(host.state.fieldId),
      value: (host) => str(host.state.value),
      inputType: (host) => (host.state.visible ? 'text' : 'password'),
      pressed: (host) => (host.state.visible ? 'true' : 'false'),
      toggleLabel(this: Host) {
        const element = typeof document === 'undefined' ? null : document.body;
        return message(localeOf(element), this.state.visible ? 'hidePassword' : 'showPassword');
      },
    },
    methods: {
      commit(event) {
        const value =
          event instanceof Event && event.target instanceof HTMLInputElement
            ? event.target.value
            : '';
        this.state.value = value;
        bubble(event as Event, 'wpl-change', { value });
      },
      toggle(event) {
        this.state.visible = !this.state.visible;
        (event as Event).preventDefault();
      },
    },
  },
);

export const OtpField = glimmer(
  `<div class="wpl-field"><span class="wpl-label" id={{this.labelId}}>{{this.label}}</span><div class="wpl-otp" role="group" aria-labelledby={{this.labelId}}>{{#each this.cells as |cell|}}<input class="wpl-input wpl-otp-cell" inputmode={{this.mode}} maxlength="1" value={{cell.value}} aria-label={{cell.label}} {{on "input" (fn this.type cell.index)}} {{on "keydown" (fn this.key cell.index)}} />{{/each}}</div>{{#if @name}}<input type="hidden" name={{@name}} value={{this.value}} />{{/if}}</div>`,
  {
    state: (args) => ({ value: str(args.value), labelId: createId('otp') }),
    getters: {
      label: (host) => str(host.args.label, 'Code'),
      labelId: (host) => str(host.state.labelId),
      value: (host) => str(host.state.value),
      mode: (host) => (host.args.numeric === false ? 'text' : 'numeric'),
      cells(this: Host) {
        const length = otpLength(num(this.args.length, 6));
        const numeric = this.args.numeric !== false;
        return otpCells(str(this.state.value), length, numeric).map((value, index) => ({
          index,
          value,
          label: `${str(this.args.label, 'Code')} ${index + 1}`,
        }));
      },
    },
    methods: {
      type(index, event) {
        const input = (event as Event).target;
        const text = input instanceof HTMLInputElement ? input.value : '';
        const length = otpLength(num(this.args.length, 6));
        const numeric = this.args.numeric !== false;
        const next = otpApply(str(this.state.value), length, numeric, Number(index), text);
        this.state.value = next.value;
        bubble(event as Event, 'wpl-change', { value: next.value });
      },
      key(index, event) {
        const keyEvent = event as KeyboardEvent;
        if (keyEvent.key !== 'Backspace') return;
        const length = otpLength(num(this.args.length, 6));
        const numeric = this.args.numeric !== false;
        const next = otpDelete(str(this.state.value), length, numeric, Number(index));
        this.state.value = next.value;
        bubble(keyEvent, 'wpl-change', { value: next.value });
      },
    },
  },
);

export const Rating = glimmer(
  `<div class="wpl-rating" role="radiogroup" aria-label={{this.label}}>{{#each this.options as |option|}}<label class="wpl-rating-option"><input type="radio" name={{this.group}} value={{option.value}} checked={{option.checked}} disabled={{this.readOnly}} {{on "change" this.commit}} /><span class="wpl-rating-icon" aria-hidden="true">★</span><span class="wpl-sr-only">{{option.value}}</span></label>{{/each}}</div>`,
  {
    state: (args) => ({ value: num(args.value, 0), group: str(args.name, createId('rating')) }),
    getters: {
      label: (host) => str(host.args.label, 'Rating'),
      group: (host) => str(host.state.group),
      readOnly: (host) => flag(host.args.readOnly) || flag(host.args.disabled),
      options(this: Host) {
        const max = Math.min(10, Math.max(1, num(this.args.max, 5)));
        const current = num(this.state.value, num(this.args.value, 0));
        return Array.from({ length: max }, (_, index) => {
          const value = index + 1;
          return { value, checked: value === current };
        });
      },
    },
    methods: {
      commit(event) {
        if (flag(this.args.readOnly)) return;
        const value =
          event instanceof Event && event.target instanceof HTMLInputElement
            ? Number(event.target.value)
            : 0;
        this.state.value = value;
        bubble(event as Event, 'wpl-change', { value });
      },
    },
  },
);

const minusPath = iconPaths.minus;
const plusPath = iconPaths.plus;

export const NumberField = glimmer(
  `<div class="wpl-field"><label class="wpl-label" for={{this.fieldId}}>{{this.label}}</label><div class="wpl-number"><button type="button" class="wpl-number-step" aria-label={{this.decreaseLabel}} disabled={{this.downDisabled}} {{on "click" this.down}}><svg class="wpl-icon" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="${minusPath}"></path></svg></button><input id={{this.fieldId}} class="wpl-input" type="number" name={{this.name}} min={{this.min}} max={{this.max}} step={{this.step}} value={{this.shown}} disabled={{this.disabled}} {{on "focus" this.focus}} {{on "blur" this.blur}} {{on "input" this.type}} {{on "wheel" this.wheel}} /><button type="button" class="wpl-number-step" aria-label={{this.increaseLabel}} disabled={{this.upDisabled}} {{on "click" this.up}}><svg class="wpl-icon" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="${plusPath}"></path></svg></button></div></div>`,
  {
    state: (args) => {
      const bounds = rangeBounds(num(args.min, 0), num(args.max, 100), num(args.step, 1));
      const value = numberFieldCommit(String(num(args.value, bounds.min)), bounds, bounds.min);
      return {
        value,
        draft: numberFieldText(value, bounds),
        focused: false,
        fieldId: createId('number'),
      };
    },
    getters: {
      label: (host) => str(host.args.label, 'Number'),
      fieldId: (host) => str(host.state.fieldId),
      name: (host) => str(host.args.name),
      disabled: (host) => flag(host.args.disabled),
      min: (host) =>
        rangeBounds(num(host.args.min, 0), num(host.args.max, 100), num(host.args.step, 1)).min,
      max: (host) =>
        rangeBounds(num(host.args.min, 0), num(host.args.max, 100), num(host.args.step, 1)).max,
      step: (host) =>
        rangeBounds(num(host.args.min, 0), num(host.args.max, 100), num(host.args.step, 1)).step,
      shown(this: Host) {
        const bounds = rangeBounds(
          num(this.args.min, 0),
          num(this.args.max, 100),
          num(this.args.step, 1),
        );
        return this.state.focused
          ? str(this.state.draft)
          : numberFieldText(num(this.state.value, bounds.min), bounds);
      },
      decreaseLabel() {
        return message(
          localeOf(typeof document === 'undefined' ? null : document.body),
          'decrease',
        );
      },
      increaseLabel() {
        return message(
          localeOf(typeof document === 'undefined' ? null : document.body),
          'increase',
        );
      },
      downDisabled(this: Host) {
        const bounds = rangeBounds(
          num(this.args.min, 0),
          num(this.args.max, 100),
          num(this.args.step, 1),
        );
        const shown = this.state.focused
          ? str(this.state.draft)
          : numberFieldText(num(this.state.value, bounds.min), bounds);
        const parsed = numberFieldDraftValue(shown, bounds) ?? num(this.state.value, bounds.min);
        return flag(this.args.disabled) || parsed <= bounds.min;
      },
      upDisabled(this: Host) {
        const bounds = rangeBounds(
          num(this.args.min, 0),
          num(this.args.max, 100),
          num(this.args.step, 1),
        );
        const shown = this.state.focused
          ? str(this.state.draft)
          : numberFieldText(num(this.state.value, bounds.min), bounds);
        const parsed = numberFieldDraftValue(shown, bounds) ?? num(this.state.value, bounds.min);
        return flag(this.args.disabled) || parsed >= bounds.max;
      },
    },
    methods: {
      commit(this: Host, next: number, event?: Event) {
        const bounds = rangeBounds(
          num(this.args.min, 0),
          num(this.args.max, 100),
          num(this.args.step, 1),
        );
        const value = numberFieldCommit(String(next), bounds, bounds.min);
        this.state.value = value;
        this.state.draft = numberFieldText(value, bounds);
        if (event) bubble(event, 'wpl-change', { value });
      },
      down(this: Host, event: Event) {
        const bounds = rangeBounds(
          num(this.args.min, 0),
          num(this.args.max, 100),
          num(this.args.step, 1),
        );
        const current =
          numberFieldDraftValue(str(this.state.draft), bounds) ?? num(this.state.value, bounds.min);
        this.commit(numberFieldStep(current, -1, bounds), event);
      },
      up(this: Host, event: Event) {
        const bounds = rangeBounds(
          num(this.args.min, 0),
          num(this.args.max, 100),
          num(this.args.step, 1),
        );
        const current =
          numberFieldDraftValue(str(this.state.draft), bounds) ?? num(this.state.value, bounds.min);
        this.commit(numberFieldStep(current, 1, bounds), event);
      },
      focus(this: Host) {
        const bounds = rangeBounds(
          num(this.args.min, 0),
          num(this.args.max, 100),
          num(this.args.step, 1),
        );
        this.state.focused = true;
        this.state.draft = numberFieldText(num(this.state.value, bounds.min), bounds);
      },
      blur(this: Host, event: Event) {
        const bounds = rangeBounds(
          num(this.args.min, 0),
          num(this.args.max, 100),
          num(this.args.step, 1),
        );
        const raw =
          event.target instanceof HTMLInputElement ? event.target.value : str(this.state.draft);
        this.state.focused = false;
        this.commit(numberFieldCommit(raw, bounds, num(this.state.value, bounds.min)), event);
      },
      type(this: Host, event: Event) {
        const raw = event.target instanceof HTMLInputElement ? event.target.value : '';
        this.state.draft = raw;
        const bounds = rangeBounds(
          num(this.args.min, 0),
          num(this.args.max, 100),
          num(this.args.step, 1),
        );
        const parsed = numberFieldDraftValue(raw, bounds);
        if (parsed === null) return;
        this.state.value = parsed;
        bubble(event, 'wpl-change', { value: parsed });
      },
      wheel(event: Event) {
        if (event.target instanceof HTMLInputElement) event.target.blur();
      },
    },
  },
);

export const FileUpload = glimmer(
  `<div class="wpl-file"><label class="wpl-file-drop">{{this.label}}<input class="wpl-file-input" type="file" accept={{@accept}} {{on "change" this.take}} /></label>{{#if this.names}}<ul class="wpl-file-list">{{#each this.names as |name|}}<li class="wpl-file-item">{{name}}</li>{{/each}}</ul>{{/if}}{{#if this.reason}}<p class="wpl-field-error" role="alert">{{this.reason}}</p>{{/if}}</div>`,
  {
    state: () => ({ names: [] as string[], reason: '' }),
    getters: {
      label: (host) => str(host.args.label, 'Choose a file'),
      names: (host) => list<string>(host.state.names),
      reason: (host) => str(host.state.reason),
    },
    methods: {
      take(event) {
        const input = (event as Event).target;
        const files = input instanceof HTMLInputElement ? input.files : null;
        const accepted: string[] = [];
        const rejected: Array<{ name: string; reason: string }> = [];
        const maxSize = num(this.args.maxSize, 0);
        const accept = str(this.args.accept);
        const reason = message(localeOf(input instanceof Element ? input : null), 'fileRejected');
        for (const file of files ? [...files] : []) {
          const allowed = !accept || accept.split(',').some((rule) => matches(file, rule.trim()));
          if (!allowed || (maxSize > 0 && file.size > maxSize))
            rejected.push({ name: file.name, reason });
          else accepted.push(file.name);
        }
        this.state.names = accepted;
        this.state.reason = rejected.map((item) => `${item.name}: ${item.reason}`).join(' ');
        if (accepted.length) bubble(event as Event, 'wpl-change', { files: accepted });
        if (rejected.length) bubble(event as Event, 'wpl-reject', { files: rejected });
      },
    },
  },
);

function matches(file: File, rule: string): boolean {
  if (!rule) return true;
  if (rule.startsWith('.')) return file.name.toLowerCase().endsWith(rule.toLowerCase());
  if (rule.endsWith('/*')) return file.type.startsWith(rule.slice(0, -1));
  return file.type === rule;
}
