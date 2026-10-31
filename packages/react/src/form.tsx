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
  type NumberRange,
} from '@white-plumeria/core';
import type { ControlSize } from '@white-plumeria/core';
import {
  createContext,
  forwardRef,
  useContext,
  useId,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
  type PointerEvent as ReactPointerEvent,
  type InputHTMLAttributes,
  type ReactNode,
  type SelectHTMLAttributes,
  type TextareaHTMLAttributes,
} from 'react';
import { Icon } from './icon.tsx';
import { useWhitePlumeria } from './provider.tsx';

interface FieldContextValue {
  id: string;
  describedBy?: string;
  invalid: boolean;
  required: boolean;
  disabled: boolean;
}

const FieldContext = createContext<FieldContextValue | null>(null);

export function useField(): FieldContextValue | null {
  return useContext(FieldContext);
}

export function Label({
  htmlFor,
  required = false,
  children,
  className,
}: {
  htmlFor?: string;
  required?: boolean;
  children: ReactNode;
  className?: string;
}) {
  const { t } = useWhitePlumeria();
  return (
    <label className={cx('wpl-label', className)} htmlFor={htmlFor}>
      {children}
      {required ? (
        <>
          <span className="wpl-required" aria-hidden="true">
            *
          </span>
          <span className="wpl-sr-only">{t('required')}</span>
        </>
      ) : null}
    </label>
  );
}

export function FormMessage({
  tone = 'hint',
  id,
  children,
}: {
  tone?: 'hint' | 'error';
  id?: string;
  children: ReactNode;
}) {
  return (
    <p id={id} className={tone === 'error' ? 'wpl-field-error' : 'wpl-field-hint'} role={tone === 'error' ? 'alert' : undefined}>
      {children}
    </p>
  );
}

export function ValidationMessage({ id, children }: { id?: string; children: ReactNode }) {
  return (
    <FormMessage tone="error" id={id}>
      {children}
    </FormMessage>
  );
}

export function FormField({
  label,
  hint,
  error,
  required = false,
  disabled = false,
  children,
  className,
}: {
  label: string;
  hint?: string;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  children: ReactNode;
  className?: string;
}) {
  const uid = useId();
  const id = `wpl-field-${uid}`;
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(' ') || undefined;
  return (
    <FieldContext.Provider
      value={{ id, describedBy, invalid: Boolean(error), required, disabled }}
    >
      <div className={fieldClassName(Boolean(error), className)}>
        <Label htmlFor={id} required={required}>
          {label}
        </Label>
        {children}
        {hint ? <FormMessage id={hintId}>{hint}</FormMessage> : null}
        {error ? <ValidationMessage id={errorId}>{error}</ValidationMessage> : null}
      </div>
    </FieldContext.Provider>
  );
}

type InputProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> & {
  size?: ControlSize;
  invalid?: boolean;
};

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { size = 'md', invalid = false, className, id, required, disabled, ...rest },
  ref,
) {
  const field = useField();
  return (
    <input
      ref={ref}
      id={id ?? field?.id}
      className={inputClassName({ size, className })}
      aria-invalid={invalid || field?.invalid || undefined}
      aria-describedby={rest['aria-describedby'] ?? field?.describedBy}
      aria-required={required || field?.required || undefined}
      required={required || field?.required}
      disabled={disabled || field?.disabled}
      {...rest}
    />
  );
});

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  size?: ControlSize;
  invalid?: boolean;
};

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { size = 'md', invalid = false, className, id, required, disabled, rows = 4, ...rest },
  ref,
) {
  const field = useField();
  return (
    <textarea
      ref={ref}
      id={id ?? field?.id}
      rows={rows}
      className={textareaClassName({ size, className })}
      aria-invalid={invalid || field?.invalid || undefined}
      aria-describedby={rest['aria-describedby'] ?? field?.describedBy}
      required={required || field?.required}
      disabled={disabled || field?.disabled}
      {...rest}
    />
  );
});

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

type SelectProps = Omit<SelectHTMLAttributes<HTMLSelectElement>, 'size'> & {
  size?: ControlSize;
  invalid?: boolean;
  options?: SelectOption[];
  placeholder?: string;
};

export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { size = 'md', invalid = false, className, id, options, placeholder, children, required, disabled, ...rest },
  ref,
) {
  const field = useField();
  return (
    <select
      ref={ref}
      id={id ?? field?.id}
      className={selectClassName({ size, className })}
      aria-invalid={invalid || field?.invalid || undefined}
      aria-describedby={rest['aria-describedby'] ?? field?.describedBy}
      required={required || field?.required}
      disabled={disabled || field?.disabled}
      {...rest}
    >
      {placeholder ? <option value="">{placeholder}</option> : null}
      {options?.map((option) => (
        <option key={option.value} value={option.value} disabled={option.disabled}>
          {option.label}
        </option>
      ))}
      {children}
    </select>
  );
});

