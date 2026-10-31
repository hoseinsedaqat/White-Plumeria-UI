import {
  clampRangeEdge,
  createId,
  cx,
  fieldClassName,
  formatNumber,
  inputClassName,
  nearerEdge,
  normalizeRange,
  rangeBounds,
  rangeFill,
  readingDirection,
  selectClassName,
  toggleGroupMove,
  textareaClassName,
  valueFromPointer,
  type ControlSize,
  type NumberRange,
} from '@white-plumeria/core';
import { defineTag, html, nothing, WplElement, type RenderResult } from './element';
import { localeOf, translate } from './provider';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface FieldState {
  id: string;
  describedBy?: string;
  invalid: boolean;
  required: boolean;
  disabled: boolean;
}

export function fieldFrom(node: Node | null): FieldState | null {
  const element = node instanceof Element ? node : node?.parentElement ?? null;
  const host = element?.closest('wpl-form-field');
  if (!(host instanceof FormField)) return null;
  return host.fieldState();
}

export class Label extends WplElement {
  static override properties = {
    for: { type: String },
    required: { type: Boolean },
  };

  declare for: string;
  declare required: boolean;

  constructor() {
    super();
    this.for = '';
    this.required = false;
  }

  protected override render(): RenderResult {
    return html`<label class="wpl-label" for=${this.for || nothing}>
      <span data-wpl-slot="" style="display:contents"></span>
      ${this.required
        ? html`<span class="wpl-required" aria-hidden="true">*</span><span class="wpl-sr-only">${translate(this, 'required')}</span>`
        : nothing}
    </label>`;
  }
}

export class FormMessage extends WplElement {
  static override properties = {
    tone: { type: String },
  };

  declare tone: 'hint' | 'error';

  constructor() {
    super();
    this.tone = 'hint';
  }

  protected override render(): RenderResult {
    const error = this.tone === 'error';
    return html`<p class=${error ? 'wpl-field-error' : 'wpl-field-hint'} role=${error ? 'alert' : nothing}>
      <span data-wpl-slot="" style="display:contents"></span>
    </p>`;
  }
}

export class ValidationMessage extends FormMessage {
  constructor() {
    super();
    this.tone = 'error';
  }
}

export class FormField extends WplElement {
  static override properties = {
    label: { type: String },
    hint: { type: String },
    error: { type: String },
    required: { type: Boolean },
    disabled: { type: Boolean },
  };

  declare label: string;
  declare hint: string;
  declare error: string;
  declare required: boolean;
  declare disabled: boolean;
  readonly fieldId = createId('wpl-field');

  constructor() {
    super();
    this.label = '';
    this.hint = '';
    this.error = '';
    this.required = false;
    this.disabled = false;
  }

  fieldState(): FieldState {
    const hintId = this.hint ? `${this.fieldId}-hint` : undefined;
    const errorId = this.error ? `${this.fieldId}-error` : undefined;
    return {
      id: this.fieldId,
      describedBy: [hintId, errorId].filter(Boolean).join(' ') || undefined,
      invalid: Boolean(this.error),
      required: this.required,
      disabled: this.disabled,
    };
  }

  protected override render(): RenderResult {
    const state = this.fieldState();
    return html`<div class=${fieldClassName(Boolean(this.error))}>
      <label class="wpl-label" for=${state.id}>
        ${this.label}
        ${this.required
          ? html`<span class="wpl-required" aria-hidden="true">*</span><span class="wpl-sr-only">${translate(this, 'required')}</span>`
          : nothing}
      </label>
      <span data-wpl-slot="" style="display:contents"></span>
      ${this.hint ? html`<p id=${`${state.id}-hint`} class="wpl-field-hint">${this.hint}</p>` : nothing}
      ${this.error ? html`<p id=${`${state.id}-error`} class="wpl-field-error" role="alert">${this.error}</p>` : nothing}
    </div>`;
  }
}

