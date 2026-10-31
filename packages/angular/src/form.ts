import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  booleanAttribute,
  computed,
  contentChildren,
  effect,
  forwardRef,
  input,
  numberAttribute,
  output,
  signal,
} from '@angular/core';
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
import { injectWhitePlumeria } from './provider';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

@Component({
  selector: 'wpl-label',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  template: `
    <ng-content />
    @if (required()) {
      <span class="wpl-required" aria-hidden="true">*</span>
      <span class="wpl-sr-only">{{ requiredLabel() }}</span>
    }
  `,
  host: {
    '[class]': 'classes()',
    '[attr.for]': 'htmlFor() || null',
  },
})
export class Label {
  readonly htmlFor = input<string>();
  readonly required = input(false, { transform: booleanAttribute });
  readonly className = input('', { alias: 'class' });
  private readonly wpl = injectWhitePlumeria();
  readonly classes = computed(() => cx('wpl-label', this.className()));
  readonly requiredLabel = computed(() => this.wpl.t('required'));
}

@Component({
  selector: 'wpl-form-message',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  template: `<ng-content />`,
  host: {
    '[attr.id]': 'id() || null',
    '[class]': 'tone() === "error" ? "wpl-field-error" : "wpl-field-hint"',
    '[attr.role]': 'tone() === "error" ? "alert" : null',
  },
})
export class FormMessage {
  readonly tone = input<'hint' | 'error'>('hint');
  readonly id = input<string>();
}

@Component({
  selector: 'wpl-validation-message',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  template: `<ng-content />`,
  host: {
    class: 'wpl-field-error',
    role: 'alert',
    '[attr.id]': 'id() || null',
  },
})
export class ValidationMessage {
  readonly id = input<string>();
}

@Component({
  selector: 'wpl-form-field',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  imports: [Label, FormMessage, ValidationMessage],
  template: `
    <wpl-label [htmlFor]="fieldId" [required]="required()">{{ label() }}</wpl-label>
    <ng-content />
    @if (hint()) {
      <wpl-form-message [id]="hintId">{{ hint() }}</wpl-form-message>
    }
    @if (error()) {
      <wpl-validation-message [id]="errorId">{{ error() }}</wpl-validation-message>
    }
  `,
  host: { '[class]': 'classes()' },
})
export class FormField {
  readonly label = input.required<string>();
  readonly hint = input<string>();
  readonly error = input<string>();
  readonly required = input(false, { transform: booleanAttribute });
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly className = input('', { alias: 'class' });
  readonly fieldId = createId('wpl-field');
  readonly hintId = `${this.fieldId}-hint`;
  readonly errorId = `${this.fieldId}-error`;
  readonly describedBy = computed(() => [this.hint() ? this.hintId : '', this.error() ? this.errorId : ''].filter(Boolean).join(' '));
  readonly invalid = computed(() => Boolean(this.error()));
  readonly classes = computed(() => fieldClassName(this.invalid(), this.className()));
  private readonly inputs = contentChildren(forwardRef(() => Input));
  private readonly textareas = contentChildren(forwardRef(() => Textarea));
  private readonly selects = contentChildren(forwardRef(() => Select));

  constructor() {
    effect(() => {
      const binding = this;
      for (const control of [...this.inputs(), ...this.textareas(), ...this.selects()]) control.attach(binding);
    });
  }
}

export interface FieldBinding {
  fieldId: string;
  describedBy(): string;
  invalid(): boolean;
  required(): boolean;
  disabled(): boolean;
}

@Component({
  selector: 'input[wplInput]',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  template: '',
  host: {
    '[class]': 'classes()',
    '[attr.id]': 'resolvedId()',
    '[attr.aria-invalid]': 'isInvalid() ? true : null',
    '[attr.aria-describedby]': 'describedBy()',
    '[attr.aria-required]': 'isRequired() ? true : null',
    '[attr.required]': 'isRequired() ? true : null',
    '[disabled]': 'isDisabled() ? true : null',
  },
})
export class Input {
  readonly size = input<ControlSize>('md');
  readonly invalid = input(false, { transform: booleanAttribute });
  readonly className = input('', { alias: 'class' });
  readonly id = input<string>();
  readonly required = input(false, { transform: booleanAttribute });
  readonly disabled = input(false, { transform: booleanAttribute });
  private readonly field = signal<FieldBinding | null>(null);
  readonly classes = computed(() => inputClassName({ size: this.size(), className: this.className() }));
  readonly resolvedId = computed(() => this.id() || this.field()?.fieldId || null);
  readonly isInvalid = computed(() => this.invalid() || Boolean(this.field()?.invalid()));
  readonly describedBy = computed(() => this.field()?.describedBy() || null);
  readonly isRequired = computed(() => this.required() || Boolean(this.field()?.required()));
  readonly isDisabled = computed(() => this.disabled() || Boolean(this.field()?.disabled()));

