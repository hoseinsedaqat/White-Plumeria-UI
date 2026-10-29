import { ChangeDetectionStrategy, Component, ViewEncapsulation, computed, input } from '@angular/core';
import { cx, directionalIcons, iconPaths, type IconName } from '@white-plumeria/core';

@Component({
  selector: 'wpl-icon',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  template: `
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
      fill="none"
      stroke="currentColor"
      stroke-width="1.75"
      stroke-linecap="round"
      stroke-linejoin="round"
      [class]="classes()"
    >
      <path [attr.d]="path()" />
    </svg>
  `,
  host: { style: 'display: inline-flex' },
})
export class Icon {
  readonly name = input.required<IconName>();
  readonly className = input('', { alias: 'class' });
  readonly path = computed(() => iconPaths[this.name()]);
  readonly classes = computed(() => cx('wpl-icon', directionalIcons.has(this.name()) && 'wpl-icon-dir', this.className()));
}

@Component({
  selector: 'wpl-mark',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  template: `
    <svg [class]="classes()" viewBox="0 0 64 64" aria-hidden="true">
      <g fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round" stroke-linecap="round">
        @for (angle of angles; track angle) {
          <path
            d="M32 10.5c5.2 6.7 6.6 14.1 1.6 21.1-1.1-2.2-2.1-2.2-3.2 0-5-7-3.6-14.4 1.6-21.1z"
            [attr.transform]="'rotate(' + angle + ' 32 32)'"
          />
        }
      </g>
      <circle cx="32" cy="32" r="2.15" fill="currentColor" />
    </svg>
  `,
  host: { style: 'display: inline-flex' },
})
export class Mark {
  readonly className = input('', { alias: 'class' });
  readonly angles = [0, 72, 144, 216, 288];
  readonly classes = computed(() => cx('wpl-mark', this.className()));
}
