import { buttonClassName, buttonGroupClassName, iconButtonClassName, type ButtonAppearance, type ButtonSize, type ButtonVariant } from '@white-plumeria/core';
import type { JSX } from 'solid-js';
import { splitProps } from 'solid-js';
import { Icon } from './icon.tsx';
import { useWhitePlumeria } from './provider.tsx';

export interface ButtonProps extends JSX.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  appearance?: ButtonAppearance;
  loading?: boolean;
  block?: boolean;
  className?: string;
}

export function Button(props: ButtonProps & { ref?: HTMLButtonElement | ((element: HTMLButtonElement) => void) }) {
  const [local, rest] = splitProps(props, ['variant', 'size', 'appearance', 'loading', 'block', 'disabled', 'class', 'className', 'children', 'type', 'onClick', 'ref']);
  const { t } = useWhitePlumeria();
  const inactive = () => Boolean(local.disabled || local.loading);
  return (
    <button
      {...rest}
      ref={(element) => {
        if (typeof local.ref === 'function') local.ref(element);
      }}
      type={local.type ?? 'button'}
      class={buttonClassName({
        variant: local.variant ?? 'primary',
        size: local.size ?? 'md',
        appearance: local.appearance ?? 'solid',
        loading: local.loading,
        block: local.block,
        className: local.class ?? local.className,
      })}
      disabled={inactive()}
      aria-busy={local.loading || undefined}
      onClick={(event) => {
        if (inactive()) {
          event.preventDefault();
          return;
        }
        if (typeof local.onClick === 'function') local.onClick(event);
      }}
    >
      {local.loading ? <span class="wpl-spinner wpl-spinner-sm" aria-hidden="true" /> : null}
      {local.loading ? <span class="wpl-sr-only">{t('loading')}</span> : null}
      {local.children}
    </button>
  );
}

export interface IconButtonProps extends JSX.ButtonHTMLAttributes<HTMLButtonElement> {
  label: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  appearance?: ButtonAppearance;
}

export function IconButton(props: IconButtonProps) {
  const [local, rest] = splitProps(props, ['label', 'variant', 'size', 'appearance', 'class', 'children']);
  return (
    <button
      {...rest}
      type="button"
      class={iconButtonClassName({
        variant: local.variant ?? 'ghost',
        size: local.size ?? 'md',
        appearance: local.appearance ?? 'solid',
        className: local.class,
      })}
      aria-label={local.label}
    >
      {local.children ?? <Icon name="close" />}
    </button>
  );
}

export function ButtonGroup(props: { label: string; joined?: boolean; children: JSX.Element }) {
  return (
    <div role="group" aria-label={props.label} class={buttonGroupClassName(props.joined)}>
      {props.children}
    </div>
  );
}
