import type { PropertyValues } from 'lit';
import {
  clampInteger,
  createId,
  inputClassName,
  numberFieldCommit,
  numberFieldDraftValue,
  numberFieldStep,
  numberFieldText,
  otpApply,
  otpCells,
  otpDelete,
  otpLength,
  rangeBounds,
  readingDirection,
} from '@white-plumeria/core';
import { defineTag, html, nothing, WplElement, type RenderResult } from './element';
import { iconSvg } from './icon';
import { translate } from './provider';

export class PasswordField extends WplElement {
  static override properties = {
    label: { type: String },
    value: { type: String },
    defaultValue: { type: String, attribute: 'default-value' },
    name: { type: String },
    autocomplete: { type: String },
    invalid: { type: Boolean },
    disabled: { type: Boolean },
  };

  declare label: string;
  declare value: string | undefined;
  declare defaultValue: string;
  declare name: string;
  declare autocomplete: string;
  declare invalid: boolean;
  declare disabled: boolean;
  private text = '';
  private visible = false;
  private seeded = false;
  private readonly inputId = createId('wpl-password');

  constructor() {
    super();
    this.label = '';
    this.value = undefined;
    this.defaultValue = '';
    this.name = '';
    this.autocomplete = 'current-password';
    this.invalid = false;
    this.disabled = false;
  }

  protected override willUpdate(): void {
    if (this.seeded) return;
    this.seeded = true;
    if (this.value === undefined) this.text = this.defaultValue;
  }

  private current(): string {
    return this.value !== undefined ? this.value : this.text;
  }

  protected override render(): RenderResult {
    const current = this.current();
    return html`<div class="wpl-field">
      <label class="wpl-label" for=${this.id || this.inputId}>${this.label}</label>
      <div class="wpl-password">
        <input
          id=${this.id || this.inputId}
          class="wpl-input"
          type=${this.visible ? 'text' : 'password'}
          name=${this.name || nothing}
          .value=${current}
          autocomplete=${this.autocomplete || 'current-password'}
          ?disabled=${this.disabled}
          aria-invalid=${this.invalid ? 'true' : nothing}
          @input=${(event: Event) => {
            const element = event.target instanceof HTMLInputElement ? event.target : null;
            if (!element) return;
            if (this.value === undefined) {
              this.text = element.value;
              this.requestUpdate();
            }
            this.emit('wpl-change', { value: element.value });
          }}
        />
        <button
          type="button"
          class="wpl-icon-btn wpl-btn-ghost"
          aria-pressed=${this.visible ? 'true' : 'false'}
          aria-label=${this.visible ? translate(this, 'hidePassword') : translate(this, 'showPassword')}
          ?disabled=${this.disabled}
          @click=${() => {
            this.visible = !this.visible;
            this.requestUpdate();
          }}
        >
          ${iconSvg(this.visible ? 'eyeOff' : 'eye')}
        </button>
      </div>
    </div>`;
  }
}

export class OtpField extends WplElement {
  static override properties = {
    label: { type: String },
    length: { type: Number },
    value: { type: String },
    defaultValue: { type: String, attribute: 'default-value' },
    name: { type: String },
    numeric: { type: Boolean },
    disabled: { type: Boolean },
  };

  declare label: string;
  declare length: number;
  declare value: string | undefined;
  declare defaultValue: string;
  declare name: string;
  declare numeric: boolean;
  declare disabled: boolean;
  private text = '';
  private seeded = false;
  private readonly uid = createId('wpl-otp');
  private readonly cells: HTMLInputElement[] = [];

  constructor() {
    super();
    this.label = '';
    this.length = 6;
    this.value = undefined;
    this.defaultValue = '';
    this.name = '';
    this.numeric = true;
    this.disabled = false;
  }

  protected override willUpdate(): void {
    if (this.seeded) return;
    this.seeded = true;
    if (this.value === undefined) this.text = this.defaultValue;
  }

  private current(): string {
    return this.value !== undefined ? this.value : this.text;
  }

  private commit(next: string, focus: number): void {
    if (this.value === undefined) {
      this.text = next;
      this.requestUpdate();
    }
    this.emit('wpl-change', { value: next });
    queueMicrotask(() => this.cells[focus]?.focus());
  }

  protected override updated(changed: PropertyValues): void {
    super.updated(changed);
    this.cells.splice(
      0,
      this.cells.length,
      ...this.view.querySelectorAll<HTMLInputElement>('input.wpl-otp-cell'),
    );
  }

