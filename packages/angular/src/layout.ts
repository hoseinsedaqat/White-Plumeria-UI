import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  booleanAttribute,
  computed,
  input,
  output,
  signal,
} from '@angular/core';
import {
  containerClassName,
  createId,
  cx,
  gridClassName,
  readingDirection,
  stackClassName,
  type ContainerSize,
  type GridColumns,
  type StackGap,
} from '@white-plumeria/core';
import { IconButton } from './button';
import { injectWhitePlumeria } from './provider';

export interface NavItem {
  href: string;
  label: string;
  current?: boolean;
}

@Component({
  selector: 'wpl-container',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  template: `<ng-content />`,
  host: { '[class]': 'classes()' },
})
export class Container {
  readonly size = input<ContainerSize>('lg');
  readonly className = input('', { alias: 'class' });
  readonly classes = computed(() => containerClassName(this.size(), this.className()));
}

@Component({
  selector: 'wpl-stack',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  template: `<ng-content />`,
  host: { '[class]': 'classes()' },
})
export class Stack {
  readonly gap = input<StackGap>('md');
  readonly className = input('', { alias: 'class' });
  readonly classes = computed(() => stackClassName(this.gap(), this.className()));
}

@Component({
  selector: 'wpl-flex',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  template: `<ng-content />`,
  host: { '[class]': 'classes()' },
})
export class Flex {
  readonly justify = input<'start' | 'between' | 'end'>('start');
  readonly wrap = input(false, { transform: booleanAttribute });
  readonly className = input('', { alias: 'class' });
  readonly classes = computed(() =>
    cx('wpl-flex', this.wrap() && 'wpl-flex-wrap', this.justify() === 'between' && 'wpl-flex-between', this.justify() === 'end' && 'wpl-flex-end', this.className()),
  );
}

@Component({
  selector: 'wpl-grid',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  template: `<ng-content />`,
  host: { '[class]': 'classes()' },
})
export class Grid {
  readonly columns = input<GridColumns>(2);
  readonly className = input('', { alias: 'class' });
  readonly classes = computed(() => gridClassName(this.columns(), this.className()));
}

@Component({
  selector: 'wpl-navigation-menu',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  template: `
    <ul class="wpl-nav-menu">
      @for (item of items(); track item.href) {
        <li>
          <a class="wpl-nav-link" [href]="item.href" [attr.aria-current]="item.current ? 'page' : null">{{ item.label }}</a>
        </li>
      }
    </ul>
  `,
  host: { '[attr.aria-label]': 'label()' },
})
export class NavigationMenu {
  readonly items = input.required<NavItem[]>();
  readonly label = input.required<string>();
}

@Component({
  selector: 'wpl-navbar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  imports: [IconButton],
  template: `
    <a class="wpl-navbar-brand" [href]="href()">{{ brand() }}</a>
    <button
      wplIconButton
      class="wpl-navbar-toggle"
      [label]="toggleLabel()"
      [attr.aria-expanded]="open()"
      [attr.aria-controls]="menuId"
      [hasIcon]="true"
      (click)="open.set(!open())"
    >
      ☰
    </button>
    <ul class="wpl-nav-menu" [id]="menuId">
      @for (item of items(); track item.href) {
        <li>
          <a class="wpl-nav-link" [href]="item.href" [attr.aria-current]="item.current ? 'page' : null" (click)="open.set(false)">
            {{ item.label }}
          </a>
        </li>
      }
    </ul>
  `,
  host: {
    class: 'wpl-navbar',
    '[attr.data-open]': 'open() ? true : null',
  },
})
export class Navbar {
  readonly brand = input.required<string>();
  readonly href = input('#');
  readonly items = input.required<NavItem[]>();
  readonly open = signal(false);
  readonly menuId = createId('wpl-nav');
  private readonly wpl = injectWhitePlumeria();
  readonly toggleLabel = computed(() => this.wpl.t(this.open() ? 'closeMenu' : 'openMenu'));
}

