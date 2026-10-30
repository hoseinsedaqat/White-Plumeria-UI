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
import { createSignal, createUniqueId } from 'solid-js';
import { Icon } from './icon.tsx';
import { useWhitePlumeria } from './provider.tsx';

export function PasswordField(props: {
  label: string;
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  name?: string;
  autoComplete?: string;
  invalid?: boolean;
  disabled?: boolean;
  id?: string;
}) {
  const { t } = useWhitePlumeria();
  const uid = createUniqueId();
  const inputId = () => props.id ?? uid;
  const [internal, setInternal] = createSignal(props.defaultValue ?? '');
  const [visible, setVisible] = createSignal(false);
  const current = () => props.value ?? internal();

  return (
    <div class="wpl-field">
      <label class="wpl-label" for={inputId()}>
        {props.label}
      </label>
      <div class="wpl-password">
        <input
          id={inputId()}
          class="wpl-input"
          type={visible() ? 'text' : 'password'}
          name={props.name}
          value={current()}
          autocomplete={props.autoComplete ?? 'current-password'}
          disabled={props.disabled}
          aria-invalid={props.invalid || undefined}
          onInput={(event) => {
            if (props.value === undefined) setInternal(event.currentTarget.value);
            props.onValueChange?.(event.currentTarget.value);
          }}
        />
        <button
          type="button"
          class="wpl-icon-btn wpl-btn-ghost"
          aria-pressed={visible()}
          aria-label={visible() ? t('hidePassword') : t('showPassword')}
          disabled={props.disabled}
          onClick={() => setVisible((shown) => !shown)}
        >
          <Icon name={visible() ? 'eyeOff' : 'eye'} />
        </button>
      </div>
    </div>
  );
}

export function OtpField(props: {
  label: string;
  length?: number;
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  name?: string;
  numeric?: boolean;
  disabled?: boolean;
}) {
  const { t } = useWhitePlumeria();
  const uid = createUniqueId();
  const size = () => otpLength(props.length ?? 6);
  const refs: Array<HTMLInputElement | undefined> = [];
  const [internal, setInternal] = createSignal(props.defaultValue ?? '');
  const current = () => props.value ?? internal();
  const numeric = () => props.numeric !== false;
  const cells = () => otpCells(current(), size(), numeric());

  function commit(next: string, focus: number) {
    if (props.value === undefined) setInternal(next);
    props.onValueChange?.(next);
    queueMicrotask(() => refs[focus]?.focus());
  }

  return (
    <div class="wpl-field">
      <label class="wpl-label" id={`${uid}-label`}>
        {props.label}
      </label>
      <div class="wpl-otp" role="group" aria-labelledby={`${uid}-label`}>
        {cells().map((cell, index) => (
          <input
            ref={(node) => {
              refs[index] = node;
            }}
            class={inputClassName({ className: 'wpl-otp-cell' })}
            value={cell}
            inputmode={numeric() ? 'numeric' : 'text'}
            autocomplete={index === 0 ? 'one-time-code' : 'off'}
            aria-label={`${t('character')} ${index + 1} ${t('of')} ${size()}`}
            disabled={props.disabled}
            maxLength={1}
            onInput={(event) => {
              const raw = event.currentTarget.value;
              if (!raw) {
                const result = otpDelete(current(), size(), numeric(), index);
                commit(result.value, result.focus);
                return;
              }
              const result = otpApply(current(), size(), numeric(), index, raw.slice(-1));
              commit(result.value, result.focus);
            }}
            onPaste={(event) => {
              event.preventDefault();
              const result = otpApply(
                current(),
                size(),
                numeric(),
                index,
                event.clipboardData?.getData('text') ?? '',
              );
              commit(result.value, result.focus);
            }}
            onKeyDown={(event) => {
              if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
                event.preventDefault();
                const direction = readingDirection(event.currentTarget);
                const delta =
                  event.key === 'ArrowRight'
                    ? direction === 'rtl'
                      ? -1
                      : 1
                    : direction === 'rtl'
                      ? 1
                      : -1;
                refs[Math.min(size() - 1, Math.max(0, index + delta))]?.focus();
              }
              if (event.key === 'Backspace' && !cells()[index]) {
                event.preventDefault();
                const result = otpDelete(current(), size(), numeric(), index);
                commit(result.value, result.focus);
              }
            }}
          />
        ))}
      </div>
      {props.name ? <input type="hidden" name={props.name} value={current()} /> : null}
    </div>
  );
}