  protected override render(): RenderResult {
    const size = otpLength(this.length || 6);
    const numeric = this.numeric;
    const current = this.current();
    const values = otpCells(current, size, numeric);
    return html`<div class="wpl-field">
      <label class="wpl-label" id=${`${this.uid}-label`}>${this.label}</label>
      <div class="wpl-otp" role="group" aria-labelledby=${`${this.uid}-label`}>
        ${values.map(
          (cell, index) =>
            html`<input
              class=${inputClassName({ className: 'wpl-otp-cell' })}
              .value=${cell}
              inputmode=${numeric ? 'numeric' : 'text'}
              autocomplete=${index === 0 ? 'one-time-code' : 'off'}
              aria-label=${`${translate(this, 'character')} ${index + 1} ${translate(this, 'of')} ${size}`}
              ?disabled=${this.disabled}
              maxlength="1"
              @input=${(event: Event) => {
                const element = event.target instanceof HTMLInputElement ? event.target : null;
                if (!element) return;
                const raw = element.value;
                const result = raw
                  ? otpApply(this.current(), size, numeric, index, raw.slice(-1))
                  : otpDelete(this.current(), size, numeric, index);
                this.commit(result.value, result.focus);
              }}
              @paste=${(event: ClipboardEvent) => {
                event.preventDefault();
                const result = otpApply(
                  this.current(),
                  size,
                  numeric,
                  index,
                  event.clipboardData?.getData('text') ?? '',
                );
                this.commit(result.value, result.focus);
              }}
              @keydown=${(event: KeyboardEvent) => {
                if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
                  event.preventDefault();
                  const element =
                    event.currentTarget instanceof HTMLElement ? event.currentTarget : null;
                  const direction = readingDirection(element);
                  const delta =
                    event.key === 'ArrowRight'
                      ? direction === 'rtl'
                        ? -1
                        : 1
                      : direction === 'rtl'
                        ? 1
                        : -1;
                  this.cells[Math.min(size - 1, Math.max(0, index + delta))]?.focus();
                }
                if (event.key === 'Backspace' && !values[index]) {
                  event.preventDefault();
                  const result = otpDelete(this.current(), size, numeric, index);
                  this.commit(result.value, result.focus);
                }
              }}
            />`,
        )}
      </div>
      ${this.name ? html`<input type="hidden" name=${this.name} .value=${current} />` : nothing}
    </div>`;
  }
}

export class Rating extends WplElement {
  static override properties = {
    label: { type: String },
    max: { type: Number },
    value: { type: Number },
    defaultValue: { type: Number, attribute: 'default-value' },
    name: { type: String },
    readOnly: { type: Boolean, attribute: 'readonly' },
  };

  declare label: string;
  declare max: number;
  declare value: number | null;
  declare defaultValue: number | null;
  declare name: string;
  declare readOnly: boolean;
  private internal = 0;
  private seeded = false;
  private readonly uid = createId('wpl-rating');

  constructor() {
    super();
    this.label = '';
    this.max = 5;
    this.value = null;
    this.defaultValue = null;
    this.name = '';
    this.readOnly = false;
  }

  protected override willUpdate(): void {
    if (this.seeded) return;
    this.seeded = true;
    if (this.value === null) this.internal = this.defaultValue ?? 0;
  }

  private current(count: number): number {
    return clampInteger(this.value === null ? this.internal : this.value, 0, count, 0);
  }

  protected override render(): RenderResult {
    const count = clampInteger(this.max || 5, 1, 10, 5);
    const current = this.current(count);
    if (this.readOnly) {
      return html`<div
        class="wpl-rating"
        role="img"
        aria-label=${`${this.label}: ${current} ${translate(this, 'of')} ${count}`}
      >
        ${Array.from({ length: count }, (_, index) => html`<span class=${index < current ? 'wpl-rating-icon is-on' : 'wpl-rating-icon'} aria-hidden="true">${iconSvg('star')}</span>`)}
      </div>`;
    }
    return html`<fieldset class="wpl-rating">
      <legend class="wpl-label">${this.label}</legend>
      ${Array.from({ length: count }, (_, index) => {
        const score = index + 1;
        return html`<label class="wpl-rating-option">
          <input
            type="radio"
            name=${this.name || this.uid}
            value=${score}
            .checked=${current === score}
            @change=${() => {
              if (this.value === null) {
                this.internal = score;
                this.requestUpdate();
              }
              this.emit('wpl-change', { value: score });
            }}
          />
          <span
            class=${score <= current ? 'wpl-rating-icon is-on' : 'wpl-rating-icon'}
            aria-hidden="true"
            >${iconSvg('star')}</span
          >
          <span class="wpl-sr-only">${score} ${translate(this, 'of')} ${count}</span>
        </label>`;
      })}
    </fieldset>`;
  }
}

