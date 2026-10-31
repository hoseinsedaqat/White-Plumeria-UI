import {
  clampRangeEdge,
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
import { createContext, createSignal, splitProps, useContext, type JSX , createUniqueId } from 'solid-js';
import { Icon } from './icon.tsx';
import { useWhitePlumeria } from './provider.tsx';

interface FieldContextValue {
  id: string;
  describedBy?: string;
  invalid: boolean;
  required: boolean;
  disabled: boolean;
}

const FieldContext = createContext<FieldContextValue>();

export function useField(): FieldContextValue | undefined {
  return useContext(FieldContext);
}

export function Label(props: { for?: string; htmlFor?: string; required?: boolean; children: JSX.Element; class?: string; className?: string }) {
  const { t } = useWhitePlumeria();
  return (
    <label class={cx('wpl-label', props.class, props.className)} for={props.for ?? props.htmlFor}>
      {props.children}
      {props.required ? (
        <>
          <span class="wpl-required" aria-hidden="true">
            *
          </span>
          <span class="wpl-sr-only">{t('required')}</span>
        </>
      ) : null}
    </label>
  );
}

export function FormMessage(props: { tone?: 'hint' | 'error'; id?: string; children: JSX.Element }) {
  return (
    <p id={props.id} class={props.tone === 'error' ? 'wpl-field-error' : 'wpl-field-hint'} role={props.tone === 'error' ? 'alert' : undefined}>
      {props.children}
    </p>
  );
}

export function ValidationMessage(props: { id?: string; children: JSX.Element }) {
  return (
    <FormMessage tone="error" id={props.id}>
      {props.children}
    </FormMessage>
  );
}

export function FormField(props: {
  label: string;
  hint?: string;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  children: JSX.Element;
  class?: string;
}) {
  const id = `wpl-field-${createUniqueId()}`;
  const hintId = () => (props.hint ? `${id}-hint` : undefined);
  const errorId = () => (props.error ? `${id}-error` : undefined);
  const describedBy = () => [hintId(), errorId()].filter(Boolean).join(' ') || undefined;
  return (
    <FieldContext.Provider
      value={{
        get id() {
          return id;
        },
        get describedBy() {
          return describedBy();
        },
        get invalid() {
          return Boolean(props.error);
        },
        get required() {
          return Boolean(props.required);
        },
        get disabled() {
          return Boolean(props.disabled);
        },
      }}
    >
      <div class={fieldClassName(Boolean(props.error), props.class)}>
        <Label for={id} required={props.required}>
          {props.label}
        </Label>
        {props.children}
        {props.hint ? <FormMessage id={hintId()}>{props.hint}</FormMessage> : null}
        {props.error ? <ValidationMessage id={errorId()}>{props.error}</ValidationMessage> : null}
      </div>
    </FieldContext.Provider>
  );
}

type InputProps = Omit<JSX.InputHTMLAttributes<HTMLInputElement>, 'size'> & {
  size?: ControlSize;
  invalid?: boolean;
};

export function Input(props: InputProps) {
  const [local, rest] = splitProps(props, ['size', 'invalid', 'class', 'id', 'required', 'disabled']);
  const field = useField();
  return (
    <input
      {...rest}
      id={local.id ?? field?.id}
      class={inputClassName({ size: local.size ?? 'md', className: local.class })}
      aria-invalid={local.invalid || field?.invalid || undefined}
      aria-describedby={rest['aria-describedby'] ?? field?.describedBy}
      aria-required={local.required || field?.required || undefined}
      required={local.required || field?.required}
      disabled={local.disabled || field?.disabled}
    />
  );
}

export function Textarea(props: JSX.TextareaHTMLAttributes<HTMLTextAreaElement> & { size?: ControlSize; invalid?: boolean }) {
  const [local, rest] = splitProps(props, ['size', 'invalid', 'class', 'id', 'required', 'disabled', 'rows']);
  const field = useField();
  return (
    <textarea
      {...rest}
      id={local.id ?? field?.id}
      rows={local.rows ?? 4}
      class={textareaClassName({ size: local.size ?? 'md', className: local.class })}
      aria-invalid={local.invalid || field?.invalid || undefined}
      aria-describedby={rest['aria-describedby'] ?? field?.describedBy}
      required={local.required || field?.required}
      disabled={local.disabled || field?.disabled}
    />
  );
}

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export function Select(
  props: Omit<JSX.SelectHTMLAttributes<HTMLSelectElement>, 'size'> & {
    size?: ControlSize;
    invalid?: boolean;
    options?: SelectOption[];
    placeholder?: string;
  },
) {
  const [local, rest] = splitProps(props, ['size', 'invalid', 'class', 'id', 'options', 'placeholder', 'children', 'required', 'disabled']);
  const field = useField();
  return (
    <select
      {...rest}
      id={local.id ?? field?.id}
      class={selectClassName({ size: local.size ?? 'md', className: local.class })}
      aria-invalid={local.invalid || field?.invalid || undefined}
      aria-describedby={rest['aria-describedby'] ?? field?.describedBy}
      required={local.required || field?.required}
      disabled={local.disabled || field?.disabled}
    >
      {local.placeholder ? <option value="">{local.placeholder}</option> : null}
      {local.options?.map((option) => (
        <option value={option.value} disabled={option.disabled}>
          {option.label}
        </option>
      ))}
      {local.children}
    </select>
  );
}

export function Checkbox(
  props: Omit<JSX.InputHTMLAttributes<HTMLInputElement>, 'type' | 'size'> & {
    label: string;
    onCheckedChange?: (checked: boolean) => void;
  },
) {
  const [local, rest] = splitProps(props, ['label', 'onCheckedChange', 'onChange']);
  return (
    <label class="wpl-check">
      <input
        {...rest}
        type="checkbox"
        onChange={(event) => {
          if (typeof local.onChange === 'function') local.onChange(event);
          local.onCheckedChange?.(event.currentTarget.checked);
        }}
      />
      <span>{local.label}</span>
    </label>
  );
}

export function RadioGroup(props: {
  label: string;
  name: string;
  options: SelectOption[];
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
}) {
  return (
    <fieldset class="wpl-field">
      <legend class="wpl-label">{props.label}</legend>
      {props.options.map((option) => (
        <label class="wpl-radio">
          <input
            type="radio"
            name={props.name}
            value={option.value}
            checked={props.value !== undefined ? props.value === option.value : props.defaultValue === option.value}
            disabled={option.disabled}
            onChange={() => props.onValueChange?.(option.value)}
          />
          <span>{option.label}</span>
        </label>
      ))}
    </fieldset>
  );
}

export function Switch(
  props: Omit<JSX.InputHTMLAttributes<HTMLInputElement>, 'type' | 'size'> & {
    label: string;
    onCheckedChange?: (checked: boolean) => void;
  },
) {
  const [local, rest] = splitProps(props, ['label', 'onCheckedChange', 'onChange']);
  return (
    <label class="wpl-switch">
      <input
        {...rest}
        type="checkbox"
        role="switch"
        onChange={(event) => {
          if (typeof local.onChange === 'function') local.onChange(event);
          local.onCheckedChange?.(event.currentTarget.checked);
        }}
      />
      <span class="wpl-switch-track" aria-hidden="true" />
      <span>{local.label}</span>
    </label>
  );
}

export function Slider(props: {
  label: string;
  min?: number;
  max?: number;
  step?: number;
  value?: number;
  defaultValue?: number;
  onValueChange?: (value: number) => void;
  id?: string;
}) {
  const inputId = props.id ?? createUniqueId();
  const { locale } = useWhitePlumeria();
  const min = () => props.min ?? 0;
  const [internal, setInternal] = createSignal(props.defaultValue ?? min());
  const current = () => props.value ?? internal();
  return (
    <div class="wpl-field">
      <div class="wpl-flex wpl-flex-between">
        <label class="wpl-label" for={inputId}>
          {props.label}
        </label>
        <output id={`${inputId}-value`} for={inputId}>
          {formatNumber(current(), locale())}
        </output>
      </div>
      <input
        id={inputId}
        class="wpl-slider"
        type="range"
        min={min()}
        max={props.max ?? 100}
        step={props.step ?? 1}
        value={current()}
        aria-valuetext={formatNumber(current(), locale())}
        onInput={(event) => {
          const next = Number(event.currentTarget.value);
          if (props.value === undefined) setInternal(next);
          props.onValueChange?.(next);
        }}
      />
    </div>
  );
}

export function RangeSlider(props: {
  label: string;
  min?: number;
  max?: number;
  step?: number;
  start?: number;
  end?: number;
  defaultStart?: number;
  defaultEnd?: number;
  disabled?: boolean;
  name?: string;
  onValueChange?: (value: NumberRange) => void;
}) {
  const uid = createUniqueId();
  const { locale } = useWhitePlumeria();
  const bounds = () => rangeBounds(props.min ?? 0, props.max ?? 100, props.step ?? 1);
  const [internal, setInternal] = createSignal<NumberRange>(
    normalizeRange(props.defaultStart ?? props.min ?? 0, props.defaultEnd ?? props.max ?? 100, rangeBounds(props.min ?? 0, props.max ?? 100, props.step ?? 1)),
  );
  const current = () =>
    props.start !== undefined
      ? normalizeRange(props.start, props.end ?? bounds().max, bounds())
      : normalizeRange(internal().start, internal().end, bounds());
  const fill = () => rangeFill(current(), bounds());
  let startRef: HTMLInputElement | undefined;
  let endRef: HTMLInputElement | undefined;

  function commit(edge: 'start' | 'end', next: number) {
    const ordered = clampRangeEdge(edge, next, current(), bounds());
    if (props.start === undefined) setInternal(ordered);
    props.onValueChange?.(ordered);
  }

  return (
    <div class="wpl-field">
      <div class="wpl-flex wpl-flex-between">
        <span class="wpl-label" id={`${uid}-label`}>
          {props.label}
        </span>
        <output class="wpl-range-readout" aria-hidden="true">
          {formatNumber(current().start, locale())} – {formatNumber(current().end, locale())}
        </output>
      </div>
      <div
        class="wpl-range"
        role="group"
        aria-labelledby={`${uid}-label`}
        data-disabled={props.disabled ? 'true' : undefined}
        style={{ '--wpl-range-start': fill().start, '--wpl-range-size': fill().size }}
        onPointerDown={(event) => {
          if (props.disabled || event.target instanceof HTMLInputElement) return;
          const rect = event.currentTarget.getBoundingClientRect();
          const direction = getComputedStyle(event.currentTarget).direction === 'rtl' ? 'rtl' : 'ltr';
          const value = valueFromPointer(event.clientX, rect.left, rect.width, bounds(), direction);
          const edge = nearerEdge(value, current());
          commit(edge, value);
          (edge === 'start' ? startRef : endRef)?.focus();
        }}
      >
        <span class="wpl-range-track" aria-hidden="true" />
        <span class="wpl-range-fill" aria-hidden="true" />
        <input
          ref={startRef}
          id={`${uid}-start`}
          class="wpl-range-input"
          type="range"
          min={bounds().min}
          max={bounds().max}
          step={bounds().step}
          value={current().start}
          disabled={props.disabled}
          name={props.name ? `${props.name}-start` : undefined}
          aria-label={`${props.label} start`}
          aria-valuetext={formatNumber(current().start, locale())}
          onInput={(event) => commit('start', Number(event.currentTarget.value))}
        />
        <input
          ref={endRef}
          id={`${uid}-end`}
          class="wpl-range-input"
          data-edge="end"
          type="range"
          min={bounds().min}
          max={bounds().max}
          step={bounds().step}
          value={current().end}
          disabled={props.disabled}
          name={props.name ? `${props.name}-end` : undefined}
          aria-label={`${props.label} end`}
          aria-valuetext={formatNumber(current().end, locale())}
          onInput={(event) => commit('end', Number(event.currentTarget.value))}
        />
      </div>
    </div>
  );
}

export function NumberField(props: {
  label: string;
  value?: number;
  defaultValue?: number;
  min?: number;
  max?: number;
  step?: number;
  onValueChange?: (value: number) => void;
  disabled?: boolean;
  name?: string;
}) {
  const [internal, setInternal] = createSignal(props.defaultValue ?? props.min ?? 0);
  const value = () => props.value ?? internal();
  const step = () => props.step ?? 1;
  function commit(next: number) {
    const bounded = Math.min(props.max ?? next, Math.max(props.min ?? next, next));
    setInternal(bounded);
    props.onValueChange?.(bounded);
  }
  return (
    <div class="wpl-number">
      <label for={props.name}>{props.label}</label>
      <div class="wpl-number-control">
        <button type="button" aria-label="Decrease" disabled={props.disabled} onClick={() => commit(value() - step())}>
          −
        </button>
        <input
          id={props.name}
          name={props.name}
          type="number"
          value={value()}
          min={props.min}
          max={props.max}
          step={step()}
          disabled={props.disabled}
          onInput={(event) => commit(Number(event.currentTarget.value))}
        />
        <button type="button" aria-label="Increase" disabled={props.disabled} onClick={() => commit(value() + step())}>
          +
        </button>
      </div>
    </div>
  );
}

export function PasswordInput(
  props: Omit<JSX.InputHTMLAttributes<HTMLInputElement>, 'type' | 'size'> & { size?: ControlSize },
) {
  const [visible, setVisible] = createSignal(false);
  const { t } = useWhitePlumeria();
  const [local, rest] = splitProps(props, ['size', 'class']);
  return (
    <div class="wpl-password">
      <input {...rest} type={visible() ? 'text' : 'password'} class={inputClassName({ size: local.size ?? 'md', className: local.class })} />
        <button type="button" class="wpl-password-toggle" aria-pressed={visible()} onClick={() => setVisible((current) => !current)}>
        <Icon name={visible() ? 'eyeOff' : 'eye'} />
        <span class="wpl-sr-only">{visible() ? t('hidePassword') : t('showPassword')}</span>
      </button>
    </div>
  );
}

export function SearchInput(props: {
  label: string;
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  onSearch?: (value: string) => void;
  placeholder?: string;
  visuallyHiddenLabel?: boolean;
}) {
  const id = createUniqueId();
  const { t } = useWhitePlumeria();
  const [internal, setInternal] = createSignal(props.defaultValue ?? '');
  const current = () => props.value ?? internal();
  function commit(next: string) {
    if (props.value === undefined) setInternal(next);
    props.onValueChange?.(next);
  }
  return (
    <div class="wpl-search">
      <label class={cx('wpl-label', props.visuallyHiddenLabel && 'wpl-sr-only')} for={id}>
        {props.label}
      </label>
      <div class="wpl-search-control">
        <span class="wpl-search-icon" aria-hidden="true">
          <Icon name="search" />
        </span>
        <input
          id={id}
          class="wpl-input"
          type="search"
          value={current()}
          placeholder={props.placeholder}
          onInput={(event) => commit(event.currentTarget.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') props.onSearch?.(current());
          }}
        />
        {current() ? (
          <button type="button" class="wpl-icon-btn wpl-icon-btn-sm wpl-btn-ghost wpl-search-clear" aria-label={t('clear')} onClick={() => commit('')}>
            <Icon name="close" />
          </button>
        ) : null}
      </div>
    </div>
  );
}

export function ToggleGroup(props: {
  label: string;
  options: SelectOption[];
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  name?: string;
  hideLabel?: boolean;
  disabled?: boolean;
}) {
  const labelId = createUniqueId();
  const [internal, setInternal] = createSignal(props.defaultValue ?? '');
  const current = () => (props.value !== undefined ? props.value : internal());
  function commit(next: string) {
    if (props.value === undefined) setInternal(next);
    props.onValueChange?.(next);
  }
  function onKey(event: KeyboardEvent) {
    const options = props.options;
    const selected = options.findIndex((option) => option.value === current());
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
    commit(option.value);
    const group =
      event.currentTarget instanceof HTMLElement ? event.currentTarget.parentElement : null;
    queueMicrotask(() =>
      group?.querySelectorAll<HTMLButtonElement>('[role="radio"]')[next]?.focus(),
    );
  }
  const group = (
    <div
      class="wpl-toggle"
      role="radiogroup"
      aria-label={props.hideLabel ? props.label : undefined}
      aria-labelledby={props.hideLabel ? undefined : labelId}
    >
      {props.options.map((option, index) => {
        const checked = () => option.value === current();
        const tabbable = () => {
          if (option.disabled || props.disabled) return false;
          if (checked()) return true;
          const selected = props.options.findIndex(
            (item) => item.value === current() && !item.disabled,
          );
          return selected < 0 && index === props.options.findIndex((item) => !item.disabled);
        };
        return (
          <button
            type="button"
            class="wpl-toggle-item"
            role="radio"
            aria-checked={checked()}
            disabled={props.disabled || option.disabled}
            tabIndex={tabbable() ? 0 : -1}
            onClick={() => commit(option.value)}
            onKeyDown={onKey}
          >
            {option.label}
          </button>
        );
      })}
      {props.name ? <input type="hidden" name={props.name} value={current()} /> : null}
    </div>
  );
  return props.hideLabel ? (
    group
  ) : (
    <div class="wpl-field">
      <span id={labelId} class="wpl-label">
        {props.label}
      </span>
      {group}
    </div>
  );
}