export class Input extends WplElement {
  static override properties = {
    size: { type: String },
    invalid: { type: Boolean },
    name: { type: String },
    type: { type: String },
    value: { type: String },
    defaultValue: { type: String, attribute: 'default-value' },
    placeholder: { type: String },
    autocomplete: { type: String },
    inputMode: { type: String, attribute: 'inputmode' },
    required: { type: Boolean },
    disabled: { type: Boolean },
    readOnly: { type: Boolean, attribute: 'readonly' },
    min: { type: String },
    max: { type: String },
    step: { type: String },
  };

  declare size: ControlSize;
  declare invalid: boolean;
  declare name: string;
  declare type: string;
  declare value: string | undefined;
  declare defaultValue: string;
  declare placeholder: string;
  declare autocomplete: string;
  declare inputMode: string;
  declare required: boolean;
  declare disabled: boolean;
  declare readOnly: boolean;
  declare min: string;
  declare max: string;
  declare step: string;
  private text = '';
  private seeded = false;

  constructor() {
    super();
    this.size = 'md';
    this.invalid = false;
    this.name = '';
    this.type = 'text';
    this.value = undefined;
    this.defaultValue = '';
    this.placeholder = '';
    this.autocomplete = '';
    this.inputMode = '';
    this.required = false;
    this.disabled = false;
    this.readOnly = false;
    this.min = '';
    this.max = '';
    this.step = '';
  }

  protected override willUpdate(): void {
    if (this.seeded) return;
    this.seeded = true;
    if (this.value === undefined) this.text = this.defaultValue;
  }

  private current(): string {
    return this.value !== undefined ? this.value : this.text;
  }

  private onInput = (event: Event): void => {
    const element = event.target instanceof HTMLInputElement ? event.target : null;
    if (!element) return;
    if (this.value === undefined) {
      this.text = element.value;
      this.requestUpdate();
    }
    this.emit('wpl-change', { value: element.value });
  };

  protected override render(): RenderResult {
    const field = fieldFrom(this);
    return html`<input
      id=${this.id || field?.id || nothing}
      class=${inputClassName({ size: this.size })}
      name=${this.name || nothing}
      type=${this.type || 'text'}
      .value=${this.current()}
      placeholder=${this.placeholder || nothing}
      autocomplete=${this.autocomplete || nothing}
      inputmode=${this.inputMode || nothing}
      min=${this.min || nothing}
      max=${this.max || nothing}
      step=${this.step || nothing}
      ?readonly=${this.readOnly}
      aria-invalid=${this.invalid || field?.invalid ? 'true' : nothing}
      aria-describedby=${field?.describedBy || nothing}
      aria-required=${this.required || field?.required ? 'true' : nothing}
      ?required=${this.required || field?.required}
      ?disabled=${this.disabled || field?.disabled}
      @input=${this.onInput}
    />`;
  }
}

export class Textarea extends WplElement {
  static override properties = {
    size: { type: String },
    invalid: { type: Boolean },
    name: { type: String },
    value: { type: String },
    rows: { type: Number },
    required: { type: Boolean },
    disabled: { type: Boolean },
    placeholder: { type: String },
  };

  declare size: ControlSize;
  declare invalid: boolean;
  declare name: string;
  declare value: string | undefined;
  declare rows: number;
  declare required: boolean;
  declare disabled: boolean;
  declare placeholder: string;
  private text = '';

  constructor() {
    super();
    this.size = 'md';
    this.invalid = false;
    this.name = '';
    this.value = undefined;
    this.rows = 4;
    this.required = false;
    this.disabled = false;
    this.placeholder = '';
  }

  private onInput = (event: Event): void => {
    const element = event.target instanceof HTMLTextAreaElement ? event.target : null;
    if (!element) return;
    if (this.value === undefined) {
      this.text = element.value;
      this.requestUpdate();
    }
    this.emit('wpl-change', { value: element.value });
  };