export function Checkbox({
  label,
  checked,
  defaultChecked,
  onCheckedChange,
  ...rest
}: Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'size'> & {
  label: string;
  onCheckedChange?: (checked: boolean) => void;
}) {
  return (
    <label className="wpl-check">
      <input
        type="checkbox"
        checked={checked}
        defaultChecked={defaultChecked}
        onChange={(event) => {
          rest.onChange?.(event);
          onCheckedChange?.(event.currentTarget.checked);
        }}
        {...rest}
      />
      <span>{label}</span>
    </label>
  );
}

export function RadioGroup({
  label,
  name,
  options,
  value,
  defaultValue,
  onValueChange,
}: {
  label: string;
  name: string;
  options: SelectOption[];
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
}) {
  return (
    <fieldset className="wpl-field">
      <legend className="wpl-label">{label}</legend>
      {options.map((option) => (
        <label className="wpl-radio" key={option.value}>
          <input
            type="radio"
            name={name}
            value={option.value}
            checked={value !== undefined ? value === option.value : undefined}
            defaultChecked={value === undefined ? defaultValue === option.value : undefined}
            disabled={option.disabled}
            onChange={() => onValueChange?.(option.value)}
          />
          <span>{option.label}</span>
        </label>
      ))}
    </fieldset>
  );
}

export function Switch({
  label,
  checked,
  defaultChecked = false,
  onCheckedChange,
  disabled = false,
  name,
}: {
  label: string;
  checked?: boolean;
  defaultChecked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  disabled?: boolean;
  name?: string;
}) {
  const [internal, setInternal] = useState(defaultChecked);
  const isChecked = checked ?? internal;
  function commit(next: boolean) {
    if (checked === undefined) setInternal(next);
    onCheckedChange?.(next);
  }
  return (
    <button
      type="button"
      role="switch"
      className="wpl-switch"
      aria-checked={isChecked}
      disabled={disabled}
      onClick={() => commit(!isChecked)}
    >
      <span className="wpl-switch-control" aria-hidden="true" />
      <span>{label}</span>
      {name ? <input type="checkbox" name={name} checked={isChecked} readOnly hidden /> : null}
    </button>
  );
}

export function Slider({
  label,
  min = 0,
  max = 100,
  step = 1,
  value,
  defaultValue,
  onValueChange,
  id,
}: {
  label: string;
  min?: number;
  max?: number;
  step?: number;
  value?: number;
  defaultValue?: number;
  onValueChange?: (value: number) => void;
  id?: string;
}) {
  const uid = useId();
  const inputId = id ?? uid;
  const outputId = `${inputId}-value`;
  const { locale } = useWhitePlumeria();
  const [internal, setInternal] = useState(defaultValue ?? min);
  const current = value ?? internal;
  return (
    <div className="wpl-field">
      <div className="wpl-flex wpl-flex-between">
        <label className="wpl-label" htmlFor={inputId}>
          {label}
        </label>
        <output id={outputId} htmlFor={inputId}>
          {formatNumber(current, locale)}
        </output>
      </div>
      <input
        id={inputId}
        className="wpl-slider"
        type="range"
        min={min}
        max={max}
        step={step}
        value={current}
        aria-valuetext={formatNumber(current, locale)}
        onChange={(event) => {
          const next = Number(event.currentTarget.value);
          if (value === undefined) setInternal(next);
          onValueChange?.(next);
        }}
      />
    </div>
  );
}

