import {
  alertClassName,
  avatarClassName,
  badgeClassName,
  cardClassName,
  cx,
  spinnerClassName,
} from '@white-plumeria/core';
import type { AlertVariant, AvatarSize, BadgeVariant, ControlSize } from '@white-plumeria/core';
import {
  forwardRef,
  useState,
  type AnchorHTMLAttributes,
  type HTMLAttributes,
  type ReactNode,
} from 'react';
import { Icon } from './icon.tsx';
import { useWhitePlumeria } from './provider.tsx';

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const first = parts[0]?.[0] ?? '';
  const second = parts.length > 1 ? parts[parts.length - 1]?.[0] ?? '' : parts[0]?.[1] ?? '';
  return `${first}${second}`.toUpperCase();
}

export interface LinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  external?: boolean;
}

export const Link = forwardRef<HTMLAnchorElement, LinkProps>(function Link(
  { external = false, className, children, rel, target, ...rest },
  ref,
) {
  const { locale } = useWhitePlumeria();
  const newTab = locale === 'fa' ? 'در زبانهٔ جدید باز می‌شود' : 'opens in a new tab';
  return (
    <a
      ref={ref}
      className={cx('wpl-link', className)}
      rel={external ? 'noreferrer noopener' : rel}
      target={external ? '_blank' : target}
      {...rest}
    >
      {children}
      {external ? <span className="wpl-sr-only"> ({newTab})</span> : null}
      {external ? <Icon name="external" /> : null}
    </a>
  );
});

export function Badge({
  variant = 'neutral',
  className,
  children,
}: {
  variant?: BadgeVariant;
  className?: string;
  children: ReactNode;
}) {
  return <span className={badgeClassName(variant, className)}>{children}</span>;
}

export function Avatar({
  name,
  src,
  alt,
  size = 'md',
  status,
  statusLabel,
  className,
}: {
  name: string;
  src?: string;
  alt?: string;
  size?: AvatarSize;
  status?: 'online' | 'busy' | 'offline';
  statusLabel?: string;
  className?: string;
}) {
  const [failed, setFailed] = useState(false);
  const statusColor =
    status === 'busy' ? 'var(--wpl-color-warning)' : status === 'offline' ? 'var(--wpl-color-text-subtle)' : undefined;
  return (
    <span className={avatarClassName(size, className)}>
      {src && !failed ? (
        <img src={src} alt={alt ?? name} onError={() => setFailed(true)} />
      ) : (
        <span aria-hidden={src ? undefined : true}>{initials(name)}</span>
      )}
      {!src && !alt ? <span className="wpl-sr-only">{name}</span> : null}
      {status && statusLabel ? (
        <>
          <span className="wpl-avatar-status" style={statusColor ? { background: statusColor } : undefined} />
          <span className="wpl-sr-only">{statusLabel}</span>
        </>
      ) : null}
    </span>
  );
}

export function Card({
  title,
  description,
  titleAs: Title = 'h2',
  className,
  children,
  footer,
}: {
  title?: string;
  description?: string;
  titleAs?: 'h1' | 'h2' | 'h3' | 'h4';
  className?: string;
  children?: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <section className={cardClassName(className)}>
      {title || description ? (
        <header className="wpl-card-header">
          {title ? <Title className="wpl-card-title">{title}</Title> : null}
          {description ? <p className="wpl-card-description">{description}</p> : null}
        </header>
      ) : null}
      {children ? <div className="wpl-card-body">{children}</div> : null}
      {footer ? <div className="wpl-card-footer">{footer}</div> : null}
    </section>
  );
}

export function Divider({ label }: { label?: string }) {
  if (!label) return <hr className="wpl-divider" />;
  return (
    <div className="wpl-divider-labeled" role="separator">
      {label}
    </div>
  );
}

export function Separator({
  orientation = 'horizontal',
  className,
}: {
  orientation?: 'horizontal' | 'vertical';
  className?: string;
}) {
  return (
    <div
      role="separator"
      aria-orientation={orientation}
      className={cx('wpl-separator', orientation === 'vertical' && 'wpl-separator-vertical', className)}
    />
  );
}

export function Spinner({
  label,
  size = 'md',
  className,
}: {
  label?: string;
  size?: ControlSize;
  className?: string;
}) {
  const { t } = useWhitePlumeria();
  return <span className={spinnerClassName(size, className)} role="status" aria-label={label ?? t('loading')} />;
}

export function Skeleton({
  width = '100%',
  height = '1rem',
  className,
}: {
  width?: string;
  height?: string;
  className?: string;
}) {
  return <span className={cx('wpl-skeleton', className)} style={{ width, height }} aria-hidden="true" />;
}

export function Progress({
  value,
  max = 100,
  label,
}: {
  value?: number;
  max?: number;
  label: string;
}) {
  const indeterminate = value === undefined;
  const safeMax = max > 0 ? max : 100;
  const percent = indeterminate ? undefined : Math.min(100, Math.max(0, (value / safeMax) * 100));
  return (
    <div
      className={cx('wpl-progress-track', indeterminate && 'wpl-progress-indeterminate')}
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={safeMax}
      aria-valuenow={indeterminate ? undefined : value}
    >
      <span className="wpl-progress-bar" style={percent === undefined ? undefined : { inlineSize: `${percent}%` }} />
    </div>
  );
}

export function EmptyState({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children?: ReactNode;
}) {
  return (
    <div className="wpl-empty">
      <h2 className="wpl-empty-title">{title}</h2>
      {description ? <p className="wpl-empty-description">{description}</p> : null}
      {children}
    </div>
  );
}

export function Alert({
  variant = 'neutral',
  title,
  children,
  className,
}: {
  variant?: AlertVariant;
  title?: string;
  children?: ReactNode;
  className?: string;
}) {
  return (
    <div className={alertClassName(variant, className)} role={variant === 'danger' ? 'alert' : 'status'}>
      <Icon name={variant === 'success' ? 'success' : variant === 'neutral' ? 'info' : 'alert'} />
      <div>
        {title ? <p className="wpl-alert-title">{title}</p> : null}
        {children ? <div className="wpl-alert-description">{children}</div> : null}
      </div>
    </div>
  );
}

export function StatCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <article className="wpl-card wpl-stat">
      <p className="wpl-stat-label">{label}</p>
      <p className="wpl-stat-value">{value}</p>
      {hint ? <p className="wpl-stat-hint">{hint}</p> : null}
    </article>
  );
}