  attach(field: FieldBinding) {
    this.field.set(field);
  }
}

@Component({
  selector: 'textarea[wplTextarea]',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  template: '',
  host: {
    '[class]': 'classes()',
    '[attr.id]': 'resolvedId()',
    '[attr.rows]': 'rows()',
    '[attr.aria-invalid]': 'isInvalid() ? true : null',
    '[attr.aria-describedby]': 'describedBy()',
    '[attr.required]': 'isRequired() ? true : null',
    '[disabled]': 'isDisabled() ? true : null',
  },
})
export class Textarea {
  readonly size = input<ControlSize>('md');
  readonly invalid = input(false, { transform: booleanAttribute });
  readonly className = input('', { alias: 'class' });
  readonly id = input<string>();
  readonly required = input(false, { transform: booleanAttribute });
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly rows = input(4, { transform: numberAttribute });
  private readonly field = signal<FieldBinding | null>(null);
  readonly classes = computed(() => textareaClassName({ size: this.size(), className: this.className() }));
  readonly resolvedId = computed(() => this.id() || this.field()?.fieldId || null);
  readonly isInvalid = computed(() => this.invalid() || Boolean(this.field()?.invalid()));
  readonly describedBy = computed(() => this.field()?.describedBy() || null);
  readonly isRequired = computed(() => this.required() || Boolean(this.field()?.required()));
  readonly isDisabled = computed(() => this.disabled() || Boolean(this.field()?.disabled()));

  attach(field: FieldBinding) {
    this.field.set(field);
  }
}

@Component({
  selector: 'select[wplSelect]',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  template: `
    @if (placeholder()) {
      <option value="">{{ placeholder() }}</option>
    }
    @for (option of options(); track option.value) {
      <option [value]="option.value" [disabled]="option.disabled">{{ option.label }}</option>
    }
    <ng-content />
  `,
  host: {
    '[class]': 'classes()',
    '[attr.id]': 'resolvedId()',
    '[attr.aria-invalid]': 'isInvalid() ? true : null',
    '[attr.aria-describedby]': 'describedBy()',
    '[attr.required]': 'isRequired() ? true : null',
    '[disabled]': 'isDisabled() ? true : null',
  },
})
export class Select {
  readonly size = input<ControlSize>('md');
  readonly invalid = input(false, { transform: booleanAttribute });
  readonly className = input('', { alias: 'class' });
  readonly id = input<string>();
  readonly required = input(false, { transform: booleanAttribute });
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly options = input<SelectOption[]>([]);
  readonly placeholder = input<string>();
  private readonly field = signal<FieldBinding | null>(null);
  readonly classes = computed(() => selectClassName({ size: this.size(), className: this.className() }));
  readonly resolvedId = computed(() => this.id() || this.field()?.fieldId || null);
  readonly isInvalid = computed(() => this.invalid() || Boolean(this.field()?.invalid()));
  readonly describedBy = computed(() => this.field()?.describedBy() || null);
  readonly isRequired = computed(() => this.required() || Boolean(this.field()?.required()));
  readonly isDisabled = computed(() => this.disabled() || Boolean(this.field()?.disabled()));

  attach(field: FieldBinding) {
    this.field.set(field);
  }
}



@Component({
  selector: 'wpl-checkbox',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  template: `
    <label class="wpl-check">
      <input
        type="checkbox"
        [checked]="current()"
        [disabled]="disabled()"
        [name]="name() || null"
        (change)="onChange($event)"
      />
      <span>{{ label() }}</span>
    </label>
  `,
})
export class Checkbox {
  readonly label = input.required<string>();
  readonly checked = input<boolean>();
  readonly defaultChecked = input(false, { transform: booleanAttribute });
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly name = input<string>();
  readonly checkedChange = output<boolean>();
  private readonly internal = signal(false);
  private seeded = false;

