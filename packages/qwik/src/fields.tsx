import {
  clampInteger,
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
import { component$, useId, useSignal, type QRL } from '@qwik.dev/core';
import { Icon } from './icon';
import { useWhitePlumeria } from './provider';

export const PasswordField = component$<{
  label: string;
  value?: string;
  defaultValue?: string;
  name?: string;
  autoComplete?: string;
  invalid?: boolean;
  disabled?: boolean;
  id?: string;
  onValueChange$?: QRL<(value: string) => void>;
}>((props) => {
  const wpl = useWhitePlumeria();
  const uid = useId();
  const inputId = props.id ?? uid;
  const internal = useSignal(props.defaultValue ?? '');
  const visible = useSignal(false);
  const current = props.value ?? internal.value;
  return (
    <div class="wpl-field">
      <label class="wpl-label" for={inputId}>
        {props.label}
      </label>
      <div class="wpl-password">
        <input
          id={inputId}
          class="wpl-input"
          type={visible.value ? 'text' : 'password'}
          name={props.name}
          value={current}
          autoComplete={props.autoComplete ?? 'current-password'}
          disabled={props.disabled}
          aria-invalid={props.invalid || undefined}
          onInput$={(_, element) => {
            if (props.value === undefined) internal.value = element.value;
            void props.onValueChange$?.(element.value);
          }}
        />
        <button
          type="button"
          class="wpl-icon-btn wpl-btn-ghost"
          aria-pressed={visible.value}
          aria-label={visible.value ? wpl.t('hidePassword') : wpl.t('showPassword')}
          disabled={props.disabled}
          onClick$={() => {
            visible.value = !visible.value;
          }}
        >
          <Icon name={visible.value ? 'eyeOff' : 'eye'} />
        </button>
      </div>
    </div>
  );
});

export const OtpField = component$<{
  label: string;
  length?: number;
  value?: string;
  defaultValue?: string;
  name?: string;
  numeric?: boolean;
  disabled?: boolean;
  onValueChange$?: QRL<(value: string) => void>;
}>((props) => {
  const wpl = useWhitePlumeria();
  const uid = useId();
  const size = otpLength(props.length ?? 6);
  const numeric = props.numeric ?? true;
  const refs = useSignal<Array<HTMLInputElement | undefined>>([]);
  const internal = useSignal(props.defaultValue ?? '');
  const current = props.value ?? internal.value;
  const cells = otpCells(current, size, numeric);

  return (
    <div class="wpl-field">
      <label class="wpl-label" id={`${uid}-label`}>
        {props.label}
      </label>
      <div class="wpl-otp" role="group" aria-labelledby={`${uid}-label`}>
        {cells.map((cell, index) => (
          <input
            key={index}
            ref={(element) => {
              refs.value[index] = element;
            }}
            class={inputClassName({ className: 'wpl-otp-cell' })}
            value={cell}
            inputMode={numeric ? 'numeric' : 'text'}
            autoComplete={index === 0 ? 'one-time-code' : 'off'}
            aria-label={`${wpl.t('character')} ${index + 1} ${wpl.t('of')} ${size}`}
            disabled={props.disabled}
            maxLength={1}
            onInput$={(_, element) => {
              const raw = element.value;
              const result = raw
                ? otpApply(current, size, numeric, index, raw.slice(-1))
                : otpDelete(current, size, numeric, index);
              if (props.value === undefined) internal.value = result.value;
              void props.onValueChange$?.(result.value);
              queueMicrotask(() => refs.value[result.focus]?.focus());
            }}
            preventdefault:paste
            onPaste$={(event) => {
              const result = otpApply(
                current,
                size,
                numeric,
                index,
                event.clipboardData?.getData('text') ?? '',
              );
              if (props.value === undefined) internal.value = result.value;
              void props.onValueChange$?.(result.value);
              queueMicrotask(() => refs.value[result.focus]?.focus());
            }}
            onKeyDown$={(event, element) => {
              if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
                event.preventDefault();
                const direction = readingDirection(element);
                const delta =
                  event.key === 'ArrowRight'
                    ? direction === 'rtl'
                      ? -1
                      : 1
                    : direction === 'rtl'
                      ? 1
                      : -1;
                refs.value[Math.min(size - 1, Math.max(0, index + delta))]?.focus();
              }
              if (event.key === 'Backspace' && !cells[index]) {
                event.preventDefault();
                const result = otpDelete(current, size, numeric, index);
                if (props.value === undefined) internal.value = result.value;
                void props.onValueChange$?.(result.value);
                queueMicrotask(() => refs.value[result.focus]?.focus());
              }
            }}
          />
        ))}
      </div>
      {props.name ? <input type="hidden" name={props.name} value={current} /> : null}
    </div>
  );
});

