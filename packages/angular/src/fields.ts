import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  ViewEncapsulation,
  booleanAttribute,
  computed,
  input,
  numberAttribute,
  output,
  signal,
  viewChildren,
} from '@angular/core';
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
import { Icon } from './icon';
import { injectWhitePlumeria } from './provider';

@Component({
  selector: 'wpl-password-field',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  imports: [Icon],
  template: `
    <div class="wpl-field">
      <label class="wpl-label" [attr.for]="inputId()">{{ label() }}</label>
      <div class="wpl-password">
        <input
          class="wpl-input"
          [id]="inputId()"
          [type]="visible() ? 'text' : 'password'"
          [name]="name() || null"
          [value]="current()"
          [attr.autocomplete]="autoComplete()"
          [disabled]="disabled()"
          [attr.aria-invalid]="invalid() ? true : null"
          (input)="commit($event)"
        />
        <button
          type="button"
          class="wpl-icon-btn wpl-btn-ghost"
          [attr.aria-pressed]="visible()"
          [attr.aria-label]="toggleLabel()"
          [disabled]="disabled()"
          (click)="visible.set(!visible())"
        >
          <wpl-icon [name]="visible() ? 'eyeOff' : 'eye'" />
        </button>
      </div>
    </div>
  `,
})
export class PasswordField {
  readonly label = input.required<string>();
  readonly value = input<string>();
  readonly defaultValue = input('');
  readonly name = input<string>();
  readonly autoComplete = input('current-password');
  readonly invalid = input(false, { transform: booleanAttribute });
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly id = input<string>();
  readonly valueChange = output<string>();
  private readonly wpl = injectWhitePlumeria();
  private readonly internal = signal<string | null>(null);
  readonly visible = signal(false);
  private readonly generatedId = createId('wpl-password');
  readonly inputId = computed(() => this.id() || this.generatedId);
  readonly toggleLabel = computed(() =>
    this.wpl.t(this.visible() ? 'hidePassword' : 'showPassword'),
  );

  current(): string {
    return this.value() ?? this.internal() ?? this.defaultValue();
  }

  commit(event: Event) {
    const next = event.target instanceof HTMLInputElement ? event.target.value : '';
    if (this.value() === undefined) this.internal.set(next);
    this.valueChange.emit(next);
  }
}

@Component({
  selector: 'wpl-otp-field',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  template: `
    <div class="wpl-field">
      <label class="wpl-label" [id]="labelId">{{ label() }}</label>
      <div class="wpl-otp" role="group" [attr.aria-labelledby]="labelId">
        @for (cell of cells(); track $index) {
          <input
            #cellInput
            [class]="cellClass"
            [value]="cell"
            [attr.inputmode]="numeric() ? 'numeric' : 'text'"
            [attr.autocomplete]="$index === 0 ? 'one-time-code' : 'off'"
            [attr.aria-label]="cellLabel($index)"
            [disabled]="disabled()"
            maxlength="1"
            (input)="onInput($index, $event)"
            (paste)="onPaste($index, $event)"
            (keydown)="onKey($index, $event)"
          />
        }
      </div>
      @if (name()) {
        <input type="hidden" [name]="name()" [value]="current()" />
      }
    </div>
  `,
})
export class OtpField {
  readonly label = input.required<string>();
  readonly length = input(6, { transform: numberAttribute });
  readonly value = input<string>();
  readonly defaultValue = input('');
  readonly name = input<string>();
  readonly numeric = input(true, { transform: booleanAttribute });
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly valueChange = output<string>();
  private readonly wpl = injectWhitePlumeria();
  private readonly internal = signal<string | null>(null);
  private readonly cellsRef = viewChildren<ElementRef<HTMLInputElement>>('cellInput');
  readonly labelId = createId('wpl-otp');
  readonly cellClass = inputClassName({ className: 'wpl-otp-cell' });

  size(): number {
    return otpLength(this.length());
  }

  current(): string {
    return this.value() ?? this.internal() ?? this.defaultValue();
  }

