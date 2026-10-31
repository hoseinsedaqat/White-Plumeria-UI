import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  effect,
  forwardRef,
  input,
  output,
} from '@angular/core';
import { notificationClassName, toastClassName, type ToastVariant } from '@white-plumeria/core';
import { IconButton } from './button';
import { injectWhitePlumeria, type ToastRecord } from './provider';

@Component({
  selector: 'wpl-toast-region',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  imports: [forwardRef(() => ToastView)],
  template: `
    <div class="wpl-toast-region" [attr.aria-label]="label()">
      @for (toast of wpl.toasts(); track toast.id) {
        <wpl-toast-view [toast]="toast" (dismiss)="wpl.dismissToast(toast.id)" />
      }
    </div>
  `,
})
export class ToastRegion {
  readonly wpl = injectWhitePlumeria();
  readonly label = () => this.wpl.t('notifications');

  constructor() {
    effect((onCleanup) => {
      const reduce = this.reduced();
      const toasts = this.wpl.toasts();
      if (reduce || typeof window === 'undefined') return;
      const timers = toasts.map((toast) => window.setTimeout(() => this.wpl.dismissToast(toast.id), toast.duration ?? 5000));
      onCleanup(() => {
        for (const timer of timers) window.clearTimeout(timer);
      });
    });
  }

  private reduced(): boolean {
    const mode = this.wpl.preferences().reducedMotion;
    if (mode === 'reduce') return true;
    if (mode !== 'system' || typeof matchMedia === 'undefined') return false;
    return matchMedia('(prefers-reduced-motion: reduce)').matches;
  }
}

@Component({
  selector: 'wpl-toast-view',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  imports: [IconButton],
  template: `
    <div [class]="classes()" [attr.role]="role()">
      <div>
        <p class="wpl-toast-title">{{ toast().title }}</p>
        @if (toast().description) {
          <p class="wpl-toast-description">{{ toast().description }}</p>
        }
      </div>
      <button wplIconButton [label]="dismissLabel()" (click)="dismiss.emit()"></button>
    </div>
  `,
})
export class ToastView {
  readonly toast = input.required<ToastRecord>();
  readonly dismiss = output<void>();
  private readonly wpl = injectWhitePlumeria();
  readonly dismissLabel = () => this.wpl.t('dismiss');
  readonly classes = () => toastClassName(this.toast().variant ?? 'neutral');
  readonly role = () => ((this.toast().variant ?? 'neutral') === 'danger' ? 'alert' : 'status');
}

@Component({
  selector: 'wpl-notification',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  imports: [IconButton],
  template: `
    <div [class]="classes()" [attr.role]="role()">
      <div>
        <p class="wpl-toast-title">{{ title() }}</p>
        @if (description()) {
          <p class="wpl-toast-description">{{ description() }}</p>
        }
        <ng-content />
      </div>
      @if (dismissable()) {
        <button wplIconButton [label]="dismissLabel()" (click)="dismiss.emit()"></button>
      }
    </div>
  `,
})
export class Notification {
  readonly title = input.required<string>();
  readonly description = input<string>();
  readonly variant = input<ToastVariant | 'info'>('neutral');
  readonly dismissable = input(false);
  readonly dismiss = output<void>();
  private readonly wpl = injectWhitePlumeria();
  readonly dismissLabel = () => this.wpl.t('dismiss');
  readonly classes = () => notificationClassName(this.variant());
  readonly role = () => (this.variant() === 'danger' ? 'alert' : 'status');
}
