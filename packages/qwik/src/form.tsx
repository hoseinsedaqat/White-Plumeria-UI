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
import { component$, createContextId, Slot, useContext, useContextProvider, useId, useSignal, type QRL } from '@qwik.dev/core';
import { useWhitePlumeria } from './provider';

interface FieldContextValue {
  id: string;
  describedBy?: string;
  invalid: boolean;
  required: boolean;
  disabled: boolean;
}

export const FieldContext = createContextId<FieldContextValue>('wpl.field');

export function useField(): FieldContextValue | null {
  return useContext(FieldContext, null);
}

export const Label = component$<{ htmlFor?: string; required?: boolean; class?: string }>((props) => {
  const wpl = useWhitePlumeria();
  return (
    <label class={cx('wpl-label', props.class)} for={props.htmlFor}>
      <Slot />
      {props.required ? (
        <>
          <span class="wpl-required" aria-hidden="true">*</span>
          <span class="wpl-sr-only">{wpl.t('required')}</span>
        </>
      ) : null}
    </label>
  );
});

export const FormMessage = component$<{ tone?: 'hint' | 'error'; id?: string }>((props) => {
  return (
    <p id={props.id} class={props.tone === 'error' ? 'wpl-field-error' : 'wpl-field-hint'} role={props.tone === 'error' ? 'alert' : undefined}>
      <Slot />
    </p>
  );
});

export const ValidationMessage = component$<{ id?: string }>((props) => {
  return (
    <FormMessage tone="error" id={props.id}>
      <Slot />
    </FormMessage>
  );
});

export const FormField = component$<{
  label: string;
  hint?: string;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  class?: string;
}>((props) => {
  const uid = useId();
  const id = `wpl-field-${uid}`;
  const hintId = props.hint ? `${id}-hint` : undefined;
  const errorId = props.error ? `${id}-error` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(' ') || undefined;
  useContextProvider(FieldContext, {
    id,
    describedBy,
    invalid: Boolean(props.error),
    required: Boolean(props.required),
    disabled: Boolean(props.disabled),
  });
  return (
    <div class={fieldClassName(Boolean(props.error), props.class)}>
      <Label htmlFor={id} required={props.required}>{props.label}</Label>
      <Slot />
      {props.hint ? <FormMessage id={hintId}>{props.hint}</FormMessage> : null}
      {props.error ? <ValidationMessage id={errorId}>{props.error}</ValidationMessage> : null}
    </div>
  );
});

export const Input = component$<{
  size?: ControlSize;
  invalid?: boolean;
  class?: string;
  id?: string;
  name?: string;
  type?: string;
  value?: string | number;
  placeholder?: string;
  autoComplete?: string;
  inputMode?: 'none' | 'text' | 'numeric' | 'decimal' | 'search' | 'email' | 'tel' | 'url';
  required?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  min?: string | number;
  max?: string | number;
  step?: string | number;
  onInput$?: QRL<(event: Event, element: HTMLInputElement) => void>;
  onChange$?: QRL<(event: Event, element: HTMLInputElement) => void>;
  onKeyDown$?: QRL<(event: KeyboardEvent, element: HTMLInputElement) => void>;
}>((props) => {
  const field = useField();
  return (
    <input
      id={props.id ?? field?.id}
      class={inputClassName({ size: props.size, className: props.class })}
      name={props.name}
      type={props.type}
      value={props.value}
      placeholder={props.placeholder}
      autoComplete={props.autoComplete}
      inputMode={props.inputMode}
      min={props.min}
      max={props.max}
      step={props.step}
      readOnly={props.readOnly}
      aria-invalid={props.invalid || field?.invalid || undefined}
      aria-describedby={field?.describedBy}
      aria-required={props.required || field?.required || undefined}
      required={props.required || field?.required}
      disabled={props.disabled || field?.disabled}
      onInput$={(event, element) => {
        void props.onInput$?.(event, element);
      }}
      onChange$={(event, element) => {
        void props.onChange$?.(event, element);
      }}
      onKeyDown$={(event, element) => {
        void props.onKeyDown$?.(event, element);
      }}
    />
  );
});