  constructor() {
    queueMicrotask(() => {
      if (!this.seeded) {
        this.internal.set(this.defaultChecked());
        this.seeded = true;
      }
    });
  }

  current(): boolean {
    return this.checked() ?? this.internal();
  }

  onChange(event: Event) {
    const next = event.target instanceof HTMLInputElement ? event.target.checked : false;
    if (this.checked() === undefined) this.internal.set(next);
    this.checkedChange.emit(next);
  }
}

@Component({
  selector: 'wpl-radio-group',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  template: `
    <fieldset class="wpl-field">
      <legend class="wpl-label">{{ label() }}</legend>
      @for (option of options(); track option.value) {
        <label class="wpl-radio">
          <input
            type="radio"
            [name]="name()"
            [value]="option.value"
            [checked]="isChecked(option.value)"
            [disabled]="option.disabled"
            (change)="valueChange.emit(option.value)"
          />
          <span>{{ option.label }}</span>
        </label>
      }
    </fieldset>
  `,
})
export class RadioGroup {
  readonly label = input.required<string>();
  readonly name = input.required<string>();
  readonly options = input.required<SelectOption[]>();
  readonly value = input<string>();
  readonly defaultValue = input<string>();
  readonly valueChange = output<string>();

  isChecked(option: string): boolean {
    const value = this.value();
    if (value !== undefined) return value === option;
    return this.defaultValue() === option;
  }
}

@Component({
  selector: 'wpl-switch',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  template: `
    <button type="button" class="wpl-switch" role="switch" [attr.aria-checked]="current()" [disabled]="disabled()" (click)="toggle()">
      <span class="wpl-switch-control" aria-hidden="true"></span>
      <span>{{ label() }}</span>
      @if (name()) {
        <input type="checkbox" [name]="name()" [checked]="current()" hidden />
      }
    </button>
  `,
})
export class Switch {
  readonly label = input.required<string>();
  readonly checked = input<boolean>();
  readonly defaultChecked = input(false, { transform: booleanAttribute });
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly name = input<string>();
  readonly checkedChange = output<boolean>();
  private readonly internal = signal(false);

  constructor() {
    queueMicrotask(() => this.internal.set(this.defaultChecked()));
  }

  current(): boolean {
    return this.checked() ?? this.internal();
  }

  toggle() {
    const next = !this.current();
    if (this.checked() === undefined) this.internal.set(next);
    this.checkedChange.emit(next);
  }
}

@Component({
  selector: 'wpl-slider',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  template: `
    <div class="wpl-field">
      <div class="wpl-flex wpl-flex-between">
        <label class="wpl-label" [attr.for]="inputId">{{ label() }}</label>
        <output [id]="outputId" [attr.for]="inputId">{{ formatted() }}</output>
      </div>
      <input
        class="wpl-slider"
        type="range"
        [id]="inputId"
        [min]="min()"
        [max]="max()"
        [step]="step()"
        [value]="current()"
        [attr.aria-valuetext]="formatted()"
        (input)="commit($event)"
      />
    </div>
  `,
})
export class Slider {
  readonly label = input.required<string>();
  readonly min = input(0, { transform: numberAttribute });
  readonly max = input(100, { transform: numberAttribute });
  readonly step = input(1, { transform: numberAttribute });
  readonly value = input<number>();
  readonly defaultValue = input<number>();
  readonly valueChange = output<number>();
  private readonly wpl = injectWhitePlumeria();
  private readonly internal = signal<number | null>(null);
  readonly inputId = createId('wpl-slider');
  readonly outputId = `${this.inputId}-value`;

  current(): number {
    return this.value() ?? this.internal() ?? this.defaultValue() ?? this.min();
  }

  formatted(): string {
    return formatNumber(this.current(), this.wpl.preferences().locale);
  }

  commit(event: Event) {
    const next = Number(event.target instanceof HTMLInputElement ? event.target.value : this.current());
    if (this.value() === undefined) this.internal.set(next);
    this.valueChange.emit(next);
  }
}

