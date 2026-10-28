import { cx } from './cx.ts';
import type {
  AlertVariant,
  AvatarSize,
  BadgeVariant,
  ButtonVariant,
  ContainerSize,
  ControlSize,
  GridColumns,
  StackGap,
  ToastVariant,
} from './variants.ts';

export function buttonClassName(
  options: {
    variant?: ButtonVariant;
    size?: ControlSize;
    loading?: boolean;
    block?: boolean;
    className?: string;
  } = {},
): string {
  const variant = options.variant ?? 'primary';
  const size = options.size ?? 'md';
  return cx(
    'wpl-btn',
    `wpl-btn-${variant}`,
    size !== 'md' && `wpl-btn-${size}`,
    options.loading && 'wpl-btn-loading',
    options.block && 'wpl-btn-block',
    options.className,
  );
}

export function iconButtonClassName(
  options: { variant?: ButtonVariant; size?: ControlSize; className?: string } = {},
): string {
  const variant = options.variant ?? 'ghost';
  const size = options.size ?? 'md';
  return cx(
    'wpl-icon-btn',
    `wpl-btn-${variant}`,
    size !== 'md' && `wpl-icon-btn-${size}`,
    options.className,
  );
}

export function buttonGroupClassName(joined = false, className?: string): string {
  return cx('wpl-btn-group', joined && 'wpl-btn-group-joined', className);
}

export function badgeClassName(variant: BadgeVariant = 'neutral', className?: string): string {
  return cx('wpl-badge', variant !== 'neutral' && `wpl-badge-${variant}`, className);
}

export function avatarClassName(size: AvatarSize = 'md', className?: string): string {
  return cx('wpl-avatar', size !== 'md' && `wpl-avatar-${size}`, className);
}

export function alertClassName(variant: AlertVariant = 'neutral', className?: string): string {
  return cx('wpl-alert', variant !== 'neutral' && `wpl-alert-${variant}`, className);
}

export function inputClassName(
  options: { size?: ControlSize; className?: string } = {},
): string {
  const size = options.size ?? 'md';
  return cx('wpl-input', size !== 'md' && `wpl-input-${size}`, options.className);
}

export function textareaClassName(
  options: { size?: ControlSize; className?: string } = {},
): string {
  const size = options.size ?? 'md';
  return cx('wpl-textarea', size === 'lg' && 'wpl-textarea-lg', options.className);
}

export function selectClassName(
  options: { size?: ControlSize; className?: string } = {},
): string {
  const size = options.size ?? 'md';
  return cx('wpl-select', size !== 'md' && `wpl-select-${size}`, options.className);
}

export function toastClassName(variant: ToastVariant = 'neutral', className?: string): string {
  return cx('wpl-toast', variant !== 'neutral' && `wpl-toast-${variant}`, className);
}

export function containerClassName(size: ContainerSize = 'lg', className?: string): string {
  return cx('wpl-container', size !== 'lg' && `wpl-container-${size}`, className);
}

export function stackClassName(gap: StackGap = 'md', className?: string): string {
  return cx('wpl-stack', gap !== 'md' && `wpl-stack-${gap}`, className);
}

export function gridClassName(columns: GridColumns = 2, className?: string): string {
  return cx('wpl-grid', columns > 1 && `wpl-grid-${columns}`, className);
}

export function spinnerClassName(size: ControlSize = 'md', className?: string): string {
  return cx('wpl-spinner', size !== 'md' && `wpl-spinner-${size}`, className);
}

export function cardClassName(className?: string): string {
  return cx('wpl-card', className);
}

export function fieldClassName(invalid = false, className?: string): string {
  return cx('wpl-field', invalid && 'wpl-field-invalid', className);
}
