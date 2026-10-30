import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  ViewEncapsulation,
  effect,
  inject,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';
import {
  bindDismissable,
  createId,
  firstEnabledIndex,
  menuCommand,
  menuHasSubmenu,
  moveEnabledIndex,
  typeaheadMove,
  placeOverlay,
  readingDirection,
  type MenuMotion,
} from '@white-plumeria/core';

export interface MenuItem {
  id: string;
  label: string;
  disabled?: boolean;
  shortcut?: string;
  items?: MenuItem[];
}

@Component({
  selector: 'wpl-dropdown-menu',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  template: `
    <button
      #trigger
      type="button"
      class="wpl-btn wpl-btn-secondary"
      aria-haspopup="menu"
      [attr.aria-expanded]="open()"
      [attr.aria-controls]="menuId"
      [attr.aria-activedescendant]="open() && current() ? menuId + '-' + current()?.id : null"
      (click)="toggle()"
      (keydown)="onKey($event)"
    >
      {{ label() }}
    </button>
    @if (open()) {
      <div #menu [id]="menuId" role="menu" class="wpl-menu wpl-menu-panel" [attr.aria-label]="label()">
        @for (item of items(); track item.id; let index = $index) {
          <div class="wpl-menu-row">
            <button
              type="button"
              role="menuitem"
              class="wpl-menu-item"
              [id]="menuId + '-' + item.id"
              [disabled]="item.disabled"
              [attr.aria-haspopup]="hasSub(item) ? 'menu' : null"
              [attr.aria-expanded]="expanded(item, index) ? true : null"
              [attr.aria-controls]="expanded(item, index) ? menuId + '-sub-' + item.id : null"
              [attr.data-active]="subActive() === null && index === active() ? 'true' : null"
              (mouseenter)="hover(index, item)"
              (click)="activate(item, index)"
            >
              <span>{{ item.label }}</span>
              @if (hasSub(item)) {
                <span class="wpl-menu-caret" aria-hidden="true"></span>
              } @else if (item.shortcut) {
                <span class="wpl-menu-shortcut">{{ item.shortcut }}</span>
              }
            </button>
            @if (expanded(item, index)) {
              <div class="wpl-menu wpl-menu-sub" role="menu" [id]="menuId + '-sub-' + item.id" [attr.aria-label]="item.label">
                @for (child of item.items ?? []; track child.id; let childIndex = $index) {
                  <button
                    type="button"
                    role="menuitem"
                    class="wpl-menu-item"
                    [id]="menuId + '-' + child.id"
                    [disabled]="child.disabled"
                    [attr.data-active]="childIndex === subActive() ? 'true' : null"
                    (mouseenter)="subActive.set(childIndex)"
                    (click)="selectLeaf(child)"
                  >
                    <span>{{ child.label }}</span>
                    @if (child.shortcut) {
                      <span class="wpl-menu-shortcut">{{ child.shortcut }}</span>
                    }
                  </button>
                }
              </div>
            }
          </div>
        }
      </div>
    }
  `,
  host: { class: 'wpl-menu-root' },
})
export class DropdownMenu {
  readonly label = input.required<string>();
  readonly items = input.required<MenuItem[]>();
  readonly select = output<string>();
  readonly open = signal(false);
  readonly active = signal(0);
  readonly subActive = signal<number | null>(null);
  private readonly typeahead = { query: '', at: 0 };
  readonly menuId = createId('wpl-menu');
  private readonly trigger = viewChild<ElementRef<HTMLButtonElement>>('trigger');
  private readonly menu = viewChild<ElementRef<HTMLElement>>('menu');
  private readonly subRef = signal<number | null>(null);

  constructor() {
    effect((onCleanup) => {
      if (!this.open()) return;
      const root = this.menu()?.nativeElement;
      if (!root) return;
      const stop = bindDismissable({
        root,
        owner: this.trigger()?.nativeElement,
        onDismiss: () => {
          if (this.subRef() !== null) {
            this.subRef.set(null);
            this.subActive.set(null);
            return;
          }
          this.open.set(false);
        },
      });
      onCleanup(stop);
    });
  }

  current(): MenuItem | undefined {
    const parent = this.items()[this.active()];
    const sub = this.subActive();
    if (sub === null) return parent;
    return parent?.items?.[sub];
  }