@Component({
  selector: 'wpl-range-slider',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  template: `
    <div class="wpl-field">
      <div class="wpl-flex wpl-flex-between">
        <span class="wpl-label" [id]="labelId">{{ label() }}</span>
        <output class="wpl-range-readout" aria-hidden="true">{{ readout() }}</output>
      </div>
      <div
        class="wpl-range"
        role="group"
        [attr.aria-labelledby]="labelId"
        [attr.data-disabled]="disabled() ? 'true' : null"
        [style.--wpl-range-start]="fill().start"
        [style.--wpl-range-size]="fill().size"
        (pointerdown)="onTrack($event)"
      >
        <span class="wpl-range-track" aria-hidden="true"></span>
        <span class="wpl-range-fill" aria-hidden="true"></span>
        <input
          #startInput
          class="wpl-range-input"
          type="range"
          [id]="startId"
          [min]="bounds().min"
          [max]="bounds().max"
          [step]="bounds().step"
          [value]="current().start"
          [disabled]="disabled()"
          [name]="name() ? name() + '-start' : null"
          [attr.aria-label]="label() + ' start'"
          [attr.aria-valuetext]="format(current().start)"
          (input)="commit('start', $event)"
        />
        <input
          #endInput
          class="wpl-range-input"
          data-edge="end"
          type="range"
          [id]="endId"
          [min]="bounds().min"
          [max]="bounds().max"
          [step]="bounds().step"
          [value]="current().end"
          [disabled]="disabled()"
          [name]="name() ? name() + '-end' : null"
          [attr.aria-label]="label() + ' end'"
          [attr.aria-valuetext]="format(current().end)"
          (input)="commit('end', $event)"
        />
      </div>
    </div>
  `,
})
export class RangeSlider {
  readonly label = input.required<string>();
  readonly min = input(0, { transform: numberAttribute });
  readonly max = input(100, { transform: numberAttribute });
  readonly step = input(1, { transform: numberAttribute });
  readonly start = input<number>();
  readonly end = input<number>();
  readonly defaultStart = input<number>();
  readonly defaultEnd = input<number>();
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly name = input<string>();
  readonly valueChange = output<NumberRange>();
  private readonly wpl = injectWhitePlumeria();
  private readonly internal = signal<NumberRange | null>(null);
  readonly uid = createId('wpl-range');
  readonly labelId = `${this.uid}-label`;
  readonly startId = `${this.uid}-start`;
  readonly endId = `${this.uid}-end`;

  bounds() {
    return rangeBounds(this.min(), this.max(), this.step());
  }

  current(): NumberRange {
    const bounds = this.bounds();
    const start = this.start();
    if (start !== undefined) return normalizeRange(start, this.end() ?? bounds.max, bounds);
    const stored = this.internal();
    if (stored) return normalizeRange(stored.start, stored.end, bounds);
    return normalizeRange(this.defaultStart() ?? this.min(), this.defaultEnd() ?? this.max(), bounds);
  }

  fill() {
    return rangeFill(this.current(), this.bounds());
  }

  format(value: number): string {
    return formatNumber(value, this.wpl.preferences().locale);
  }

  readout(): string {
    return `${this.format(this.current().start)} – ${this.format(this.current().end)}`;
  }

  commit(edge: 'start' | 'end', event: Event) {
    const raw = Number(event.target instanceof HTMLInputElement ? event.target.value : 0);
    const ordered = clampRangeEdge(edge, raw, this.current(), this.bounds());
    if (this.start() === undefined) this.internal.set(ordered);
    this.valueChange.emit(ordered);
  }

  onTrack(event: PointerEvent) {
    if (this.disabled() || event.target instanceof HTMLInputElement) return;
    const current = event.currentTarget;
    if (!(current instanceof HTMLElement)) return;
    const rect = current.getBoundingClientRect();
    const direction = getComputedStyle(current).direction === 'rtl' ? 'rtl' : 'ltr';
    const value = valueFromPointer(event.clientX, rect.left, rect.width, this.bounds(), direction);
    const edge = nearerEdge(value, this.current());
    const ordered = clampRangeEdge(edge, value, this.current(), this.bounds());
    if (this.start() === undefined) this.internal.set(ordered);
    this.valueChange.emit(ordered);
    const input = current.querySelector<HTMLInputElement>(edge === 'start' ? 'input:not([data-edge])' : 'input[data-edge="end"]');
    input?.focus();
  }
}