  protected override render(): RenderResult {
    const field = fieldFrom(this);
    const current = this.value !== undefined ? this.value : this.text;
    return html`<textarea
      id=${this.id || field?.id || nothing}
      name=${this.name || nothing}
      rows=${this.rows || 4}
      class=${textareaClassName({ size: this.size })}
      .value=${current}
      placeholder=${this.placeholder || nothing}
      aria-invalid=${this.invalid || field?.invalid ? 'true' : nothing}
      aria-describedby=${field?.describedBy || nothing}
      ?required=${this.required || field?.required}
      ?disabled=${this.disabled || field?.disabled}
      @input=${this.onInput}
    ></textarea>`;
  }
}

export class Select extends WplElement {
  static override properties = {
    size: { type: String },
    invalid: { type: Boolean },
    name: { type: String },
    value: { type: String },
    required: { type: Boolean },
    disabled: { type: Boolean },
    placeholder: { type: String },
    options: { attribute: false },
  };

  declare size: ControlSize;
  declare invalid: boolean;
  declare name: string;
  declare value: string;
  declare required: boolean;
  declare disabled: boolean;
  declare placeholder: string;
  declare options: SelectOption[];

  constructor() {
    super();
    this.size = 'md';
    this.invalid = false;
    this.name = '';
    this.value = '';
    this.required = false;
    this.disabled = false;
    this.placeholder = '';
    this.options = [];
  }

  private onChange = (event: Event): void => {
    const element = event.target instanceof HTMLSelectElement ? event.target : null;
    if (!element) return;
    this.value = element.value;
    this.emit('wpl-change', { value: element.value });
  };

  protected override render(): RenderResult {
    const field = fieldFrom(this);
    return html`<select
      id=${this.id || field?.id || nothing}
      name=${this.name || nothing}
      class=${selectClassName({ size: this.size })}
      .value=${this.value}
      aria-invalid=${this.invalid || field?.invalid ? 'true' : nothing}
      aria-describedby=${field?.describedBy || nothing}
      ?required=${this.required || field?.required}
      ?disabled=${this.disabled || field?.disabled}
      @change=${this.onChange}
    >
      ${this.placeholder ? html`<option value="">${this.placeholder}</option>` : nothing}
      ${this.options.map(
        (option) => html`<option value=${option.value} ?disabled=${Boolean(option.disabled)}>${option.label}</option>`,
      )}
      <span data-wpl-slot="" style="display:contents"></span>
    </select>`;
  }
}

export class Checkbox extends WplElement {
  static override properties = {
    label: { type: String },
    checked: { type: Boolean },
    defaultChecked: { type: Boolean, attribute: 'default-checked' },
    name: { type: String },
    disabled: { type: Boolean },
  };

  declare label: string;
  declare checked: boolean | undefined;
  declare defaultChecked: boolean;
  declare name: string;
  declare disabled: boolean;
  private internal = false;
  private seeded = false;

  constructor() {
    super();
    this.label = '';
    this.checked = undefined;
    this.defaultChecked = false;
    this.name = '';
    this.disabled = false;
  }

  protected override willUpdate(): void {
    if (this.seeded) return;
    this.seeded = true;
    if (this.checked === undefined) this.internal = this.defaultChecked;
  }

  private current(): boolean {
    return this.checked !== undefined ? this.checked : this.internal;
  }

  private onChange = (event: Event): void => {
    const element = event.target instanceof HTMLInputElement ? event.target : null;
    if (!element) return;
    if (this.checked === undefined) {
      this.internal = element.checked;
      this.requestUpdate();
    }
    this.emit('wpl-change', { value: element.checked });
  };

  protected override render(): RenderResult {
    return html`<label class="wpl-check">
      <input type="checkbox" name=${this.name || nothing} .checked=${this.current()} ?disabled=${this.disabled} @change=${this.onChange} />
      <span>${this.label}</span>
    </label>`;
  }
}

export class RadioGroup extends WplElement {
  static override properties = {
    label: { type: String },
    name: { type: String },
    value: { type: String },
    defaultValue: { type: String, attribute: 'default-value' },
    options: { attribute: false },
  };