  cells(): string[] {
    return otpCells(this.current(), this.size(), this.numeric());
  }

  cellLabel(index: number): string {
    return `${this.wpl.t('character')} ${index + 1} ${this.wpl.t('of')} ${this.size()}`;
  }

  commit(next: string, focus: number) {
    if (this.value() === undefined) this.internal.set(next);
    this.valueChange.emit(next);
    queueMicrotask(() => this.cellsRef()[focus]?.nativeElement.focus());
  }

  onInput(index: number, event: Event) {
    const raw = event.target instanceof HTMLInputElement ? event.target.value : '';
    if (!raw) {
      const result = otpDelete(this.current(), this.size(), this.numeric(), index);
      this.commit(result.value, result.focus);
      return;
    }
    const result = otpApply(this.current(), this.size(), this.numeric(), index, raw.slice(-1));
    this.commit(result.value, result.focus);
  }

  onPaste(index: number, event: ClipboardEvent) {
    event.preventDefault();
    const result = otpApply(
      this.current(),
      this.size(),
      this.numeric(),
      index,
      event.clipboardData?.getData('text') ?? '',
    );
    this.commit(result.value, result.focus);
  }

  onKey(index: number, event: KeyboardEvent) {
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault();
      const direction = readingDirection(
        event.currentTarget instanceof HTMLElement ? event.currentTarget : null,
      );
      const delta =
        event.key === 'ArrowRight' ? (direction === 'rtl' ? -1 : 1) : direction === 'rtl' ? 1 : -1;
      const next = Math.min(this.size() - 1, Math.max(0, index + delta));
      this.cellsRef()[next]?.nativeElement.focus();
    }
    if (event.key === 'Backspace' && !this.cells()[index]) {
      event.preventDefault();
      const result = otpDelete(this.current(), this.size(), this.numeric(), index);
      this.commit(result.value, result.focus);
    }
  }
}

@Component({
  selector: 'wpl-rating',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  imports: [Icon],
  template: `
    @if (readOnly()) {
      <div class="wpl-rating" role="img" [attr.aria-label]="readLabel()">
        @for (score of scores(); track score) {
          <span
            [class]="score <= current() ? 'wpl-rating-icon is-on' : 'wpl-rating-icon'"
            aria-hidden="true"
          >
            <wpl-icon name="star" />
          </span>
        }
      </div>
    } @else {
      <fieldset class="wpl-rating">
        <legend class="wpl-label">{{ label() }}</legend>
        @for (score of scores(); track score) {
          <label class="wpl-rating-option">
            <input
              type="radio"
              [name]="groupName()"
              [value]="score"
              [checked]="current() === score"
              (change)="choose(score)"
            />
            <span
              [class]="score <= current() ? 'wpl-rating-icon is-on' : 'wpl-rating-icon'"
              aria-hidden="true"
            >
              <wpl-icon name="star" />
            </span>
            <span class="wpl-sr-only">{{ score }} {{ ofLabel() }} {{ count() }}</span>
          </label>
        }
      </fieldset>
    }
  `,
})
export class Rating {
  readonly label = input.required<string>();
  readonly max = input(5, { transform: numberAttribute });
  readonly value = input<number>();
  readonly defaultValue = input(0, { transform: numberAttribute });
  readonly name = input<string>();
  readonly readOnly = input(false, { transform: booleanAttribute });
  readonly valueChange = output<number>();
  private readonly wpl = injectWhitePlumeria();
  private readonly internal = signal<number | null>(null);
  readonly uid = createId('wpl-rating');
  readonly count = computed(() => clampInteger(this.max(), 1, 10, 5));
  readonly scores = computed(() => Array.from({ length: this.count() }, (_, index) => index + 1));
  readonly ofLabel = computed(() => this.wpl.t('of'));

  current(): number {
    return clampInteger(this.value() ?? this.internal() ?? this.defaultValue(), 0, this.count(), 0);
  }

  groupName(): string {
    return this.name() || this.uid;
  }

  readLabel(): string {
    return `${this.label()}: ${this.current()} ${this.wpl.t('of')} ${this.count()}`;
  }

