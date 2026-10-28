import {
  cx,
  fieldClassName,
  formatNumber,
  inputClassName,
  selectClassName,
  textareaClassName,
} from '@white-plumeria/core';
import type { ControlSize } from '@white-plumeria/core';
import {
  createContext,
  forwardRef,
  useContext,
  useId,
  useState,
  type InputHTMLAttributes,
  type ReactNode,
  type SelectHTMLAttributes,
  type TextareaHTMLAttributes,
} from 'react';
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
          ⌕
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
            ×
          </button>
        ) : null}
      </div>
    </div>
  );
}