  declare label: string;
  declare name: string;
  declare value: string | undefined;
  declare defaultValue: string;
  declare options: SelectOption[];
  private internal = '';
  private seeded = false;

  constructor() {
    super();
    this.label = '';
    this.name = createId('wpl-radio');
    this.value = undefined;
    this.defaultValue = '';
    this.options = [];
  }

  protected override willUpdate(): void {
    if (this.seeded) return;
    this.seeded = true;
    if (this.value === undefined) this.internal = this.defaultValue;
  }

  private current(): string {
    return this.value !== undefined ? this.value : this.internal;
  }

  private choose = (value: string): void => {
    if (this.value === undefined) {
      this.internal = value;
      this.requestUpdate();
    }
    this.emit('wpl-change', { value });
  };

  protected override render(): RenderResult {
    const selected = this.current();
    return html`<fieldset class="wpl-field">
      <legend class="wpl-label">${this.label}</legend>
      ${this.options.map(
        (option) => html`<label class="wpl-radio">
          <input
            type="radio"
            name=${this.name}
            value=${option.value}
            .checked=${selected === option.value}
            ?disabled=${Boolean(option.disabled)}
            @change=${() => this.choose(option.value)}
          />
          <span>${option.label}</span>
        </label>`,
      )}
    </fieldset>`;
  }
}

export class ToggleGroup extends WplElement {
  static override properties = {
    label: { type: String },
    name: { type: String },
    value: { type: String },
    defaultValue: { type: String, attribute: 'default-value' },
    hideLabel: { type: Boolean, attribute: 'hide-label' },
    disabled: { type: Boolean },
    options: { attribute: false },
  };

  declare label: string;
  declare name: string;
  declare value: string | undefined;
  declare defaultValue: string;
  declare hideLabel: boolean;
  declare disabled: boolean;
  declare options: SelectOption[];
  private internal = '';
  private seeded = false;
  private readonly labelId = createId('wpl-toggle');

  constructor() {
    super();
    this.label = '';
    this.name = '';
    this.value = undefined;
    this.defaultValue = '';
    this.hideLabel = false;
    this.disabled = false;
    this.options = [];
  }

  protected override willUpdate(): void {
    if (this.seeded) return;
    this.seeded = true;
    if (this.value === undefined) this.internal = this.defaultValue;
  }

  private current(): string {
    return this.value !== undefined ? this.value : this.internal;
  }

  private choose(next: string): void {
    if (this.disabled) return;
    if (this.value === undefined) {
      this.internal = next;
      this.requestUpdate();
    }
    this.emit('wpl-change', { value: next });
  }

  private onKey = (event: KeyboardEvent): void => {
    const selected = this.options.findIndex((option) => option.value === this.current());
    const next = toggleGroupMove(
      this.options,
      selected,
      event.key,
      readingDirection(event.currentTarget instanceof HTMLElement ? event.currentTarget : null),
    );
    if (next === null) return;
    const option = this.options[next];
    if (!option) return;
    event.preventDefault();
    this.choose(option.value);
    const group =
      event.currentTarget instanceof HTMLElement ? event.currentTarget.parentElement : null;
    queueMicrotask(() =>
      group?.querySelectorAll<HTMLButtonElement>('[role="radio"]')[next]?.focus(),
    );
  };

  protected override render(): RenderResult {
    const selected = this.current();
    const selectedIndex = this.options.findIndex(
      (option) => option.value === selected && !option.disabled,
    );
    const firstEnabled = this.options.findIndex((option) => !option.disabled);
    const buttons = this.options.map((option, index) => {
      const checked = option.value === selected;
      const tabbable =
        !option.disabled &&
        !this.disabled &&
        (checked || (selectedIndex < 0 && index === firstEnabled));
      return html`<button
        type="button"
        class="wpl-toggle-item"
        role="radio"
        aria-checked=${String(checked)}
        ?disabled=${this.disabled || Boolean(option.disabled)}
        tabindex=${tabbable ? 0 : -1}
        @click=${() => this.choose(option.value)}
        @keydown=${this.onKey}
      >
        ${option.label}
      </button>`;
    });
    const group = html`<div
      class="wpl-toggle"
      role="radiogroup"
      aria-label=${this.hideLabel ? this.label : nothing}
      aria-labelledby=${this.hideLabel ? nothing : this.labelId}
    >
      ${buttons}
      ${this.name ? html`<input type="hidden" name=${this.name} .value=${selected} />` : nothing}
    </div>`;
    if (this.hideLabel) return group;
    return html`<div class="wpl-field">
      <span id=${this.labelId} class="wpl-label">${this.label}</span>${group}
    </div>`;
  }
}

