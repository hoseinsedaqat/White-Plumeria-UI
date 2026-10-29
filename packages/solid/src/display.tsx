import {
  alertClassName,
  avatarClassName,
  badgeClassName,
  cardClassName,
  cx,
  spinnerClassName,
  type AlertVariant,
  type AvatarSize,
  type BadgeVariant,
  type ControlSize,
} from '@white-plumeria/core';
import { createSignal, type JSX } from 'solid-js';
import { Dynamic } from 'solid-js/web';
import { Icon } from './icon.tsx';
import { useWhitePlumeria } from './provider.tsx';

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const first = parts[0]?.[0] ?? '';
  const second = parts.length > 1 ? (parts[parts.length - 1]?.[0] ?? '') : (parts[0]?.[1] ?? '');
  return `${first}${second}`.toUpperCase();
}

export function Link(props: JSX.AnchorHTMLAttributes<HTMLAnchorElement> & { external?: boolean }) {
  return (
    <a
      {...props}
      class={cx('wpl-link', props.class)}
      rel={props.external ? 'noreferrer noopener' : props.rel}
      target={props.external ? '_blank' : props.target}
    >
      {props.children}
      {props.external ? <span class="wpl-sr-only"> (opens in a new tab)</span> : null}
      {props.external ? <Icon name="external" /> : null}
    </a>
  );
}

export function Badge(props: { variant?: BadgeVariant; class?: string; children: JSX.Element }) {
  return <span class={badgeClassName(props.variant ?? 'neutral', props.class)}>{props.children}</span>;
}

export function Avatar(props: {
  name: string;
  src?: string;
  alt?: string;
  size?: AvatarSize;
  status?: 'online' | 'busy' | 'offline';
  statusLabel?: string;
  class?: string;
}) {
  const [failed, setFailed] = createSignal(false);
  const statusColor = () =>
    props.status === 'busy' ? 'var(--wpl-color-warning)' : props.status === 'offline' ? 'var(--wpl-color-text-subtle)' : undefined;
  return (
    <span class={avatarClassName(props.size ?? 'md', props.class)}>
      {props.src && !failed() ? (
        <img src={props.src} alt={props.alt ?? props.name} onError={() => setFailed(true)} />
      ) : (
        <span aria-hidden={props.src ? undefined : true}>{initials(props.name)}</span>
      )}
      {!props.src && !props.alt ? <span class="wpl-sr-only">{props.name}</span> : null}
      {props.status && props.statusLabel ? (
        <>
          <span class="wpl-avatar-status" style={statusColor() ? { background: statusColor() } : undefined} />
          <span class="wpl-sr-only">{props.statusLabel}</span>
        </>
      ) : null}
    </span>
  );
}

export function Card(props: {
  title?: string;
  description?: string;
  titleAs?: 'h1' | 'h2' | 'h3' | 'h4';
  class?: string;
  children?: JSX.Element;
  footer?: JSX.Element;
}) {
  return (
    <section class={cardClassName(props.class)}>
      {props.title || props.description ? (
        <header class="wpl-card-header">
          {props.title ? <Dynamic component={props.titleAs ?? 'h2'} class="wpl-card-title">{props.title}</Dynamic> : null}
          {props.description ? <p class="wpl-card-description">{props.description}</p> : null}
        </header>
      ) : null}
      {props.children ? <div class="wpl-card-body">{props.children}</div> : null}
      {props.footer ? <div class="wpl-card-footer">{props.footer}</div> : null}
    </section>
  );
}

export function Divider(props: { label?: string }) {
  if (!props.label) return <hr class="wpl-divider" />;
  return (
    <div class="wpl-divider-labeled" role="separator">
      {props.label}
    </div>
  );
}

export function Separator(props: { orientation?: 'horizontal' | 'vertical'; class?: string }) {
  return (
    <div
      role="separator"
      aria-orientation={props.orientation ?? 'horizontal'}
      class={cx('wpl-separator', props.orientation === 'vertical' && 'wpl-separator-vertical', props.class)}
    />
  );
}

export function Spinner(props: { label?: string; size?: ControlSize; class?: string }) {
  const { t } = useWhitePlumeria();
  return <span class={spinnerClassName(props.size ?? 'md', props.class)} role="status" aria-label={props.label ?? t('loading')} />;
}

export function Skeleton(props: { width?: string; height?: string; class?: string }) {
  return <span class={cx('wpl-skeleton', props.class)} style={{ width: props.width ?? '100%', height: props.height ?? '1rem' }} aria-hidden="true" />;
}

export function Progress(props: { value?: number; max?: number; label: string }) {
  const indeterminate = () => props.value === undefined;
  const safeMax = () => (props.max && props.max > 0 ? props.max : 100);
  const percent = () => (indeterminate() ? undefined : Math.min(100, Math.max(0, ((props.value ?? 0) / safeMax()) * 100)));
  return (
    <div
      class={cx('wpl-progress-track', indeterminate() && 'wpl-progress-indeterminate')}
      role="progressbar"
      aria-label={props.label}
      aria-valuemin={0}
      aria-valuemax={safeMax()}
      aria-valuenow={indeterminate() ? undefined : props.value}
    >
      <span class="wpl-progress-bar" style={percent() === undefined ? undefined : { 'inline-size': `${percent()}%` }} />
    </div>
  );
}

export function EmptyState(props: { title: string; description?: string; children?: JSX.Element }) {
  return (
    <div class="wpl-empty">
      <h2 class="wpl-empty-title">{props.title}</h2>
      {props.description ? <p class="wpl-empty-description">{props.description}</p> : null}
      {props.children}
    </div>
  );
}

export function Alert(props: { variant?: AlertVariant; title?: string; children?: JSX.Element; class?: string }) {
  const variant = () => props.variant ?? 'neutral';
  return (
    <div class={alertClassName(variant(), props.class)} role={variant() === 'danger' ? 'alert' : 'status'}>
      <Icon name={variant() === 'success' ? 'success' : variant() === 'neutral' ? 'info' : 'alert'} />
      <div>
        {props.title ? <p class="wpl-alert-title">{props.title}</p> : null}
        {props.children ? <div class="wpl-alert-description">{props.children}</div> : null}
      </div>
    </div>
  );
}

export function StatCard(props: { label: string; value: string; hint?: string }) {
  return (
    <article class="wpl-card wpl-stat">
      <p class="wpl-stat-label">{props.label}</p>
      <p class="wpl-stat-value">{props.value}</p>
      {props.hint ? <p class="wpl-stat-hint">{props.hint}</p> : null}
    </article>
  );
}