export const Textarea = component$<{
  size?: ControlSize;
  invalid?: boolean;
  class?: string;
  id?: string;
  name?: string;
  value?: string;
  rows?: number;
  required?: boolean;
  disabled?: boolean;
  placeholder?: string;
  onInput$?: QRL<(event: Event, element: HTMLTextAreaElement) => void>;
}>((props) => {
  const field = useField();
  return (
    <textarea
      id={props.id ?? field?.id}
      name={props.name}
      rows={props.rows ?? 4}
      class={textareaClassName({ size: props.size, className: props.class })}
      value={props.value}
      placeholder={props.placeholder}
      aria-invalid={props.invalid || field?.invalid || undefined}
      aria-describedby={field?.describedBy}
      required={props.required || field?.required}
      disabled={props.disabled || field?.disabled}
      onInput$={(event, element) => {
        void props.onInput$?.(event, element);
      }}
    />
  );
});

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export const Select = component$<{
  size?: ControlSize;
  invalid?: boolean;
  class?: string;
  id?: string;
  name?: string;
  value?: string;
  required?: boolean;
  disabled?: boolean;
  options?: SelectOption[];
  placeholder?: string;
  onChange$?: QRL<(event: Event, element: HTMLSelectElement) => void>;
}>((props) => {
  const field = useField();
  return (
    <select
      id={props.id ?? field?.id}
      name={props.name}
      class={selectClassName({ size: props.size, className: props.class })}
      value={props.value}
      aria-invalid={props.invalid || field?.invalid || undefined}
      aria-describedby={field?.describedBy}
      required={props.required || field?.required}
      disabled={props.disabled || field?.disabled}
      onChange$={(event, element) => {
        void props.onChange$?.(event, element);
      }}
    >
      {props.placeholder ? <option value="">{props.placeholder}</option> : null}
      {props.options?.map((option) => (
        <option key={option.value} value={option.value} disabled={option.disabled}>
          {option.label}
        </option>
      ))}
      <Slot />
    </select>
  );
});

export const Checkbox = component$<{
  label: string;
  checked?: boolean;
  defaultChecked?: boolean;
  name?: string;
  disabled?: boolean;
  onCheckedChange$?: QRL<(checked: boolean) => void>;
}>((props) => {
  const internal = useSignal(Boolean(props.defaultChecked));
  const checked = props.checked ?? internal.value;
  return (
    <label class="wpl-check">
      <input
        type="checkbox"
        name={props.name}
        checked={checked}
        disabled={props.disabled}
        onChange$={(_, element) => {
          const next = element.checked;
          if (props.checked === undefined) internal.value = next;
          void props.onCheckedChange$?.(next);
        }}
      />
      <span>{props.label}</span>
    </label>
  );
});

export const RadioGroup = component$<{
  label: string;
  name: string;
  options: SelectOption[];
  value?: string;
  defaultValue?: string;
  onValueChange$?: QRL<(value: string) => void>;
}>((props) => {
  return (
    <fieldset class="wpl-field">
      <legend class="wpl-label">{props.label}</legend>
      {props.options.map((option) => (
        <label class="wpl-radio" key={option.value}>
          <input
            type="radio"
            name={props.name}
            value={option.value}
            checked={props.value !== undefined ? props.value === option.value : undefined}
            defaultChecked={props.value === undefined ? props.defaultValue === option.value : undefined}
            disabled={option.disabled}
            onChange$={() => {
              void props.onValueChange$?.(option.value);
            }}
          />
          <span>{option.label}</span>
        </label>
      ))}
    </fieldset>
  );
});

export const Switch = component$<{
  label: string;
  checked?: boolean;
  defaultChecked?: boolean;
  disabled?: boolean;
  name?: string;
  onCheckedChange$?: QRL<(checked: boolean) => void>;
}>((props) => {
  const internal = useSignal(Boolean(props.defaultChecked));
  const checked = props.checked ?? internal.value;
  return (
    <button
      type="button"
      role="switch"
      class="wpl-switch"
      aria-checked={checked}
      disabled={props.disabled}
      onClick$={() => {
        const next = !checked;
        if (props.checked === undefined) internal.value = next;
        void props.onCheckedChange$?.(next);
      }}
    >
      <span class="wpl-switch-control" aria-hidden="true" />
      <span>{props.label}</span>
      {props.name ? <input type="checkbox" name={props.name} checked={checked} readOnly hidden /> : null}
    </button>
  );
});

