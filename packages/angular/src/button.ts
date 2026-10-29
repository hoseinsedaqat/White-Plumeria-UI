import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  booleanAttribute,
  computed,
  input,
} from '@angular/core';
import {
  buttonClassName,
  buttonGroupClassName,
  iconButtonClassName,
  type ButtonAppearance,
  type ButtonSize,
  type ButtonVariant,
} from '@white-plumeria/core';
import { Icon } from './icon';
import { injectWhitePlumeria } from './provider';

@Component({
  selector: 'button[wplButton]',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  template: `
    @if (loading()) {
      <span class="wpl-spinner wpl-spinner-sm" aria-hidden="true"></span>
      <span class="wpl-sr-only">{{ loadingLabel() }}</span>
    }
    <ng-content />
  `,
  host: {
    '[class]': 'classes()',
    '[attr.type]': 'type()',
    '[disabled]': 'inactive() ? true : null',
    '[attr.aria-busy]': 'loading() ? true : null',
    '(click)': 'guard($event)',
  },
})
export class Button {
  readonly variant = input<ButtonVariant>('primary');
  readonly size = input<ButtonSize>('md');
  readonly appearance = input<ButtonAppearance>('solid');
  readonly loading = input(false, { transform: booleanAttribute });
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly block = input(false, { transform: booleanAttribute });
  readonly type = input<'button' | 'submit' | 'reset'>('button');
  readonly className = input('', { alias: 'class' });
  private readonly wpl = injectWhitePlumeria();
  readonly inactive = computed(() => this.disabled() || this.loading());
  readonly loadingLabel = computed(() => this.wpl.t('loading'));
  readonly classes = computed(() =>
    buttonClassName({
      variant: this.variant(),
      size: this.size(),
      appearance: this.appearance(),
      loading: this.loading(),
      block: this.block(),
      className: this.className(),
    }),
  );

  guard(event: MouseEvent) {
    if (!this.inactive()) return;
    event.preventDefault();
    event.stopPropagation();
  }
}

@Component({
  selector: 'button[wplIconButton]',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  imports: [Icon],
  template: `
    <ng-content />
    @if (!projected()) {
      <wpl-icon name="close" />
    }
  `,
  host: {
    '[class]': 'classes()',
    type: 'button',
    '[attr.aria-label]': 'label()',
    '[disabled]': 'disabled() ? true : null',
    '(click)': 'guard($event)',
  },
})
export class IconButton {
  readonly label = input.required<string>();
  readonly variant = input<ButtonVariant>('ghost');
  readonly size = input<ButtonSize>('md');
  readonly appearance = input<ButtonAppearance>('solid');
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly className = input('', { alias: 'class' });
  readonly projected = input(false, { alias: 'hasIcon' });
  readonly classes = computed(() =>
    iconButtonClassName({
      variant: this.variant(),
      size: this.size(),
      appearance: this.appearance(),
      className: this.className(),
    }),
  );

  guard(event: MouseEvent) {
    if (!this.disabled()) return;
    event.preventDefault();
    event.stopPropagation();
  }
}

@Component({
  selector: 'wpl-button-group',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  template: `<ng-content />`,
  host: {
    role: 'group',
    '[attr.aria-label]': 'label()',
    '[class]': 'classes()',
  },
})
export class ButtonGroup {
  readonly label = input.required<string>();
  readonly joined = input(false, { transform: booleanAttribute });
  readonly className = input('', { alias: 'class' });
  readonly classes = computed(() => buttonGroupClassName(this.joined(), this.className()));
}
