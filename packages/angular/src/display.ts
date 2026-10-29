import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  booleanAttribute,
  computed,
  input,
  signal,
} from '@angular/core';
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
import { Icon } from './icon';
import { injectWhitePlumeria } from './provider';

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const first = parts[0]?.[0] ?? '';
  const second = parts.length > 1 ? (parts[parts.length - 1]?.[0] ?? '') : (parts[0]?.[1] ?? '');
  return `${first}${second}`.toUpperCase();
}

@Component({
  selector: 'a[wplLink]',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  imports: [Icon],
  template: `
    <ng-content />
    @if (external()) {
      <span class="wpl-sr-only"> ({{ newTab() }})</span>
      <wpl-icon name="external" />
    }
  `,
  host: {
    '[class]': 'classes()',
    '[attr.rel]': 'external() ? "noreferrer noopener" : null',
    '[attr.target]': 'external() ? "_blank" : null',
  },
})
export class Link {
  readonly external = input(false, { transform: booleanAttribute });
  readonly className = input('', { alias: 'class' });
  private readonly wpl = injectWhitePlumeria();
  readonly classes = computed(() => cx('wpl-link', this.className()));
  readonly newTab = computed(() => (this.wpl.preferences().locale === 'fa' ? 'در زبانهٔ جدید باز می‌شود' : 'opens in a new tab'));
}

@Component({
  selector: 'wpl-badge',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  template: `<ng-content />`,
  host: { '[class]': 'classes()' },
})
export class Badge {
  readonly variant = input<BadgeVariant>('neutral');
  readonly className = input('', { alias: 'class' });
  readonly classes = computed(() => badgeClassName(this.variant(), this.className()));
}

