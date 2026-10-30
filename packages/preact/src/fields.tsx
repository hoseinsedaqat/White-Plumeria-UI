import {
  clampInteger,
  inputClassName,
  otpApply,
  otpCells,
  otpDelete,
  otpLength,
  readingDirection,
} from '@white-plumeria/core';
import type { JSX, TargetedInputEvent } from 'preact';
import { useId, useRef, useState } from 'preact/hooks';
import { Icon } from './icon.tsx';
import { useWhitePlumeria } from './provider.tsx';

export function PasswordField({
  label,
  value,
  defaultValue = '',
  onValueChange,
  name,
  autoComplete = 'current-password',
  invalid = false,
  disabled = false,
  id,
}: {
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
  const uid = useId();
  const inputId = id ?? uid;
  const [internal, setInternal] = useState(defaultValue);
  const [visible, setVisible] = useState(false);
  const current = value ?? internal;

  return (
    <div className="wpl-field">
      <label className="wpl-label" htmlFor={inputId}>
        {label}
      </label>
      <div className="wpl-password">
        <input
          {...({
            id: inputId,
            className: 'wpl-input',
            type: visible ? 'text' : 'password',
            name,
            value: current,
            autoComplete,
            disabled,
            'aria-invalid': invalid || undefined,
            onInput: (event: TargetedInputEvent<HTMLInputElement>) => {
              const next = event.currentTarget.value;
              if (value === undefined) setInternal(next);
              onValueChange?.(next);
            },
          } as JSX.IntrinsicElements['input'])}
        />
        <button
          type="button"
          className="wpl-icon-btn wpl-btn-ghost"
          aria-pressed={visible}
          aria-label={visible ? t('hidePassword') : t('showPassword')}
          disabled={disabled}
          onClick={() => setVisible((shown) => !shown)}
        >
          <Icon name={visible ? 'eyeOff' : 'eye'} />
        </button>
      </div>
    </div>
  );
}

export function OtpField({
  label,
  length = 6,
  value,
  defaultValue = '',
  onValueChange,
  name,
  numeric = true,
  disabled = false,
}: {
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
  const uid = useId();
  const size = otpLength(length);
  const refs = useRef<Array<HTMLInputElement | null>>([]);
  const [internal, setInternal] = useState(defaultValue);
  const current = value ?? internal;
  const cells = otpCells(current, size, numeric);

  function commit(next: string, focus: number) {
    if (value === undefined) setInternal(next);
    onValueChange?.(next);
    queueMicrotask(() => refs.current[focus]?.focus());
  }

  return (
    <div className="wpl-field">
      <label className="wpl-label" id={`${uid}-label`}>
        {label}
      </label>
      <div className="wpl-otp" role="group" aria-labelledby={`${uid}-label`}>
        {cells.map((cell, index) => (
          <input
            key={index}
            ref={(node) => {
              refs.current[index] = node;
            }}
            className={inputClassName({ className: 'wpl-otp-cell' })}
            value={cell}
            inputMode={numeric ? 'numeric' : 'text'}
            autoComplete={index === 0 ? 'one-time-code' : 'off'}
            aria-label={`${t('character')} ${index + 1} ${t('of')} ${size}`}
            disabled={disabled}
            maxLength={1}
            onInput={(event) => {
              const raw = event.currentTarget.value;
              if (!raw) {
                const result = otpDelete(current, size, numeric, index);
                commit(result.value, result.focus);
                return;
              }
              const result = otpApply(current, size, numeric, index, raw.slice(-1));
              commit(result.value, result.focus);
            }}
            onPaste={(event) => {
              event.preventDefault();
              const result = otpApply(
                current,
                size,
                numeric,
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
                refs.current[Math.min(size - 1, Math.max(0, index + delta))]?.focus();
              }
              if (event.key === 'Backspace' && !cells[index]) {
                event.preventDefault();
                const result = otpDelete(current, size, numeric, index);
                commit(result.value, result.focus);
              }
            }}
          />
        ))}
      </div>
      {name ? <input type="hidden" name={name} value={current} /> : null}
    </div>
  );
}

export function Rating({
  label,
  max = 5,
  value,
  defaultValue = 0,
  onValueChange,
  name,
  readOnly = false,
}: {
  label: string;
  max?: number;
  value?: number;
  defaultValue?: number;
  onValueChange?: (value: number) => void;
  name?: string;
  readOnly?: boolean;
}) {
  const { t } = useWhitePlumeria();
  const uid = useId();
  const count = clampInteger(max, 1, 10, 5);
  const [internal, setInternal] = useState(defaultValue);
  const current = clampInteger(value ?? internal, 0, count, 0);
  const groupName = name ?? uid;

  if (readOnly) {
    return (
      <div
        className="wpl-rating"
        role="img"
        aria-label={`${label}: ${current} ${t('of')} ${count}`}
      >
        {Array.from({ length: count }, (_, index) => (
          <span
            key={index}
            className={index < current ? 'wpl-rating-icon is-on' : 'wpl-rating-icon'}
            aria-hidden="true"
          >
            <Icon name="star" />
          </span>
        ))}
      </div>
    );
  }

  return (
    <fieldset className="wpl-rating">
      <legend className="wpl-label">{label}</legend>
      {Array.from({ length: count }, (_, index) => {
        const score = index + 1;
        return (
          <label key={score} className="wpl-rating-option">
            <input
              type="radio"
              name={groupName}
              value={score}
              checked={current === score}
              onChange={() => {
                if (value === undefined) setInternal(score);
                onValueChange?.(score);
              }}
            />
            <span
              className={score <= current ? 'wpl-rating-icon is-on' : 'wpl-rating-icon'}
              aria-hidden="true"
            >
              <Icon name="star" />
            </span>
            <span className="wpl-sr-only">
              {score} {t('of')} {count}
            </span>
          </label>
        );
      })}
    </fieldset>
  );
}