export class Switch extends WplElement {
  static override properties = {
    label: { type: String },
    checked: { type: Boolean },
    defaultChecked: { type: Boolean, attribute: 'default-checked' },
    disabled: { type: Boolean },
    name: { type: String },
  };

  declare label: string;
  declare checked: boolean | undefined;
  declare defaultChecked: boolean;
  declare name: string;
  declare disabled: boolean;
  private internal = false;
  private seeded = false;

  constructor() {
    super();
    this.label = '';
    this.checked = undefined;
    this.defaultChecked = false;
    this.name = '';
    this.disabled = false;
  }

  protected override willUpdate(): void {
    if (this.seeded) return;
    this.seeded = true;
    if (this.checked === undefined) this.internal = this.defaultChecked;
  }

  private current(): boolean {
    return this.checked !== undefined ? this.checked : this.internal;
  }

  private toggle = (): void => {
    if (this.disabled) return;
    const next = !this.current();
    if (this.checked === undefined) {
      this.internal = next;
      this.requestUpdate();
    }
    this.emit('wpl-change', { value: next });
  };

  protected override render(): RenderResult {
    const checked = this.current();
    return html`<button
      type="button"
      role="switch"
      class="wpl-switch"
      aria-checked=${checked ? 'true' : 'false'}
      ?disabled=${this.disabled}
      @click=${this.toggle}
    >
      <span class="wpl-switch-control" aria-hidden="true"></span>
      <span>${this.label}</span>
      ${this.name ? html`<input type="checkbox" name=${this.name} .checked=${checked} readonly hidden />` : nothing}
    </button>`;
  }
}

export class Slider extends WplElement {
  static override properties = {
    label: { type: String },
    min: { type: Number },
    max: { type: Number },
    step: { type: Number },
    value: { type: Number },
    defaultValue: { type: Number, attribute: 'default-value' },
  };

  declare label: string;
  declare min: number;
  declare max: number;
  declare step: number;
  declare value: number | null;
  declare defaultValue: number | null;
  private internal = 0;
  private seeded = false;
  private readonly inputId = createId('wpl-slider');

  constructor() {
    super();
    this.label = '';
    this.min = 0;
    this.max = 100;
    this.step = 1;
    this.value = null;
    this.defaultValue = null;
  }

  protected override willUpdate(): void {
    if (this.seeded) return;
    this.seeded = true;
    if (this.value === null) this.internal = this.defaultValue ?? this.min ?? 0;
  }

  private current(): number {
    return this.value === null || Number.isNaN(this.value) ? this.internal : this.value;
  }

  private onInput = (event: Event): void => {
    const element = event.target instanceof HTMLInputElement ? event.target : null;
    if (!element) return;
    const next = Number(element.value);
    if (this.value === null) {
      this.internal = next;
      this.requestUpdate();
    }
    this.emit('wpl-change', { value: next });
  };

  protected override render(): RenderResult {
    const current = this.current();
    const text = formatNumber(current, localeOf(this));
    return html`<div class="wpl-field">
      <div class="wpl-flex wpl-flex-between">
        <label class="wpl-label" for=${this.inputId}>${this.label}</label>
        <output id=${`${this.inputId}-value`} for=${this.inputId}>${text}</output>
      </div>
      <input
        id=${this.inputId}
        class="wpl-slider"
        type="range"
        min=${this.min}
        max=${this.max}
        step=${this.step}
        .value=${String(current)}
        aria-valuetext=${text}
        @input=${this.onInput}
      />
    </div>`;
  }
}