@Component({
  selector: 'wpl-avatar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  template: `
    @if (src() && !failed()) {
      <img [src]="src()" [alt]="alt() || name()" (error)="failed.set(true)" />
    } @else {
      <span [attr.aria-hidden]="src() ? null : true">{{ letters() }}</span>
    }
    @if (!src() && !alt()) {
      <span class="wpl-sr-only">{{ name() }}</span>
    }
    @if (status() && statusLabel()) {
      <span class="wpl-avatar-status" [style.background]="statusColor()"></span>
      <span class="wpl-sr-only">{{ statusLabel() }}</span>
    }
  `,
  host: { '[class]': 'classes()' },
})
export class Avatar {
  readonly name = input.required<string>();
  readonly src = input<string>();
  readonly alt = input<string>();
  readonly size = input<AvatarSize>('md');
  readonly status = input<'online' | 'busy' | 'offline'>();
  readonly statusLabel = input<string>();
  readonly className = input('', { alias: 'class' });
  readonly failed = signal(false);
  readonly letters = computed(() => initials(this.name()));
  readonly classes = computed(() => avatarClassName(this.size(), this.className()));
  readonly statusColor = computed(() =>
    this.status() === 'busy'
      ? 'var(--wpl-color-warning)'
      : this.status() === 'offline'
        ? 'var(--wpl-color-text-subtle)'
        : null,
  );
}

@Component({
  selector: 'wpl-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  template: `
    @if (title() || description()) {
      <header class="wpl-card-header">
        @switch (titleAs()) {
          @case ('h1') {
            <h1 class="wpl-card-title">{{ title() }}</h1>
          }
          @case ('h3') {
            <h3 class="wpl-card-title">{{ title() }}</h3>
          }
          @case ('h4') {
            <h4 class="wpl-card-title">{{ title() }}</h4>
          }
          @default {
            <h2 class="wpl-card-title">{{ title() }}</h2>
          }
        }
        @if (description()) {
          <p class="wpl-card-description">{{ description() }}</p>
        }
      </header>
    }
    <div class="wpl-card-body"><ng-content /></div>
    @if (footer()) {
      <div class="wpl-card-footer">{{ footer() }}</div>
    }
  `,
  host: { '[class]': 'classes()' },
})
export class Card {
  readonly title = input<string>();
  readonly description = input<string>();
  readonly titleAs = input<'h1' | 'h2' | 'h3' | 'h4'>('h2');
  readonly footer = input<string>();
  readonly className = input('', { alias: 'class' });
  readonly classes = computed(() => cardClassName(this.className()));
}

@Component({
  selector: 'wpl-divider',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  template: `
    @if (label()) {
      <div class="wpl-divider-labeled" role="separator">{{ label() }}</div>
    } @else {
      <hr class="wpl-divider" />
    }
  `,
})
export class Divider {
  readonly label = input<string>();
}

@Component({
  selector: 'wpl-separator',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  template: '',
  host: {
    role: 'separator',
    '[attr.aria-orientation]': 'orientation()',
    '[class]': 'classes()',
  },
})
export class Separator {
  readonly orientation = input<'horizontal' | 'vertical'>('horizontal');
  readonly className = input('', { alias: 'class' });
  readonly classes = computed(() => cx('wpl-separator', this.orientation() === 'vertical' && 'wpl-separator-vertical', this.className()));
}

@Component({
  selector: 'wpl-spinner',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  template: '',
  host: {
    role: 'status',
    '[class]': 'classes()',
    '[attr.aria-label]': 'accessibleLabel()',
  },
})
export class Spinner {
  readonly label = input<string>();
  readonly size = input<ControlSize>('md');
  readonly className = input('', { alias: 'class' });
  private readonly wpl = injectWhitePlumeria();
  readonly classes = computed(() => spinnerClassName(this.size(), this.className()));
  readonly accessibleLabel = computed(() => this.label() || this.wpl.t('loading'));
}

@Component({
  selector: 'wpl-skeleton',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  template: '',
  host: {
    'aria-hidden': 'true',
    '[class]': 'classes()',
    '[style.width]': 'width()',
    '[style.height]': 'height()',
  },
})
export class Skeleton {
  readonly width = input('100%');
  readonly height = input('1rem');
  readonly className = input('', { alias: 'class' });
  readonly classes = computed(() => cx('wpl-skeleton', this.className()));
}

@Component({
  selector: 'wpl-progress',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  template: `<span class="wpl-progress-bar" [style.inline-size]="percent()"></span>`,
  host: {
    role: 'progressbar',
    '[class]': 'classes()',
    '[attr.aria-label]': 'label()',
    '[attr.aria-valuemin]': '0',
    '[attr.aria-valuemax]': 'safeMax()',
    '[attr.aria-valuenow]': 'value() === undefined ? null : value()',
  },
})
export class Progress {
  readonly value = input<number>();
  readonly max = input(100);
  readonly label = input.required<string>();
  readonly safeMax = computed(() => (this.max() > 0 ? this.max() : 100));
  readonly percent = computed(() => {
    const value = this.value();
    if (value === undefined) return null;
    return `${Math.min(100, Math.max(0, (value / this.safeMax()) * 100))}%`;
  });
  readonly classes = computed(() => cx('wpl-progress-track', this.value() === undefined && 'wpl-progress-indeterminate'));
}

@Component({
  selector: 'wpl-empty',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  template: `
    <h2 class="wpl-empty-title">{{ title() }}</h2>
    @if (description()) {
      <p class="wpl-empty-description">{{ description() }}</p>
    }
    <ng-content />
  `,
  host: { class: 'wpl-empty' },
})
export class EmptyState {
  readonly title = input.required<string>();
  readonly description = input<string>();
}

@Component({
  selector: 'wpl-alert',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  imports: [Icon],
  template: `
    <wpl-icon [name]="iconName()" />
    <div>
      @if (title()) {
        <p class="wpl-alert-title">{{ title() }}</p>
      }
      <div class="wpl-alert-description"><ng-content /></div>
    </div>
  `,
  host: {
    '[class]': 'classes()',
    '[attr.role]': 'role()',
  },
})
export class Alert {
  readonly variant = input<AlertVariant>('neutral');
  readonly title = input<string>();
  readonly className = input('', { alias: 'class' });
  readonly classes = computed(() => alertClassName(this.variant(), this.className()));
  readonly role = computed(() => (this.variant() === 'danger' ? 'alert' : 'status'));
  readonly iconName = computed(() => (this.variant() === 'success' ? 'success' : this.variant() === 'neutral' ? 'info' : 'alert'));
}

@Component({
  selector: 'wpl-stat',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  template: `
    <p class="wpl-stat-label">{{ label() }}</p>
    <p class="wpl-stat-value">{{ value() }}</p>
    @if (hint()) {
      <p class="wpl-stat-hint">{{ hint() }}</p>
    }
  `,
  host: { class: 'wpl-card wpl-stat' },
})
export class StatCard {
  readonly label = input.required<string>();
  readonly value = input.required<string>();
  readonly hint = input<string>();
}