export class NumberField extends WplElement {
  static override properties = {
    label: { type: String },
    min: { type: Number },
    max: { type: Number },
    step: { type: Number },
    value: { type: Number },
    defaultValue: { type: Number, attribute: 'default-value' },
    name: { type: String },
    disabled: { type: Boolean },
  };

  declare label: string;
  declare min: number;
  declare max: number;
  declare step: number;
  declare value: number | null;
  declare defaultValue: number | null;
  declare name: string;
  declare disabled: boolean;
  private internal = 0;
  private draft = '';
  private focused = false;
  private seeded = false;
  private readonly uid = createId('wpl-number');

  constructor() {
    super();
    this.label = '';
    this.min = 0;
    this.max = 100;
    this.step = 1;
    this.value = null;
    this.defaultValue = null;
    this.name = '';
    this.disabled = false;
  }

  protected override willUpdate(): void {
    if (this.seeded) return;
    this.seeded = true;
    const bounds = rangeBounds(this.min, this.max, this.step);
    this.internal = numberFieldCommit(
      String(this.defaultValue ?? this.value ?? bounds.min),
      bounds,
      bounds.min,
    );
    this.draft = numberFieldText(this.internal, bounds);
  }

  private limits() {
    return rangeBounds(this.min, this.max, this.step);
  }

  private committed(): number {
    const bounds = this.limits();
    return numberFieldCommit(
      String(this.value === null ? this.internal : this.value),
      bounds,
      bounds.min,
    );
  }

  private shown(): string {
    return this.focused ? this.draft : numberFieldText(this.committed(), this.limits());
  }

  private parsed(): number {
    return numberFieldDraftValue(this.shown(), this.limits()) ?? this.committed();
  }

  private commit(next: number): void {
    const bounds = this.limits();
    const snapped = numberFieldCommit(String(next), bounds, bounds.min);
    this.draft = numberFieldText(snapped, bounds);
    if (this.value === null) this.internal = snapped;
    this.emit('wpl-change', { value: snapped });
    this.requestUpdate();
  }

  protected override render(): RenderResult {
    const bounds = this.limits();
    const shown = this.shown();
    const parsed = this.parsed();
    return html`<div class="wpl-field">
      <label class="wpl-label" for=${this.uid}>${this.label}</label>
      <div class="wpl-number">
        <button
          type="button"
          class="wpl-number-step"
          aria-label=${translate(this, 'decrease')}
          ?disabled=${this.disabled || parsed <= bounds.min}
          @click=${() => this.commit(numberFieldStep(parsed, -1, bounds))}
        >
          ${iconSvg('minus')}
        </button>
        <input
          id=${this.uid}
          class="wpl-input"
          type="number"
          name=${this.name || nothing}
          inputmode=${bounds.step < 1 ? 'decimal' : 'numeric'}
          min=${bounds.min}
          max=${bounds.max}
          step=${bounds.step}
          .value=${shown}
          ?disabled=${this.disabled}
          @focus=${() => {
            this.focused = true;
            this.draft = numberFieldText(this.committed(), bounds);
            this.requestUpdate();
          }}
          @blur=${(event: Event) => {
            const target = event.target;
            const raw = target instanceof HTMLInputElement ? target.value : this.draft;
            this.focused = false;
            this.commit(numberFieldCommit(raw, bounds, this.committed()));
          }}
          @input=${(event: Event) => {
            const target = event.target;
            if (!(target instanceof HTMLInputElement)) return;
            this.draft = target.value;
            const parsedNext = numberFieldDraftValue(target.value, bounds);
            if (parsedNext === null) {
              this.requestUpdate();
              return;
            }
            if (this.value === null) this.internal = parsedNext;
            this.emit('wpl-change', { value: parsedNext });
            this.requestUpdate();
          }}
          @wheel=${(event: Event) => {
            const target = event.target;
            if (target instanceof HTMLInputElement) target.blur();
          }}
        />
        <button
          type="button"
          class="wpl-number-step"
          aria-label=${translate(this, 'increase')}
          ?disabled=${this.disabled || parsed >= bounds.max}
          @click=${() => this.commit(numberFieldStep(parsed, 1, bounds))}
        >
          ${iconSvg('plus')}
        </button>
      </div>
    </div>`;
  }
}

defineTag('wpl-password-field', PasswordField);
defineTag('wpl-otp-field', OtpField);
defineTag('wpl-rating', Rating);
defineTag('wpl-number-field', NumberField);