@Component({
  selector: 'wpl-sidebar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  template: `
    @for (item of items(); track item.href) {
      <a [href]="item.href" [attr.aria-current]="item.current ? 'page' : null">{{ item.label }}</a>
    }
  `,
  host: {
    class: 'wpl-sidebar',
    '[attr.aria-label]': 'label()',
  },
})
export class Sidebar {
  readonly label = input.required<string>();
  readonly items = input.required<NavItem[]>();
}

@Component({
  selector: 'wpl-page-header',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  template: `
    <div>
      <h1 class="wpl-page-title">{{ title() }}</h1>
      @if (description()) {
        <p class="wpl-page-description">{{ description() }}</p>
      }
    </div>
    <div class="wpl-cluster"><ng-content /></div>
  `,
  host: { class: 'wpl-page-header' },
})
export class PageHeader {
  readonly title = input.required<string>();
  readonly description = input<string>();
}

@Component({
  selector: 'wpl-footer',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  template: `
    <p style="margin: 0">{{ note() }}</p>
    <ng-content />
  `,
  host: { class: 'wpl-footer' },
})
export class Footer {
  readonly note = input<string>();
}

@Component({
  selector: 'wpl-responsive-layout',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  template: `
    <ng-content select="wpl-sidebar" />
    <div class="wpl-layout-main"><ng-content /></div>
  `,
  host: {
    class: 'wpl-layout',
    '[attr.data-open]': 'open() ? true : null',
  },
})
export class ResponsiveLayout {
  readonly open = input(false, { transform: booleanAttribute });
}

@Component({
  selector: 'wpl-split-pane',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  template: `
    <div class="wpl-split-pane"><ng-content select="[wplStart]" /></div>
    <div
      role="separator"
      aria-orientation="vertical"
      aria-valuemin="20"
      aria-valuemax="80"
      [attr.aria-valuenow]="rounded()"
      [attr.aria-label]="label()"
      tabindex="0"
      class="wpl-split-separator"
      (keydown)="onKey($event)"
      (pointerdown)="onPointer($event)"
    ></div>
    <div class="wpl-split-pane"><ng-content select="[wplEnd]" /></div>
  `,
  host: {
    class: 'wpl-split',
    '[style.--wpl-split-size]': 'current() + "%"',
  },
})
export class SplitPane {
  readonly label = input.required<string>();
  readonly size = input<number>();
  readonly sizeChange = output<number>();
  private readonly internal = signal(50);

  current(): number {
    return this.size() ?? this.internal();
  }

  rounded(): number {
    return Math.round(this.current());
  }

  commit(next: number) {
    const clamped = Math.min(80, Math.max(20, next));
    if (this.size() === undefined) this.internal.set(clamped);
    this.sizeChange.emit(clamped);
  }

  onKey(event: KeyboardEvent) {
    const host = event.currentTarget instanceof HTMLElement ? event.currentTarget.parentElement : null;
    const direction = readingDirection(host);
    const step = event.key === 'ArrowRight' ? (direction === 'rtl' ? -5 : 5) : event.key === 'ArrowLeft' ? (direction === 'rtl' ? 5 : -5) : 0;
    if (!step) return;
    event.preventDefault();
    this.commit(this.current() + step);
  }

  onPointer(event: PointerEvent) {
    const separator = event.currentTarget;
    const root = separator instanceof HTMLElement ? separator.parentElement : null;
    if (!root || !(separator instanceof HTMLElement)) return;
    separator.setPointerCapture(event.pointerId);
    const move = (next: PointerEvent) => {
      const rect = root.getBoundingClientRect();
      const direction = readingDirection(root);
      const ratio = direction === 'rtl' ? (rect.right - next.clientX) / rect.width : (next.clientX - rect.left) / rect.width;
      this.commit(ratio * 100);
    };
    const up = () => {
      separator.removeEventListener('pointermove', move);
      separator.removeEventListener('pointerup', up);
    };
    separator.addEventListener('pointermove', move);
    separator.addEventListener('pointerup', up);
  }
}