export function Rating(props: {
  label: string;
  max?: number;
  value?: number;
  defaultValue?: number;
  onValueChange?: (value: number) => void;
  name?: string;
  readOnly?: boolean;
}) {
  const { t } = useWhitePlumeria();
  const uid = createUniqueId();
  const count = () => clampInteger(props.max ?? 5, 1, 10, 5);
  const [internal, setInternal] = createSignal(props.defaultValue ?? 0);
  const current = () => clampInteger(props.value ?? internal(), 0, count(), 0);
  const groupName = () => props.name ?? uid;
  const stars = () => Array.from({ length: count() }, (_, index) => index + 1);

  return (
    <>
      {props.readOnly ? (
        <div
          class="wpl-rating"
          role="img"
          aria-label={`${props.label}: ${current()} ${t('of')} ${count()}`}
        >
          {stars().map((score) => (
            <span
              class={score <= current() ? 'wpl-rating-icon is-on' : 'wpl-rating-icon'}
              aria-hidden="true"
            >
              <Icon name="star" />
            </span>
          ))}
        </div>
      ) : (
        <fieldset class="wpl-rating">
          <legend class="wpl-label">{props.label}</legend>
          {stars().map((score) => (
            <label class="wpl-rating-option">
              <input
                type="radio"
                name={groupName()}
                value={score}
                checked={current() === score}
                onChange={() => {
                  if (props.value === undefined) setInternal(score);
                  props.onValueChange?.(score);
                }}
              />
              <span
                class={score <= current() ? 'wpl-rating-icon is-on' : 'wpl-rating-icon'}
                aria-hidden="true"
              >
                <Icon name="star" />
              </span>
              <span class="wpl-sr-only">
                {score} {t('of')} {count()}
              </span>
            </label>
          ))}
        </fieldset>
      )}
    </>
  );
}

export function NumberField(props: {
  label: string;
  min?: number;
  max?: number;
  step?: number;
  value?: number;
  defaultValue?: number;
  onValueChange?: (value: number) => void;
  name?: string;
  disabled?: boolean;
  id?: string;
}) {
  const { t } = useWhitePlumeria();
  const uid = createUniqueId();
  const inputId = () => props.id ?? uid;
  const bounds = () => rangeBounds(props.min ?? 0, props.max ?? 100, props.step ?? 1);
  const [internal, setInternal] = createSignal(
    numberFieldCommit(
      String(props.defaultValue ?? props.value ?? props.min ?? 0),
      bounds(),
      bounds().min,
    ),
  );
  const [draft, setDraft] = createSignal(numberFieldText(internal(), bounds()));
  const [focused, setFocused] = createSignal(false);
  const committed = () =>
    numberFieldCommit(String(props.value ?? internal()), bounds(), bounds().min);
  const shown = () => (focused() ? draft() : numberFieldText(committed(), bounds()));
  const parsed = () => numberFieldDraftValue(shown(), bounds()) ?? committed();

  function commit(next: number) {
    const snapped = numberFieldCommit(String(next), bounds(), bounds().min);
    setDraft(numberFieldText(snapped, bounds()));
    if (props.value === undefined) setInternal(snapped);
    props.onValueChange?.(snapped);
  }

  return (
    <div class="wpl-field">
      <label class="wpl-label" for={inputId()}>
        {props.label}
      </label>
      <div class="wpl-number">
        <button
          type="button"
          class="wpl-number-step"
          aria-label={t('decrease')}
          disabled={props.disabled || parsed() <= bounds().min}
          onClick={() => commit(numberFieldStep(parsed(), -1, bounds()))}
        >
          <Icon name="minus" />
        </button>
        <input
          id={inputId()}
          class="wpl-input"
          type="number"
          name={props.name}
          inputMode={bounds().step < 1 ? 'decimal' : 'numeric'}
          min={bounds().min}
          max={bounds().max}
          step={bounds().step}
          value={shown()}
          disabled={props.disabled}
          onFocus={() => {
            setFocused(true);
            setDraft(numberFieldText(committed(), bounds()));
          }}
          onBlur={() => {
            setFocused(false);
            commit(numberFieldCommit(draft(), bounds(), committed()));
          }}
          onInput={(event) => {
            const next = event.currentTarget.value;
            setDraft(next);
            const parsedNext = numberFieldDraftValue(next, bounds());
            if (parsedNext === null) return;
            if (props.value === undefined) setInternal(parsedNext);
            props.onValueChange?.(parsedNext);
          }}
          onWheel={(event) => event.currentTarget.blur()}
        />
        <button
          type="button"
          class="wpl-number-step"
          aria-label={t('increase')}
          disabled={props.disabled || parsed() >= bounds().max}
          onClick={() => commit(numberFieldStep(parsed(), 1, bounds()))}
        >
          <Icon name="plus" />
        </button>
      </div>
    </div>
  );
}
