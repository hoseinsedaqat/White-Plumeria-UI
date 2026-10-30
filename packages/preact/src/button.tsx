import { buttonClassName, buttonGroupClassName, iconButtonClassName } from '@white-plumeria/core';
import type { ButtonAppearance, ButtonSize, ButtonVariant } from '@white-plumeria/core';
import { type ButtonHTMLAttributes, type ComponentChildren } from 'preact';
import { Icon } from './icon.tsx';
import { useWhitePlumeria } from './provider.tsx';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  appearance?: ButtonAppearance;
  loading?: boolean;
  block?: boolean;
}

export function Button({
  variant = 'primary',
  size = 'md',
  appearance = 'solid',
  loading = false,
  block = false,
  disabled,
  className,
  children,
  type = 'button',
  onClick,
  ref,
  ...rest
}: ButtonProps) {
  const { t } = useWhitePlumeria();
  const inactive = disabled || loading;
  return (
    <button
      ref={ref}
      type={type}
      className={buttonClassName({
        variant,
        size,
        appearance,
        loading,
        block,
        className: typeof className === 'string' ? className : undefined,
      })}
      disabled={inactive}
      aria-busy={loading || undefined}
      onClick={(event) => {
        if (inactive) {
          event.preventDefault();
          return;
        }
        onClick?.(event);
      }}
      {...rest}
    >
      {loading ? <span className="wpl-spinner wpl-spinner-sm" aria-hidden="true" /> : null}
      {loading ? <span className="wpl-sr-only">{t('loading')}</span> : null}
      {children}
    </button>
  );
}

export interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  label: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  appearance?: ButtonAppearance;
}

export function IconButton({
  label,
  variant = 'ghost',
  size = 'md',
  appearance = 'solid',
  className,
  children,
  type = 'button',
  ref,
  ...rest
}: IconButtonProps) {
  return (
    <button
      ref={ref}
      type={type}
      className={iconButtonClassName({
        variant,
        size,
        appearance,
        className: typeof className === 'string' ? className : undefined,
      })}
      aria-label={label}
      {...rest}
    >
      {children ?? <Icon name="close" />}
    </button>
  );
}

export function ButtonGroup({
  children,
  joined = false,
  label,
  className,
}: {
  children: ComponentChildren;
  joined?: boolean;
  label: string;
  className?: string;
}) {
  return (
    <div role="group" aria-label={label} className={buttonGroupClassName(joined, className)}>
      {children}
    </div>
  );
}