@Component({
  selector: 'wpl-search-input',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  template: `
    <div class="wpl-search">
      <label [class]="labelClass()" [attr.for]="inputId">{{ label() }}</label>
      <div class="wpl-search-control">
        <span class="wpl-search-icon" aria-hidden="true">⌕</span>
        <input
          class="wpl-input"
          type="search"
          [id]="inputId"
          [value]="current()"
          [placeholder]="placeholder() || null"
          (input)="commit(valueOf($event))"
          (keydown)="onKey($event)"
        />
        @if (current()) {
          <button type="button" class="wpl-icon-btn wpl-icon-btn-sm wpl-btn-ghost wpl-search-clear" [attr.aria-label]="clearLabel()" (click)="commit('')">
            ×
          </button>
        }
      </div>
    </div>
  `,
})
export class SearchInput {
  readonly label = input.required<string>();
  readonly value = input<string>();
  readonly defaultValue = input('');
  readonly placeholder = input<string>();
  readonly visuallyHiddenLabel = input(false, { transform: booleanAttribute });
  readonly valueChange = output<string>();
  readonly search = output<string>();
  private readonly wpl = injectWhitePlumeria();
  private readonly internal = signal<string | null>(null);
  readonly inputId = createId('wpl-search');
  readonly labelClass = computed(() => cx('wpl-label', this.visuallyHiddenLabel() && 'wpl-sr-only'));
  readonly clearLabel = computed(() => this.wpl.t('clear'));

  current(): string {
    return this.value() ?? this.internal() ?? this.defaultValue();
  }

  commit(next: string) {
    if (this.value() === undefined) this.internal.set(next);
    this.valueChange.emit(next);
  }

  valueOf(event: Event): string {
    return event.target instanceof HTMLInputElement ? event.target.value : '';
  }

  onKey(event: KeyboardEvent) {
    if (event.key === 'Enter') this.search.emit(this.current());
  }
}

@Component({
  selector: 'wpl-toggle-group',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  template: `
    <div class="wpl-field">
      <span class="wpl-label" [id]="labelId" [class.wpl-sr-only]="hideLabel()">{{ label() }}</span>
      <div class="wpl-toggle" role="radiogroup" [attr.aria-labelledby]="labelId">
        @for (option of options(); track option.value; let index = $index) {
          <button
            type="button"
            class="wpl-toggle-item"
            role="radio"
            [attr.aria-checked]="option.value === current()"
            [disabled]="disabled() || option.disabled"
            [attr.tabindex]="tabbable(option, index) ? 0 : -1"
            (click)="choose(option.value)"
            (keydown)="onKey($event)"
          >
            {{ option.label }}
          </button>
        }
        @if (name()) {
          <input type="hidden" [name]="name()" [value]="current()" />
        }
      </div>
    </div>
  `,
})
export class ToggleGroup {
  readonly label = input.required<string>();
  readonly options = input<SelectOption[]>([]);
  readonly value = input<string>();
  readonly defaultValue = input('');
  readonly name = input('');
  readonly hideLabel = input(false, { transform: booleanAttribute });
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly valueChange = output<string>();
  readonly labelId = createId('wpl-toggle');
  private readonly internal = signal<string | null>(null);

  constructor() {
    queueMicrotask(() => {
      if (this.internal() === null) this.internal.set(this.defaultValue());
    });
  }

  current(): string {
    return this.value() ?? this.internal() ?? this.defaultValue();
  }

  tabbable(option: SelectOption, index: number): boolean {
    if (this.disabled() || option.disabled) return false;
    if (option.value === this.current()) return true;
    const selected = this.options().findIndex(
      (item) => item.value === this.current() && !item.disabled,
    );
    return selected < 0 && index === this.options().findIndex((item) => !item.disabled);
  }

  choose(next: string) {
    if (this.disabled()) return;
    if (this.value() === undefined) this.internal.set(next);
    this.valueChange.emit(next);
  }

  onKey(event: KeyboardEvent) {
    const options = this.options();
    const selected = options.findIndex((option) => option.value === this.current());
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
    this.choose(option.value);
    const group =
      event.currentTarget instanceof HTMLElement ? event.currentTarget.parentElement : null;
    queueMicrotask(() =>
      group?.querySelectorAll<HTMLButtonElement>('[role="radio"]')[next]?.focus(),
    );
  }
}