export class RangeSlider extends WplElement {
  static override properties = {
    label: { type: String },
    min: { type: Number },
    max: { type: Number },
    step: { type: Number },
    start: { type: Number },
    end: { type: Number },
    defaultStart: { type: Number, attribute: 'default-start' },
    defaultEnd: { type: Number, attribute: 'default-end' },
    disabled: { type: Boolean },
    name: { type: String },
  };

  declare label: string;
  declare min: number;
  declare max: number;
  declare step: number;
  declare start: number | null;
  declare end: number | null;
  declare defaultStart: number | null;
  declare defaultEnd: number | null;
  declare disabled: boolean;
  declare name: string;
  private internal: NumberRange = { start: 0, end: 100 };
  private seeded = false;
  private readonly uid = createId('wpl-range');

  constructor() {
    super();
    this.label = '';
    this.min = 0;
    this.max = 100;
    this.step = 1;
    this.start = null;
    this.end = null;
    this.defaultStart = null;
    this.defaultEnd = null;
    this.disabled = false;
    this.name = '';
  }

  protected override willUpdate(): void {
    if (this.seeded) return;
    this.seeded = true;
    const bounds = rangeBounds(this.min, this.max, this.step);
    this.internal = normalizeRange(this.defaultStart ?? bounds.min, this.defaultEnd ?? bounds.max, bounds);
  }

  private bounds() {
    return rangeBounds(this.min, this.max, this.step);
  }

  private current(): NumberRange {
    const bounds = this.bounds();
    if (this.start === null) return normalizeRange(this.internal.start, this.internal.end, bounds);
    return normalizeRange(this.start, this.end ?? bounds.max, bounds);
  }

  private commit(next: NumberRange): void {
    if (this.start === null) {
      this.internal = next;
      this.requestUpdate();
    }
    this.emit('wpl-change', { value: next });
  }

  private onEdge = (edge: 'start' | 'end', event: Event): void => {
    const element = event.target instanceof HTMLInputElement ? event.target : null;
    if (!element) return;
    this.commit(clampRangeEdge(edge, Number(element.value), this.current(), this.bounds()));
  };

  private onTrack = (event: PointerEvent): void => {
    if (this.disabled || event.target instanceof HTMLInputElement) return;
    const host = event.currentTarget instanceof HTMLElement ? event.currentTarget : null;
    if (!host) return;
    const rect = host.getBoundingClientRect();
    const direction = readingDirection(host);
    const bounds = this.bounds();
    const value = valueFromPointer(event.clientX, rect.left, rect.width, bounds, direction);
    const current = this.current();
    const edge = nearerEdge(value, current);
    this.commit(clampRangeEdge(edge, value, current, bounds));
    host.querySelector<HTMLInputElement>(edge === 'start' ? 'input:not([data-edge])' : 'input[data-edge="end"]')?.focus();
  };