export const Slider = component$<{
  label: string;
  min?: number;
  max?: number;
  step?: number;
  value?: number;
  defaultValue?: number;
  id?: string;
  onValueChange$?: QRL<(value: number) => void>;
}>((props) => {
  const uid = useId();
  const inputId = props.id ?? uid;
  const wpl = useWhitePlumeria();
  const internal = useSignal(props.defaultValue ?? props.min ?? 0);
  const current = props.value ?? internal.value;
  return (
    <div class="wpl-field">
      <div class="wpl-flex wpl-flex-between">
        <label class="wpl-label" for={inputId}>{props.label}</label>
        <output id={`${inputId}-value`} for={inputId}>{formatNumber(current, wpl.locale)}</output>
      </div>
      <input
        id={inputId}
        class="wpl-slider"
        type="range"
        min={props.min ?? 0}
        max={props.max ?? 100}
        step={props.step ?? 1}
        value={current}
        aria-valuetext={formatNumber(current, wpl.locale)}
        onInput$={(_, element) => {
          const next = Number(element.value);
          if (props.value === undefined) internal.value = next;
          void props.onValueChange$?.(next);
        }}
      />
    </div>
  );
});

export const RangeSlider = component$<{
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
  onValueChange$?: QRL<(value: NumberRange) => void>;
}>((props) => {
  const uid = useId();
  const wpl = useWhitePlumeria();
  const startRef = useSignal<HTMLInputElement>();
  const endRef = useSignal<HTMLInputElement>();
  const bounds = rangeBounds(props.min ?? 0, props.max ?? 100, props.step ?? 1);
  const internal = useSignal(normalizeRange(props.defaultStart ?? bounds.min, props.defaultEnd ?? bounds.max, bounds));
  const current = props.start !== undefined
    ? normalizeRange(props.start, props.end ?? bounds.max, bounds)
    : normalizeRange(internal.value.start, internal.value.end, bounds);
  const fill = rangeFill(current, bounds);

  return (
    <div class="wpl-field">
      <div class="wpl-flex wpl-flex-between">
        <span class="wpl-label" id={`${uid}-label`}>{props.label}</span>
        <output class="wpl-range-readout" aria-hidden="true">
          {formatNumber(current.start, wpl.locale)} – {formatNumber(current.end, wpl.locale)}
        </output>
      </div>
      <div
        class="wpl-range"
        role="group"
        aria-labelledby={`${uid}-label`}
        data-disabled={props.disabled ? 'true' : undefined}
        style={{ '--wpl-range-start': fill.start, '--wpl-range-size': fill.size }}
        onPointerDown$={(event, element) => {
          if (props.disabled || (event.target instanceof HTMLInputElement)) return;
          const rect = element.getBoundingClientRect();
          const direction = getComputedStyle(element).direction === 'rtl' ? 'rtl' : 'ltr';
          const value = valueFromPointer(event.clientX, rect.left, rect.width, bounds, direction);
          const edge = nearerEdge(value, current);
          const ordered = clampRangeEdge(edge, value, current, bounds);
          if (props.start === undefined) internal.value = ordered;
          void props.onValueChange$?.(ordered);
          (edge === 'start' ? startRef.value : endRef.value)?.focus();
        }}
      >
        <span class="wpl-range-track" aria-hidden="true" />
        <span class="wpl-range-fill" aria-hidden="true" />
        <input
          ref={startRef}
          id={`${uid}-start`}
          class="wpl-range-input"
          type="range"
          min={bounds.min}
          max={bounds.max}
          step={bounds.step}
          value={current.start}
          disabled={props.disabled}
          name={props.name ? `${props.name}-start` : undefined}
          aria-label={`${props.label} start`}
          aria-valuetext={formatNumber(current.start, wpl.locale)}
          onInput$={(_, element) => {
            const ordered = clampRangeEdge('start', Number(element.value), current, bounds);
            if (props.start === undefined) internal.value = ordered;
            void props.onValueChange$?.(ordered);
          }}
        />
        <input
          ref={endRef}
          id={`${uid}-end`}
          class="wpl-range-input"
          data-edge="end"
          type="range"
          min={bounds.min}
          max={bounds.max}
          step={bounds.step}
          value={current.end}
          disabled={props.disabled}
          name={props.name ? `${props.name}-end` : undefined}
          aria-label={`${props.label} end`}
          aria-valuetext={formatNumber(current.end, wpl.locale)}
          onInput$={(_, element) => {
            const ordered = clampRangeEdge('end', Number(element.value), current, bounds);
            if (props.start === undefined) internal.value = ordered;
            void props.onValueChange$?.(ordered);
          }}
        />
      </div>
    </div>
  );
});