  choose(score: number) {
    if (this.value() === undefined) this.internal.set(score);
    this.valueChange.emit(score);
  }
}

@Component({
  selector: 'wpl-number-field',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  imports: [Icon],
  template: `
    <div class="wpl-field">
      <label class="wpl-label" [attr.for]="uid">{{ label() }}</label>
      <div class="wpl-number">
        <button
          type="button"
          class="wpl-number-step"
          [attr.aria-label]="decreaseLabel()"
          [disabled]="disabled() || atMin()"
          (click)="nudge(-1)"
        >
          <wpl-icon name="minus" />
        </button>
        <input
          class="wpl-input"
          type="number"
          [id]="uid"
          [name]="name()"
          [attr.inputmode]="inputMode()"
          [min]="bounds().min"
          [max]="bounds().max"
          [step]="bounds().step"
          [value]="shown()"
          [disabled]="disabled()"
          (focus)="focus()"
          (blur)="blur()"
          (input)="type($event)"
          (wheel)="wheel($event)"
        />
        <button
          type="button"
          class="wpl-number-step"
          [attr.aria-label]="increaseLabel()"
          [disabled]="disabled() || atMax()"
          (click)="nudge(1)"
        >
          <wpl-icon name="plus" />
        </button>
      </div>
    </div>
  `,
})
export class NumberField {
  readonly label = input.required<string>();
  readonly min = input(0, { transform: numberAttribute });
  readonly max = input(100, { transform: numberAttribute });
  readonly step = input(1, { transform: numberAttribute });
  readonly value = input<number>();
  readonly defaultValue = input(0, { transform: numberAttribute });
  readonly name = input<string>();
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly valueChange = output<number>();
  private readonly wpl = injectWhitePlumeria();
  private readonly internal = signal<number | null>(null);
  private readonly draft = signal('');
  private readonly focused = signal(false);
  readonly uid = createId('wpl-number');
  readonly bounds = computed(() => rangeBounds(this.min(), this.max(), this.step()));
  readonly committed = computed(() =>
    numberFieldCommit(
      String(this.value() ?? this.internal() ?? this.defaultValue()),
      this.bounds(),
      this.bounds().min,
    ),
  );
  readonly shown = computed(() =>
    this.focused() ? this.draft() : numberFieldText(this.committed(), this.bounds()),
  );
  readonly parsed = computed(
    () => numberFieldDraftValue(this.shown(), this.bounds()) ?? this.committed(),
  );
  readonly decreaseLabel = computed(() => this.wpl.t('decrease'));
  readonly increaseLabel = computed(() => this.wpl.t('increase'));
  readonly inputMode = computed(() => (this.bounds().step < 1 ? 'decimal' : 'numeric'));

  atMin(): boolean {
    return this.parsed() <= this.bounds().min;
  }

  atMax(): boolean {
    return this.parsed() >= this.bounds().max;
  }

  commit(next: number) {
    const snapped = numberFieldCommit(String(next), this.bounds(), this.bounds().min);
    this.draft.set(numberFieldText(snapped, this.bounds()));
    if (this.value() === undefined) this.internal.set(snapped);
    this.valueChange.emit(snapped);
  }

  nudge(delta: -1 | 1) {
    this.commit(numberFieldStep(this.parsed(), delta, this.bounds()));
  }

  focus() {
    this.focused.set(true);
    this.draft.set(numberFieldText(this.committed(), this.bounds()));
  }

  blur() {
    this.focused.set(false);
    this.commit(numberFieldCommit(this.draft(), this.bounds(), this.committed()));
  }

  type(event: Event) {
    const target = event.target;
    if (!(target instanceof HTMLInputElement)) return;
    this.draft.set(target.value);
    const parsed = numberFieldDraftValue(target.value, this.bounds());
    if (parsed === null) return;
    if (this.value() === undefined) this.internal.set(parsed);
    this.valueChange.emit(parsed);
  }

  wheel(event: Event) {
    const target = event.target;
    if (target instanceof HTMLInputElement) target.blur();
  }
}