  hasSub(item: MenuItem): boolean {
    return menuHasSubmenu(item);
  }

  expanded(item: MenuItem, index: number): boolean {
    return menuHasSubmenu(item) && index === this.active() && this.subActive() !== null;
  }

  toggle() {
    this.open.update((value) => !value);
    this.subActive.set(null);
    this.subRef.set(null);
    this.active.set(firstEnabledIndex(this.items()));
  }

  hover(index: number, item: MenuItem) {
    this.active.set(index);
    if (menuHasSubmenu(item)) this.openSubmenu(index);
    else {
      this.subRef.set(null);
      this.subActive.set(null);
    }
  }

  activate(item: MenuItem, index: number) {
    if (menuHasSubmenu(item)) this.openSubmenu(index);
    else if (!item.disabled) this.selectLeaf(item);
  }

  selectLeaf(item: MenuItem) {
    if (item.disabled) return;
    this.select.emit(item.id);
    this.open.set(false);
    this.subActive.set(null);
    this.subRef.set(null);
    this.trigger()?.nativeElement.focus();
  }

  openSubmenu(index = this.active()) {
    const item = this.items()[index];
    if (!menuHasSubmenu(item)) return;
    const next = firstEnabledIndex(item.items ?? []);
    this.subRef.set(next);
    this.active.set(index);
    this.subActive.set(next);
  }

  onKey(event: KeyboardEvent) {
    const current = this.current();
    const command = menuCommand({
      key: event.key,
      direction: readingDirection(this.trigger()?.nativeElement),
      open: this.open(),
      submenuOpen: this.subActive() !== null,
      hasSubmenu: menuHasSubmenu(current),
    });
    if (!command) {
      if (!this.open()) return;
      const parent = this.items()[this.active()];
      const pool = this.subActive() === null ? this.items() : (parent?.items ?? []);
      const from = this.subActive() === null ? this.active() : (this.subActive() ?? 0);
      const next = typeaheadMove(this.typeahead, pool, event.key, Date.now(), from);
      if (next === null) return;
      event.preventDefault();
      if (this.subActive() === null) this.active.set(next);
      else this.subActive.set(next);
      return;
    }
    event.preventDefault();
    if (command === 'close' || command === 'close-submenu') event.stopPropagation();
    if (command === 'open') {
      this.open.set(true);
      this.active.set(firstEnabledIndex(this.items()));
      this.subActive.set(null);
      this.subRef.set(null);
      return;
    }
    if (command === 'close') {
      this.open.set(false);
      this.subActive.set(null);
      this.subRef.set(null);
      return;
    }
    if (command === 'close-submenu') {
      this.subRef.set(null);
      this.subActive.set(null);
      return;
    }
    if (command === 'open-submenu') {
      this.open.set(true);
      this.openSubmenu();
      return;
    }
    if (command === 'activate') {
      if (current && !current.disabled && !menuHasSubmenu(current)) this.selectLeaf(current);
      return;
    }
    if (!this.open()) {
      this.open.set(true);
      this.active.set(firstEnabledIndex(this.items()));
      this.subActive.set(null);
      return;
    }
    const motion = command as MenuMotion;
    if (this.subActive() === null) this.active.set(moveEnabledIndex(this.items(), this.active(), motion));
    else this.subActive.set(moveEnabledIndex(this.items()[this.active()]?.items ?? [], this.subActive() ?? 0, motion));
  }
}