export const SearchInput = component$<{
  label: string;
  value?: string;
  defaultValue?: string;
  placeholder?: string;
  visuallyHiddenLabel?: boolean;
  onValueChange$?: QRL<(value: string) => void>;
  onSearch$?: QRL<(value: string) => void>;
}>((props) => {
  const id = useId();
  const wpl = useWhitePlumeria();
  const internal = useSignal(props.defaultValue ?? '');
  const current = props.value ?? internal.value;
  return (
    <div class="wpl-search">
      <label class={cx('wpl-label', props.visuallyHiddenLabel && 'wpl-sr-only')} for={id}>{props.label}</label>
      <div class="wpl-search-control">
        <span class="wpl-search-icon" aria-hidden="true">⌕</span>
        <input
          id={id}
          class="wpl-input"
          type="search"
          value={current}
          placeholder={props.placeholder}
          onInput$={(_, element) => {
            if (props.value === undefined) internal.value = element.value;
            void props.onValueChange$?.(element.value);
          }}
          onKeyDown$={(event) => {
            if (event.key === 'Enter') void props.onSearch$?.(props.value ?? internal.value);
          }}
        />
        {current ? (
          <button
            type="button"
            class="wpl-icon-btn wpl-icon-btn-sm wpl-btn-ghost wpl-search-clear"
            aria-label={wpl.t('clear')}
            onClick$={() => {
              if (props.value === undefined) internal.value = '';
              void props.onValueChange$?.('');
            }}
          >
            ×
          </button>
        ) : null}
      </div>
    </div>
  );
});

export const ToggleGroup = component$<{
  label: string;
  options: SelectOption[];
  value?: string;
  defaultValue?: string;
  onValueChange$?: QRL<(value: string) => void>;
  name?: string;
  hideLabel?: boolean;
  disabled?: boolean;
}>((props) => {
  const labelId = useId();
  const internal = useSignal(props.defaultValue ?? '');
  const current = props.value !== undefined ? props.value : internal.value;
  const selected = props.options.findIndex((option) => option.value === current);
  const firstEnabled = props.options.findIndex((option) => !option.disabled);
  return (
    <div class={props.hideLabel ? undefined : 'wpl-field'}>
      {props.hideLabel ? null : (
        <span id={labelId} class="wpl-label">
          {props.label}
        </span>
      )}
      <div
        class="wpl-toggle"
        role="radiogroup"
        aria-label={props.hideLabel ? props.label : undefined}
        aria-labelledby={props.hideLabel ? undefined : labelId}
      >
        {props.options.map((option, index) => {
          const checked = option.value === current;
          const tabbable =
            !option.disabled &&
            !props.disabled &&
            (checked || (selected < 0 && index === firstEnabled));
          return (
            <button
              key={option.value}
              type="button"
              role="radio"
              class="wpl-toggle-item"
              aria-checked={checked ? 'true' : 'false'}
              disabled={props.disabled || option.disabled}
              tabIndex={tabbable ? 0 : -1}
              onClick$={() => {
                if (props.value === undefined) internal.value = option.value;
                void props.onValueChange$?.(option.value);
              }}
              onKeyDown$={(event) => {
                const next = toggleGroupMove(
                  props.options,
                  props.options.findIndex(
                    (item) =>
                      item.value === (props.value !== undefined ? props.value : internal.value),
                  ),
                  event.key,
                  readingDirection(
                    event.currentTarget instanceof HTMLElement ? event.currentTarget : null,
                  ),
                );
                if (next === null) return;
                const choice = props.options[next];
                if (!choice) return;
                event.preventDefault();
                if (props.value === undefined) internal.value = choice.value;
                void props.onValueChange$?.(choice.value);
                const group =
                  event.currentTarget instanceof HTMLElement
                    ? event.currentTarget.parentElement
                    : null;
                queueMicrotask(() =>
                  group?.querySelectorAll<HTMLButtonElement>('[role="radio"]')[next]?.focus(),
                );
              }}
            >
              {option.label}
            </button>
          );
        })}
        {props.name ? <input type="hidden" name={props.name} value={current} /> : null}
      </div>
    </div>
  );
});