export function RangeSlider({
  label,
  min = 0,
  max = 100,
  step = 1,
  start,
  end,
  defaultStart,
  defaultEnd,
  disabled = false,
  name,
  onValueChange,
}: {
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
  const uid = useId();
  const { locale } = useWhitePlumeria();
  const startRef = useRef<HTMLInputElement>(null);
  const endRef = useRef<HTMLInputElement>(null);
  const bounds = rangeBounds(min, max, step);
  const [internal, setInternal] = useState(() =>
    normalizeRange(defaultStart ?? min, defaultEnd ?? max, rangeBounds(min, max, step)),
  );
  const current =
    start !== undefined
      ? normalizeRange(start, end ?? bounds.max, bounds)
      : normalizeRange(internal.start, internal.end, bounds);
  const fill = rangeFill(current, bounds);

  function commit(edge: 'start' | 'end', next: number) {
    const ordered = clampRangeEdge(edge, next, current, bounds);
    if (start === undefined) setInternal(ordered);
    onValueChange?.(ordered);
  }

  function onTrackPointerDown(event: ReactPointerEvent<HTMLDivElement>) {
    if (disabled || event.target instanceof HTMLInputElement) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const direction = getComputedStyle(event.currentTarget).direction === 'rtl' ? 'rtl' : 'ltr';
    const value = valueFromPointer(event.clientX, rect.left, rect.width, bounds, direction);
    const edge = nearerEdge(value, current);
    commit(edge, value);
    (edge === 'start' ? startRef : endRef).current?.focus();
  }

  const style = { '--wpl-range-start': fill.start, '--wpl-range-size': fill.size } as CSSProperties;
  return (
    <div className="wpl-field">
      <div className="wpl-flex wpl-flex-between">
        <span className="wpl-label" id={`${uid}-label`}>
          {label}
        </span>
        <output className="wpl-range-readout" aria-hidden="true">
          {formatNumber(current.start, locale)} – {formatNumber(current.end, locale)}
        </output>
      </div>
      <div
        className="wpl-range"
        role="group"
        aria-labelledby={`${uid}-label`}
        data-disabled={disabled ? 'true' : undefined}
        style={style}
        onPointerDown={onTrackPointerDown}
      >
        <span className="wpl-range-track" aria-hidden="true" />
        <span className="wpl-range-fill" aria-hidden="true" />
        <input
          ref={startRef}
          id={`${uid}-start`}
          className="wpl-range-input"
          type="range"
          min={bounds.min}
          max={bounds.max}
          step={bounds.step}
          value={current.start}
          disabled={disabled}
          name={name ? `${name}-start` : undefined}
          aria-label={`${label} start`}
          aria-valuetext={formatNumber(current.start, locale)}
          onChange={(event) => commit('start', Number(event.currentTarget.value))}
        />
        <input
          ref={endRef}
          id={`${uid}-end`}
          className="wpl-range-input"
          data-edge="end"
          type="range"
          min={bounds.min}
          max={bounds.max}
          step={bounds.step}
          value={current.end}
          disabled={disabled}
          name={name ? `${name}-end` : undefined}
          aria-label={`${label} end`}
          aria-valuetext={formatNumber(current.end, locale)}
          onChange={(event) => commit('end', Number(event.currentTarget.value))}
        />
      </div>
    </div>
  );
}

export function SearchInput({
  label,
  value,
  defaultValue = '',
  onValueChange,
  onSearch,
  placeholder,
  visuallyHiddenLabel = false,
}: {
  label: string;
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  onSearch?: (value: string) => void;
  placeholder?: string;
  visuallyHiddenLabel?: boolean;
}) {
  const id = useId();
  const { t } = useWhitePlumeria();
  const [internal, setInternal] = useState(defaultValue);
  const current = value ?? internal;
  function commit(next: string) {
    if (value === undefined) setInternal(next);
    onValueChange?.(next);
  }
  return (
    <div className="wpl-search">
      <label className={cx('wpl-label', visuallyHiddenLabel && 'wpl-sr-only')} htmlFor={id}>
        {label}
      </label>
      <div className="wpl-search-control">
        <span className="wpl-search-icon" aria-hidden="true">
          <Icon name="search" />
        </span>
        <input
          id={id}
          className="wpl-input"
          type="search"
          value={current}
          placeholder={placeholder}
          onChange={(event) => commit(event.currentTarget.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') onSearch?.(current);
          }}
        />
        {current ? (
          <button
            type="button"
            className="wpl-icon-btn wpl-icon-btn-sm wpl-btn-ghost wpl-search-clear"
            aria-label={t('clear')}
            onClick={() => commit('')}
          >
            <Icon name="close" />
          </button>
        ) : null}
      </div>
    </div>
  );
}

export function ToggleGroup({
  label,
  options,
  value,
  defaultValue = '',
  onValueChange,
  name,
  hideLabel = false,
  disabled = false,
}: {
  label: string;
  options: SelectOption[];
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  name?: string;
  hideLabel?: boolean;
  disabled?: boolean;
}) {
  const labelId = useId();
  const [internal, setInternal] = useState(defaultValue);
  const current = value !== undefined ? value : internal;
  const selected = options.findIndex((option) => option.value === current);
  const firstEnabled = options.findIndex((option) => !option.disabled);

  function commit(next: string) {
    if (value === undefined) setInternal(next);
    onValueChange?.(next);
  }

  function onKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    const next = toggleGroupMove(
      options,
      selected,
      event.key,
      readingDirection(event.currentTarget),
    );
    if (next === null) return;
    const option = options[next];
    if (!option) return;
    event.preventDefault();
    commit(option.value);
    const group = event.currentTarget.parentElement;
    queueMicrotask(() => {
      group?.querySelectorAll<HTMLButtonElement>('[role="radio"]')[next]?.focus();
    });
  }

  const group = (
    <div
      className="wpl-toggle"
      role="radiogroup"
      aria-label={hideLabel ? label : undefined}
      aria-labelledby={hideLabel ? undefined : labelId}
    >
      {options.map((option, index) => {
        const checked = option.value === current;
        const tabbable =
          !option.disabled && !disabled && (checked || (selected < 0 && index === firstEnabled));
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            className="wpl-toggle-item"
            aria-checked={checked}
            disabled={disabled || option.disabled}
            tabIndex={tabbable ? 0 : -1}
            onClick={() => commit(option.value)}
            onKeyDown={onKeyDown}
          >
            {option.label}
          </button>
        );
      })}
      {name ? <input type="hidden" name={name} value={current} /> : null}
    </div>
  );
  if (hideLabel) return group;
  return (
    <div className="wpl-field">
      <span id={labelId} className="wpl-label">
        {label}
      </span>
      {group}
    </div>
  );
}
