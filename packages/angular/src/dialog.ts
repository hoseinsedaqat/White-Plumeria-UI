import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  ViewEncapsulation,
  booleanAttribute,
  effect,
  input,
  output,
  viewChild,
} from '@angular/core';
import { createFocusTrap, createId, supportsModalDialog, type FocusTrap } from '@white-plumeria/core';
import { IconButton } from './button';
import { injectWhitePlumeria } from './provider';

@Component({
  selector: 'wpl-dialog',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  imports: [IconButton],
  template: `
    <dialog
      #dialog
      [class]="dialogClass()"
      [attr.aria-labelledby]="titleId"
      [attr.aria-describedby]="description() ? descriptionId : null"
      [attr.aria-modal]="open() ? true : null"
      (cancel)="onCancel($event)"
      (keydown)="onEscape($event)"
    >
      <header class="wpl-dialog-header">
        <div>
          <h2 [id]="titleId" [class]="hideTitle() ? 'wpl-sr-only' : 'wpl-dialog-title'">{{ title() }}</h2>
          @if (description()) {
            <p [id]="descriptionId" [class]="hideTitle() ? 'wpl-sr-only' : 'wpl-dialog-description'">{{ description() }}</p>
          }
        </div>
        <button wplIconButton [label]="closeLabel()" (click)="openChange.emit(false)"></button>
      </header>
      <div class="wpl-dialog-body"><ng-content /></div>
      @if (footer()) {
        <footer class="wpl-dialog-footer">{{ footer() }}</footer>
      }
    </dialog>
  `,
})
export class Dialog {
  readonly open = input(false, { transform: booleanAttribute });
  readonly openChange = output<boolean>();
  readonly title = input.required<string>();
  readonly description = input<string>();
  readonly footer = input<string>();
  readonly hideTitle = input(false, { transform: booleanAttribute });
  readonly className = input('', { alias: 'class' });
  readonly titleId = createId('wpl-dialog-title');
  readonly descriptionId = createId('wpl-dialog-desc');
  readonly native = supportsModalDialog();
  private readonly wpl = injectWhitePlumeria();
  private readonly dialog = viewChild<ElementRef<HTMLDialogElement>>('dialog');
  private trap: FocusTrap | null = null;
  readonly closeLabel = () => this.wpl.t('close');

  constructor() {
    effect(() => {
      const dialog = this.dialog()?.nativeElement;
      if (!dialog) return;
      if (this.open() && !dialog.open) {
        if (this.native) dialog.showModal();
        else dialog.setAttribute('open', '');
      }
      if (!this.open() && dialog.open) {
        if (this.native) dialog.close();
        else dialog.removeAttribute('open');
      }
    });
    effect((onCleanup) => {
      if (this.native || !this.open()) return;
      const root = this.dialog()?.nativeElement;
      if (!root) return;
      const trap = createFocusTrap(root);
      this.trap = trap;
      trap.activate();
      onCleanup(() => {
        trap.deactivate();
        this.trap = null;
      });
    });
  }

  dialogClass(): string {
    const base = this.native ? 'wpl-dialog' : 'wpl-dialog-panel';
    return this.className() ? `${base} ${this.className()}` : base;
  }

  onCancel(event: Event) {
    event.preventDefault();
    this.openChange.emit(false);
  }

  onEscape(event: KeyboardEvent) {
    if (event.key !== 'Escape') return;
    event.stopPropagation();
    this.openChange.emit(false);
  }
}

@Component({
  selector: 'wpl-modal',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  imports: [Dialog],
  template: `
    <wpl-dialog
      [open]="open()"
      [title]="title()"
      [description]="description()"
      [footer]="footer()"
      [hideTitle]="hideTitle()"
      [class]="className()"
      (openChange)="openChange.emit($event)"
    >
      <ng-content />
    </wpl-dialog>
  `,
})
export class Modal {
  readonly open = input(false, { transform: booleanAttribute });
  readonly openChange = output<boolean>();
  readonly title = input.required<string>();
  readonly description = input<string>();
  readonly footer = input<string>();
  readonly hideTitle = input(false, { transform: booleanAttribute });
  readonly className = input('', { alias: 'class' });
}

@Component({
  selector: 'wpl-drawer',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  imports: [Dialog],
  template: `
    <wpl-dialog
      [open]="open()"
      [title]="title()"
      [description]="description()"
      [footer]="footer()"
      [hideTitle]="hideTitle()"
      [class]="drawerClass()"
      (openChange)="openChange.emit($event)"
    >
      <ng-content />
    </wpl-dialog>
  `,
})
export class Drawer {
  readonly open = input(false, { transform: booleanAttribute });
  readonly openChange = output<boolean>();
  readonly title = input.required<string>();
  readonly description = input<string>();
  readonly footer = input<string>();
  readonly hideTitle = input(false, { transform: booleanAttribute });
  readonly className = input('', { alias: 'class' });
  readonly side = input<'start' | 'end'>('end');
  readonly native = supportsModalDialog();

  drawerClass(): string {
    const side = this.side() === 'start' ? (this.native ? 'wpl-drawer-start' : 'wpl-drawer-panel') : this.native ? 'wpl-drawer' : 'wpl-drawer-panel';
    return [side, this.className()].filter(Boolean).join(' ');
  }
}
