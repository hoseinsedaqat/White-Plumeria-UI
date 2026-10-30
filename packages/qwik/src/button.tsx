import { buttonClassName, buttonGroupClassName, iconButtonClassName, type ButtonAppearance, type ButtonSize, type ButtonVariant, type IconName } from '@white-plumeria/core';
import { component$, Slot, type QRL, type Signal } from '@qwik.dev/core';
import { Icon } from './icon';
import { useWhitePlumeria } from './provider';

export interface ButtonProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  appearance?: ButtonAppearance;
  loading?: boolean;
  block?: boolean;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
  class?: string;
  id?: string;
  name?: string;
  'aria-expanded'?: boolean;
  'aria-controls'?: string;
  'aria-haspopup'?: boolean | 'menu' | 'dialog' | 'listbox' | 'true' | 'false' | 'grid' | 'tree';
  'aria-label'?: string;
  'aria-pressed'?: boolean;
  'aria-activedescendant'?: string;
  ref?: Signal<HTMLButtonElement | undefined>;
  onClick$?: QRL<(event: Event, element: HTMLButtonElement) => void>;
  onKeyDown$?: QRL<(event: KeyboardEvent, element: HTMLButtonElement) => void>;
}

export const Button = component$<ButtonProps>((props) => {
  const wpl = useWhitePlumeria();
  return (
    <button
      ref={props.ref}
      id={props.id}
      name={props.name}
      type={props.type ?? 'button'}
      class={buttonClassName({
        variant: props.variant,
        size: props.size,
        appearance: props.appearance,
        loading: props.loading,
        block: props.block,
        className: props.class,
      })}
      disabled={props.disabled || props.loading}
      aria-busy={props.loading || undefined}
      aria-expanded={props['aria-expanded']}
      aria-controls={props['aria-controls']}
      aria-haspopup={props['aria-haspopup']}
      aria-label={props['aria-label']}
      aria-pressed={props['aria-pressed']}
      aria-activedescendant={props['aria-activedescendant']}
      onClick$={(event, element) => {
        if (props.loading || props.disabled) return;
        void props.onClick$?.(event, element);
      }}
      onKeyDown$={(event, element) => {
        void props.onKeyDown$?.(event, element);
      }}
    >
      {props.loading ? <span class="wpl-spinner wpl-spinner-sm" aria-hidden="true" /> : null}
      {props.loading ? <span class="wpl-sr-only">{wpl.t('loading')}</span> : null}
      <Slot />
    </button>
  );
});

export const IconButton = component$<{
  label: string;
  icon?: IconName;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  class?: string;
  'aria-expanded'?: boolean;
  'aria-controls'?: string;
  'aria-haspopup'?: ButtonProps['aria-haspopup'];
  onClick$?: QRL<(event: Event, element: HTMLButtonElement) => void>;
}>((props) => {
  return (
    <button
      type="button"
      class={iconButtonClassName({ variant: props.variant, size: props.size, className: props.class })}
      aria-label={props.label}
      disabled={props.disabled}
      aria-expanded={props['aria-expanded']}
      aria-controls={props['aria-controls']}
      aria-haspopup={props['aria-haspopup']}
      onClick$={(event, element) => {
        void props.onClick$?.(event, element);
      }}
    >
      {props.icon ? <Icon name={props.icon} /> : (
        <Slot>
          <Icon name="close" />
        </Slot>
      )}
    </button>
  );
});

export const ButtonGroup = component$<{ label: string; class?: string }>((props) => {
  return (
    <div class={buttonGroupClassName(false, props.class)} role="group" aria-label={props.label}>
      <Slot />
    </div>
  );
});
