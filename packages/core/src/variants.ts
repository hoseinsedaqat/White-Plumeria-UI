export const buttonVariants = ['primary', 'secondary', 'outline', 'ghost', 'danger', 'link'] as const;
export type ButtonVariant = (typeof buttonVariants)[number];

export const controlSizes = ['sm', 'md', 'lg'] as const;
export type ControlSize = (typeof controlSizes)[number];

export const badgeVariants = ['neutral', 'primary', 'success', 'warning', 'danger'] as const;
export type BadgeVariant = (typeof badgeVariants)[number];

export const alertVariants = ['neutral', 'info', 'success', 'warning', 'danger'] as const;
export type AlertVariant = (typeof alertVariants)[number];

export const toastVariants = ['neutral', 'success', 'warning', 'danger'] as const;
export type ToastVariant = (typeof toastVariants)[number];

export const avatarSizes = ['sm', 'md', 'lg'] as const;
export type AvatarSize = (typeof avatarSizes)[number];

export const stackGaps = ['sm', 'md', 'lg'] as const;
export type StackGap = (typeof stackGaps)[number];

export const containerSizes = ['sm', 'md', 'lg', 'xl'] as const;
export type ContainerSize = (typeof containerSizes)[number];

export const gridColumns = [1, 2, 3, 4] as const;
export type GridColumns = (typeof gridColumns)[number];

export function isButtonVariant(value: string): value is ButtonVariant {
  return (buttonVariants as readonly string[]).includes(value);
}

export function isControlSize(value: string): value is ControlSize {
  return (controlSizes as readonly string[]).includes(value);
}