@Component({
  selector: 'wpl-context-menu',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  template: `
    <ng-content />
    @if (point(); as origin) {
      <div #menu [id]="menuId" role="menu" class="wpl-menu wpl-menu-fixed" [attr.aria-label]="label()" [style.left.px]="origin.x" [style.top.px]="origin.y">
        @for (item of items(); track item.id; let index = $index) {
          <div class="wpl-menu-row">
            <button
              type="button"
              role="menuitem"
              class="wpl-menu-item"
              [id]="menuId + '-' + item.id"
              [disabled]="item.disabled"
              [attr.aria-haspopup]="hasSub(item) ? 'menu' : null"
              [attr.aria-expanded]="expanded(item, index) ? true : null"
              [attr.aria-controls]="expanded(item, index) ? menuId + '-sub-' + item.id : null"
              [attr.data-active]="subActive() === null && index === active() ? 'true' : null"
              (mouseenter)="hover(index, item)"
              (click)="activate(item, index)"
            >
              <span>{{ item.label }}</span>
              @if (hasSub(item)) {
                <span class="wpl-menu-caret" aria-hidden="true"></span>
              }
            </button>
            @if (expanded(item, index)) {
              <div class="wpl-menu wpl-menu-sub" role="menu" [id]="menuId + '-sub-' + item.id" [attr.aria-label]="item.label">
                @for (child of item.items ?? []; track child.id; let childIndex = $index) {
                  <button
                    type="button"
                    role="menuitem"
                    class="wpl-menu-item"
                    [id]="menuId + '-' + child.id"
                    [disabled]="child.disabled"
                    [attr.data-active]="childIndex === subActive() ? 'true' : null"
                    (mouseenter)="subActive.set(childIndex)"
                    (click)="selectLeaf(child)"
                  >
                    {{ child.label }}
                  </button>
                }
              </div>
            }
          </div>
        }
      </div>
    }
  `,
  host: {
    tabindex: '0',
    role: 'group',
    '[attr.aria-label]': 'label()',
    '[attr.aria-controls]': 'point() ? menuId : null',
    '[attr.aria-activedescendant]': 'point() && current() ? menuId + "-" + current()?.id : null',
    '(contextmenu)': 'onContext($event)',
    '(keydown)': 'onKey($event)',
  },
})
export class ContextMenu {
  readonly items = input.required<MenuItem[]>();
  readonly label = input('Context menu');
  readonly select = output<string>();
  readonly point = signal<{ x: number; y: number } | null>(null);
  readonly active = signal(0);
  readonly subActive = signal<number | null>(null);
  private readonly typeahead = { query: '', at: 0 };
  readonly menuId = createId('wpl-context');
  private readonly host = inject(ElementRef<HTMLElement>);
  private readonly menu = viewChild<ElementRef<HTMLElement>>('menu');
  private readonly subRef = signal<number | null>(null);

  constructor() {
    effect((onCleanup) => {
      const origin = this.point();
      const menu = this.menu()?.nativeElement;
      if (!origin || !menu) return;
      const placed = placeOverlay(
        { x: origin.x, y: origin.y, width: 0, height: 0 },
        { width: menu.offsetWidth || 180, height: menu.offsetHeight || 120 },
        { width: window.innerWidth, height: window.innerHeight },
        'end',
      );
      menu.style.left = `${placed.left}px`;
      menu.style.top = `${placed.top}px`;
      const stop = bindDismissable({
        root: menu,
        onDismiss: () => {
          if (this.subRef() !== null) {
            this.subRef.set(null);
            this.subActive.set(null);
            return;
          }
          this.point.set(null);
        },
      });
      onCleanup(stop);
    });
  }

  current(): MenuItem | undefined {
    const parent = this.items()[this.active()];
    const sub = this.subActive();
    if (sub === null) return parent;
    return parent?.items?.[sub];
  }

  hasSub(item: MenuItem): boolean {
    return menuHasSubmenu(item);
  }

  expanded(item: MenuItem, index: number): boolean {
    return menuHasSubmenu(item) && index === this.active() && this.subActive() !== null;
  }

  openAt(x: number, y: number) {
    this.subRef.set(null);
    this.subActive.set(null);
    this.active.set(firstEnabledIndex(this.items()));
    this.point.set({ x, y });
    this.host.nativeElement.focus();
  }

  onContext(event: MouseEvent) {
    event.preventDefault();
    this.openAt(event.clientX, event.clientY);
  }

  hover(index: number, item: MenuItem) {
    this.active.set(index);
    if (menuHasSubmenu(item)) this.openSubmenu(index);
    else {
      this.subRef.set(null);
      this.subActive.set(null);
    }
  }

  activate(item: MenuItem, index: number) {
    if (menuHasSubmenu(item)) this.openSubmenu(index);
    else if (!item.disabled) this.selectLeaf(item);
  }