  protected override render(): RenderResult {
    const bounds = this.bounds();
    const current = this.current();
    const fill = rangeFill(current, bounds);
    const locale = localeOf(this);
    return html`<div class="wpl-field">
      <div class="wpl-flex wpl-flex-between">
        <span class="wpl-label" id=${`${this.uid}-label`}>${this.label}</span>
        <output class="wpl-range-readout" aria-hidden="true">${formatNumber(current.start, locale)} – ${formatNumber(current.end, locale)}</output>
      </div>
      <div
        class="wpl-range"
        role="group"
        aria-labelledby=${`${this.uid}-label`}
        data-disabled=${this.disabled ? 'true' : nothing}
        style=${`--wpl-range-start:${fill.start};--wpl-range-size:${fill.size}`}
        @pointerdown=${this.onTrack}
      >
        <span class="wpl-range-track" aria-hidden="true"></span>
        <span class="wpl-range-fill" aria-hidden="true"></span>
        <input
          id=${`${this.uid}-start`}
          class="wpl-range-input"
          type="range"
          min=${bounds.min}
          max=${bounds.max}
          step=${bounds.step}
          .value=${String(current.start)}
          ?disabled=${this.disabled}
          name=${this.name ? `${this.name}-start` : nothing}
          aria-label=${`${this.label} start`}
          aria-valuetext=${formatNumber(current.start, locale)}
          @input=${(event: Event) => this.onEdge('start', event)}
        />
        <input
          id=${`${this.uid}-end`}
          class="wpl-range-input"
          data-edge="end"
          type="range"
          min=${bounds.min}
          max=${bounds.max}
          step=${bounds.step}
          .value=${String(current.end)}
          ?disabled=${this.disabled}
          name=${this.name ? `${this.name}-end` : nothing}
          aria-label=${`${this.label} end`}
          aria-valuetext=${formatNumber(current.end, locale)}
          @input=${(event: Event) => this.onEdge('end', event)}
        />
      </div>
    </div>`;
  }
}

export class SearchInput extends WplElement {
  static override properties = {
    label: { type: String },
    value: { type: String },
    defaultValue: { type: String, attribute: 'default-value' },
    placeholder: { type: String },
    visuallyHiddenLabel: { type: Boolean, attribute: 'visually-hidden-label' },
  };

  declare label: string;
  declare value: string | undefined;
  declare defaultValue: string;
  declare placeholder: string;
  declare visuallyHiddenLabel: boolean;
  private text = '';
  private seeded = false;
  private readonly inputId = createId('wpl-search');

  constructor() {
    super();
    this.label = '';
    this.value = undefined;
    this.defaultValue = '';
    this.placeholder = '';
    this.visuallyHiddenLabel = false;
  }

  protected override willUpdate(): void {
    if (this.seeded) return;
    this.seeded = true;
    if (this.value === undefined) this.text = this.defaultValue;
  }

  private current(): string {
    return this.value !== undefined ? this.value : this.text;
  }

  private commit(next: string): void {
    if (this.value === undefined) {
      this.text = next;
      this.requestUpdate();
    }
    this.emit('wpl-change', { value: next });
  }

  protected override render(): RenderResult {
    const current = this.current();
    return html`<div class="wpl-search">
      <label class=${cx('wpl-label', this.visuallyHiddenLabel && 'wpl-sr-only')} for=${this.inputId}>${this.label}</label>
      <div class="wpl-search-control">
        <span class="wpl-search-icon" aria-hidden="true">⌕</span>
        <input
          id=${this.inputId}
          class="wpl-input"
          type="search"
          .value=${current}
          placeholder=${this.placeholder || nothing}
          @input=${(event: Event) => {
            const element = event.target instanceof HTMLInputElement ? event.target : null;
            if (element) this.commit(element.value);
          }}
          @keydown=${(event: KeyboardEvent) => {
            if (event.key === 'Enter') this.emit('wpl-search', { value: this.current() });
          }}
        />
        ${current
          ? html`<button
              type="button"
              class="wpl-icon-btn wpl-icon-btn-sm wpl-btn-ghost wpl-search-clear"
              aria-label=${translate(this, 'clear')}
              @click=${() => this.commit('')}
            >
              ×
            </button>`
          : nothing}
      </div>
    </div>`;
  }
}

defineTag('wpl-label', Label);
defineTag('wpl-form-message', FormMessage);
defineTag('wpl-validation-message', ValidationMessage);
defineTag('wpl-form-field', FormField);
defineTag('wpl-input', Input);
defineTag('wpl-textarea', Textarea);
defineTag('wpl-select', Select);
defineTag('wpl-checkbox', Checkbox);
defineTag('wpl-radio-group', RadioGroup);
defineTag('wpl-toggle-group', ToggleGroup);
defineTag('wpl-switch', Switch);
defineTag('wpl-slider', Slider);
defineTag('wpl-range-slider', RangeSlider);
defineTag('wpl-search-input', SearchInput);
