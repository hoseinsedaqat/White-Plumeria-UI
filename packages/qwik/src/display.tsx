import {
  alertClassName,
  avatarClassName,
  badgeClassName,
  cardClassName,
  cx,
  notificationClassName,
  spinnerClassName,
  type AlertVariant,
  type AvatarSize,
  type BadgeVariant,
  type ControlSize,
} from '@white-plumeria/core';
import { component$, Slot, useSignal, type QRL } from '@qwik.dev/core';
import { IconButton } from './button';
import { Icon } from './icon';
import { useWhitePlumeria } from './provider';

export const Spinner = component$<{ label?: string; size?: ControlSize; class?: string }>((props) => {
  const wpl = useWhitePlumeria();
  return <span class={spinnerClassName(props.size, props.class)} role="status" aria-label={props.label ?? wpl.t('loading')} />;
});

export const Alert = component$<{ variant?: AlertVariant; title?: string; class?: string }>((props) => {
  const variant = props.variant ?? 'neutral';
  return (
    <div class={alertClassName(variant, props.class)} role={variant === 'danger' ? 'alert' : 'status'}>
      <Icon name={variant === 'success' ? 'success' : variant === 'neutral' ? 'info' : 'alert'} />
      <div>
        {props.title ? <p class="wpl-alert-title">{props.title}</p> : null}
        <div class="wpl-alert-description">
          <Slot />
        </div>
      </div>
    </div>
  );
});

export const Avatar = component$<{
  name: string;
  src?: string;
  alt?: string;
  size?: AvatarSize;
  status?: 'online' | 'busy' | 'offline';
  statusLabel?: string;
  class?: string;
}>((props) => {
  const failed = useSignal(false);
  const initials = props.name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0] ?? '')
    .join('')
    .toUpperCase();
  const statusColor =
    props.status === 'busy' ? 'var(--wpl-color-warning)' : props.status === 'offline' ? 'var(--wpl-color-text-subtle)' : undefined;
  return (
    <span class={avatarClassName(props.size, props.class)}>
      {props.src && !failed.value ? (
        <img src={props.src} alt={props.alt ?? props.name} onError$={() => { failed.value = true; }} />
      ) : (
        <span aria-hidden={props.src ? undefined : true}>{initials}</span>
      )}
      {!props.src && !props.alt ? <span class="wpl-sr-only">{props.name}</span> : null}
      {props.status && props.statusLabel ? (
        <>
          <span class="wpl-avatar-status" style={statusColor ? { background: statusColor } : undefined} />
          <span class="wpl-sr-only">{props.statusLabel}</span>
        </>
      ) : null}
    </span>
  );
});

export const Badge = component$<{ variant?: BadgeVariant; class?: string }>((props) => {
  return (
    <span class={badgeClassName(props.variant, props.class)}>
      <Slot />
    </span>
  );
});

export const Card = component$<{ title?: string; description?: string; titleAs?: 'h1' | 'h2' | 'h3' | 'h4'; class?: string }>((props) => {
  const titleAs = props.titleAs ?? 'h2';
  const title = props.title ? (
    titleAs === 'h1' ? (
      <h1 class="wpl-card-title">{props.title}</h1>
    ) : titleAs === 'h3' ? (
      <h3 class="wpl-card-title">{props.title}</h3>
    ) : titleAs === 'h4' ? (
      <h4 class="wpl-card-title">{props.title}</h4>
    ) : (
      <h2 class="wpl-card-title">{props.title}</h2>
    )
  ) : null;
  return (
    <section class={cardClassName(props.class)}>
      {props.title || props.description ? (
        <header class="wpl-card-header">
          {title}
          {props.description ? <p class="wpl-card-description">{props.description}</p> : null}
        </header>
      ) : null}
      <div class="wpl-card-body">
        <Slot />
      </div>
    </section>
  );
});

export const Divider = component$<{ label?: string }>((props) => {
  if (!props.label) return <hr class="wpl-divider" />;
  return (
    <div class="wpl-divider-labeled" role="separator">
      {props.label}
    </div>
  );
});

export const Separator = component$<{ orientation?: 'horizontal' | 'vertical'; class?: string }>((props) => {
  return (
    <div
      role="separator"
      aria-orientation={props.orientation ?? 'horizontal'}
      class={cx('wpl-separator', props.orientation === 'vertical' && 'wpl-separator-vertical', props.class)}
    />
  );
});

export const EmptyState = component$<{ title: string; description?: string }>((props) => {
  return (
    <div class="wpl-empty">
      <h2 class="wpl-empty-title">{props.title}</h2>
      {props.description ? <p class="wpl-empty-description">{props.description}</p> : null}
      <Slot />
    </div>
  );
});

export const Link = component$<{ href: string; external?: boolean; class?: string }>((props) => {
  return (
    <a
      class={cx('wpl-link', props.class)}
      href={props.href}
      target={props.external ? '_blank' : undefined}
      rel={props.external ? 'noreferrer noopener' : undefined}
    >
      <Slot />
      {props.external ? <span class="wpl-sr-only"> (opens in a new tab)</span> : null}
      {props.external ? <Icon name="external" /> : null}
    </a>
  );
});

export const Progress = component$<{ value?: number; max?: number; label: string }>((props) => {
  const indeterminate = props.value === undefined;
  const safeMax = props.max !== undefined && props.max > 0 ? props.max : 100;
  const percent = indeterminate || props.value === undefined ? undefined : Math.min(100, Math.max(0, (props.value / safeMax) * 100));
  return (
    <div
      class={cx('wpl-progress-track', indeterminate && 'wpl-progress-indeterminate')}
      role="progressbar"
      aria-label={props.label}
      aria-valuemin={0}
      aria-valuemax={safeMax}
      aria-valuenow={indeterminate ? undefined : props.value}
    >
      <span class="wpl-progress-bar" style={percent === undefined ? undefined : { inlineSize: `${percent}%` }} />
    </div>
  );
});

export const Skeleton = component$<{ width?: string; height?: string; class?: string }>((props) => {
  return <span class={cx('wpl-skeleton', props.class)} style={{ width: props.width ?? '100%', height: props.height ?? '1rem' }} aria-hidden="true" />;
});

export const StatCard = component$<{ label: string; value: string; hint?: string }>((props) => {
  return (
    <article class="wpl-card wpl-stat">
      <p class="wpl-stat-label">{props.label}</p>
      <p class="wpl-stat-value">{props.value}</p>
      {props.hint ? <p class="wpl-stat-hint">{props.hint}</p> : null}
    </article>
  );
});

export const Notification = component$<{
  title: string;
  description?: string;
  variant?: AlertVariant;
  onDismiss$?: QRL<() => void>;
}>((props) => {
  const wpl = useWhitePlumeria();
  const variant = props.variant ?? 'neutral';
  return (
    <div class={notificationClassName(variant)} role={variant === 'danger' ? 'alert' : 'status'}>
      <div>
        <p class="wpl-toast-title">{props.title}</p>
        {props.description ? <p class="wpl-toast-description">{props.description}</p> : null}
        <Slot />
      </div>
      {props.onDismiss$ ? (
        <IconButton
          label={wpl.t('dismiss')}
          onClick$={() => {
            void props.onDismiss$?.();
          }}
        />
      ) : null}
    </div>
  );
});