  selectLeaf(item: MenuItem) {
    if (item.disabled) return;
    this.select.emit(item.id);
    this.subRef.set(null);
    this.subActive.set(null);
    this.point.set(null);
  }

  openSubmenu(index = this.active()) {
    const item = this.items()[index];
    if (!menuHasSubmenu(item)) return;
    const next = firstEnabledIndex(item.items);
    this.subRef.set(next);
    this.active.set(index);
    this.subActive.set(next);
  }

  onKey(event: KeyboardEvent) {
    if (event.shiftKey && event.key === 'F10') {
      event.preventDefault();
      const rect = this.host.nativeElement.getBoundingClientRect();
      this.openAt(rect.left, rect.bottom);
      return;
    }
    if (!this.point()) return;
    const current = this.current();
    const command = menuCommand({
      key: event.key,
      direction: readingDirection(this.host.nativeElement),
      open: true,
      submenuOpen: this.subActive() !== null,
      hasSubmenu: menuHasSubmenu(current),
    });
    if (!command) {
      const parent = this.items()[this.active()];
      const pool = this.subActive() === null ? this.items() : (parent?.items ?? []);
      const from = this.subActive() === null ? this.active() : (this.subActive() ?? 0);
      const next = typeaheadMove(this.typeahead, pool, event.key, Date.now(), from);
      if (next === null) return;
      event.preventDefault();
      if (this.subActive() === null) this.active.set(next);
      else this.subActive.set(next);
      return;
    }
    if (command === 'open') return;
    event.preventDefault();
    if (command === 'close' || command === 'close-submenu') event.stopPropagation();
    if (command === 'close') {
      this.subRef.set(null);
      this.subActive.set(null);
      this.point.set(null);
      return;
    }
    if (command === 'close-submenu') {
      this.subRef.set(null);
      this.subActive.set(null);
      return;
    }
    if (command === 'open-submenu') {
      this.openSubmenu();
      return;
    }
    if (command === 'activate') {
      if (current && !current.disabled && !menuHasSubmenu(current)) this.selectLeaf(current);
      return;
    }
    const motion = command as MenuMotion;
    if (this.subActive() === null) this.active.set(moveEnabledIndex(this.items(), this.active(), motion));
    else this.subActive.set(moveEnabledIndex(this.items()[this.active()]?.items ?? [], this.subActive() ?? 0, motion));
  }
}

@Component({
  selector: 'wpl-popover',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  template: `
    <button type="button" class="wpl-btn wpl-btn-secondary" [attr.aria-expanded]="open()" [attr.aria-controls]="id" (click)="open.set(!open())">
      {{ label() }}
    </button>
    @if (open()) {
      <div #panel class="wpl-popover" [id]="id">
        <ng-content />
      </div>
    }
  `,
  host: { style: 'position: relative; display: inline-block' },
})
export class Popover {
  readonly label = input('Details');
  readonly open = signal(false);
  readonly id = createId('wpl-popover');
  private readonly host = inject(ElementRef<HTMLElement>);
  private readonly panel = viewChild<ElementRef<HTMLElement>>('panel');

  constructor() {
    effect((onCleanup) => {
      if (!this.open()) return;
      const root = this.panel()?.nativeElement;
      if (!root) return;
      const stop = bindDismissable({
        root,
        owner: this.host.nativeElement,
        onDismiss: () => this.open.set(false),
      });
      onCleanup(stop);
    });
  }
}

@Component({
  selector: 'wpl-tooltip',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  template: `
    <span [attr.aria-describedby]="open() ? id : null" (mouseenter)="show()" (mouseleave)="hide()" (focusin)="show()" (focusout)="hide()">
      <ng-content />
    </span>
    @if (open()) {
      <span class="wpl-tooltip" role="tooltip" [id]="id">{{ content() }}</span>
    }
  `,
  host: { style: 'position: relative; display: inline-flex' },
})
export class Tooltip {
  readonly content = input.required<string>();
  readonly open = signal(false);
  readonly id = createId('wpl-tooltip');
  private timer = 0;

  show() {
    window.clearTimeout(this.timer);
    this.timer = window.setTimeout(() => this.open.set(true), 400);
  }

  hide() {
    window.clearTimeout(this.timer);
    this.open.set(false);
  }
}
