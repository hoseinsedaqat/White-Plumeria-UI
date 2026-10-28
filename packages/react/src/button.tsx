import { buttonClassName, buttonGroupClassName, iconButtonClassName } from '@white-plumeria/core';
import type { ButtonVariant, ControlSize } from '@white-plumeria/core';
import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { Icon } from './icon.tsx';
import { useWhitePlumeria } from './provider.tsx';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ControlSize;
  loading?: boolean;
  block?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    variant = 'primary',
    size = 'md',
    loading = false,
    block = false,
    disabled,
    className,
    children,
    type = 'button',
    onClick,
    ...rest
  },
  ref,
) {
  const { t } = useWhitePlumeria();
  const inactive = disabled || loading;
  return (
    <button
      ref={ref}
      type={type}
      className={buttonClassName({ variant, size, loading, block, className })}
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
});

export interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  label: string;
  variant?: ButtonVariant;
  size?: ControlSize;
}

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(function IconButton(
  { label, variant = 'ghost', size = 'md', className, children, type = 'button', ...rest },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      className={iconButtonClassName({ variant, size, className })}
      aria-label={label}
      {...rest}
    >
      {children ?? <Icon name="close" />}
    </button>
  );
});

export function ButtonGroup({
  children,
  joined = false,
  label,
  className,
}: {
  children: ReactNode;
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