export const Rating = component$<{
  label: string;
  max?: number;
  value?: number;
  defaultValue?: number;
  name?: string;
  readOnly?: boolean;
  onValueChange$?: QRL<(value: number) => void>;
}>((props) => {
  const wpl = useWhitePlumeria();
  const uid = useId();
  const count = clampInteger(props.max ?? 5, 1, 10, 5);
  const internal = useSignal(props.defaultValue ?? 0);
  const current = clampInteger(props.value ?? internal.value, 0, count, 0);
  const groupName = props.name ?? uid;
  if (props.readOnly) {
    return (
      <div
        class="wpl-rating"
        role="img"
        aria-label={`${props.label}: ${current} ${wpl.t('of')} ${count}`}
      >
        {Array.from({ length: count }, (_, index) => (
          <span
            key={index}
            class={index < current ? 'wpl-rating-icon is-on' : 'wpl-rating-icon'}
            aria-hidden="true"
          >
            <Icon name="star" />
          </span>
        ))}
      </div>
    );
  }
  return (
    <fieldset class="wpl-rating">
      <legend class="wpl-label">{props.label}</legend>
      {Array.from({ length: count }, (_, index) => {
        const score = index + 1;
        return (
          <label key={score} class="wpl-rating-option">
            <input
              type="radio"
              name={groupName}
              value={score}
              checked={current === score}
              onChange$={() => {
                if (props.value === undefined) internal.value = score;
                void props.onValueChange$?.(score);
              }}
            />
            <span
              class={score <= current ? 'wpl-rating-icon is-on' : 'wpl-rating-icon'}
              aria-hidden="true"
            >
              <Icon name="star" />
            </span>
            <span class="wpl-sr-only">
              {score} {wpl.t('of')} {count}
            </span>
          </label>
        );
      })}
    </fieldset>
  );
});

export const NumberField = component$<{
  label: string;
  min?: number;
  max?: number;
  step?: number;
  value?: number;
  defaultValue?: number;
  name?: string;
  disabled?: boolean;
  id?: string;
  onValueChange$?: QRL<(value: number) => void>;
}>((props) => {
  const wpl = useWhitePlumeria();
  const uid = useId();
  const inputId = props.id ?? uid;
  const bounds = rangeBounds(props.min ?? 0, props.max ?? 100, props.step ?? 1);
  const internal = useSignal(
    numberFieldCommit(String(props.defaultValue ?? props.value ?? bounds.min), bounds, bounds.min),
  );
  const draft = useSignal(numberFieldText(internal.value, bounds));
  const focused = useSignal(false);
  const committed = numberFieldCommit(String(props.value ?? internal.value), bounds, bounds.min);
  const shown = focused.value ? draft.value : numberFieldText(committed, bounds);
  const parsed = numberFieldDraftValue(shown, bounds) ?? committed;

  return (
    <div class="wpl-field">
      <label class="wpl-label" for={inputId}>
        {props.label}
      </label>
      <div class="wpl-number">
        <button
          type="button"
          class="wpl-number-step"
          aria-label={wpl.t('decrease')}
          disabled={props.disabled || parsed <= bounds.min}
          onClick$={() => {
            const next = numberFieldStep(parsed, -1, bounds);
            const snapped = numberFieldCommit(String(next), bounds, bounds.min);
            draft.value = numberFieldText(snapped, bounds);
            if (props.value === undefined) internal.value = snapped;
            void props.onValueChange$?.(snapped);
          }}
        >
          <Icon name="minus" />
        </button>
        <input
          id={inputId}
          class="wpl-input"
          type="number"
          name={props.name}
          inputMode={bounds.step < 1 ? 'decimal' : 'numeric'}
          min={bounds.min}
          max={bounds.max}
          step={bounds.step}
          value={shown}
          disabled={props.disabled}
          onFocus$={() => {
            focused.value = true;
            draft.value = numberFieldText(committed, bounds);
          }}
          onBlur$={(_, element) => {
            focused.value = false;
            const next = numberFieldCommit(element.value, bounds, committed);
            draft.value = numberFieldText(next, bounds);
            if (props.value === undefined) internal.value = next;
            void props.onValueChange$?.(next);
          }}
          onInput$={(_, element) => {
            draft.value = element.value;
            const parsedNext = numberFieldDraftValue(element.value, bounds);
            if (parsedNext === null) return;
            if (props.value === undefined) internal.value = parsedNext;
            void props.onValueChange$?.(parsedNext);
          }}
          onWheel$={(_, element) => element.blur()}
        />
        <button
          type="button"
          class="wpl-number-step"
          aria-label={wpl.t('increase')}
          disabled={props.disabled || parsed >= bounds.max}
          onClick$={() => {
            const next = numberFieldStep(parsed, 1, bounds);
            const snapped = numberFieldCommit(String(next), bounds, bounds.min);
            draft.value = numberFieldText(snapped, bounds);
            if (props.value === undefined) internal.value = snapped;
            void props.onValueChange$?.(snapped);
          }}
        >
          <Icon name="plus" />
        </button>
      </div>
    </div>
  );
});
