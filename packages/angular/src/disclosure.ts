import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  booleanAttribute,
  input,
  output,
  signal,
} from '@angular/core';
import { createId, nextIndex, readingDirection } from '@white-plumeria/core';
import { Icon } from './icon';

export interface TabItem {
  id: string;
  label: string;
  panel: string;
}

export interface AccordionItem {
  id: string;
  title: string;
  content: string;
}

@Component({
  selector: 'wpl-tabs',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  template: `
    <div [class]="orientation() === 'vertical' ? 'wpl-tabs wpl-tabs-vertical' : 'wpl-tabs'">
      <div role="tablist" [attr.aria-orientation]="orientation()" class="wpl-tablist" (keydown)="onKey($event)">
        @for (tab of tabs(); track tab.id) {
          <button
            type="button"
            role="tab"
            class="wpl-tab"
            [id]="baseId + '-' + tab.id"
            [attr.aria-selected]="tab.id === selected()"
            [attr.aria-controls]="baseId + '-panel-' + tab.id"
            [attr.tabindex]="tab.id === selected() ? 0 : -1"
            (click)="select(tab.id)"
          >
            {{ tab.label }}
          </button>
        }
      </div>
      @for (tab of tabs(); track tab.id) {
        <div
          role="tabpanel"
          class="wpl-tabpanel"
          [id]="baseId + '-panel-' + tab.id"
          [attr.aria-labelledby]="baseId + '-' + tab.id"
          [hidden]="tab.id !== selected()"
          tabindex="0"
        >
          @if (tab.id === selected()) {
            {{ tab.panel }}
          }
        </div>
      }
    </div>
  `,
})
export class Tabs {
  readonly tabs = input.required<TabItem[]>();
  readonly value = input<string>();
  readonly defaultValue = input<string>();
  readonly orientation = input<'horizontal' | 'vertical'>('horizontal');
  readonly valueChange = output<string>();
  private readonly internal = signal<string | null>(null);
  readonly baseId = createId('wpl-tabs');

  selected(): string {
    return this.value() || this.internal() || this.defaultValue() || this.tabs()[0]?.id || '';
  }

  select(id: string) {
    if (this.value() === undefined) this.internal.set(id);
    this.valueChange.emit(id);
  }

  onKey(event: KeyboardEvent) {
    const tabs = this.tabs();
    const index = Math.max(0, tabs.findIndex((tab) => tab.id === this.selected()));
    const direction = readingDirection(event.currentTarget instanceof HTMLElement ? event.currentTarget : null);
    const next = nextIndex(index, tabs.length, event.key, this.orientation(), direction);
    if (next === null) return;
    event.preventDefault();
    const tab = tabs[next];
    if (!tab) return;
    this.select(tab.id);
    if (event.currentTarget instanceof HTMLElement) {
      event.currentTarget.querySelector<HTMLButtonElement>(`#${CSS.escape(`${this.baseId}-${tab.id}`)}`)?.focus();
    }
  }
}

@Component({
  selector: 'wpl-accordion',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  imports: [Icon],
  template: `
    <div class="wpl-accordion">
      @for (item of items(); track item.id) {
        <div class="wpl-accordion-item">
          <h3 style="margin: 0; font: inherit">
            <button
              type="button"
              class="wpl-accordion-trigger"
              [attr.aria-expanded]="isOpen(item.id)"
              [attr.aria-controls]="baseId + '-' + item.id"
              (click)="toggle(item.id)"
            >
              {{ item.title }}
              <wpl-icon name="chevronDown" [style.transform]="isOpen(item.id) ? 'rotate(180deg)' : null" />
            </button>
          </h3>
          <div class="wpl-accordion-panel" role="region" [id]="baseId + '-' + item.id" [hidden]="!isOpen(item.id)">
            @if (isOpen(item.id)) {
              {{ item.content }}
            }
          </div>
        </div>
      }
    </div>
  `,
})
export class Accordion {
  readonly items = input.required<AccordionItem[]>();
  readonly multiple = input(false, { transform: booleanAttribute });
  readonly value = input<string[]>();
  readonly valueChange = output<string[]>();
  private readonly internal = signal<string[] | null>(null);
  readonly baseId = createId('wpl-accordion');

  open(): string[] {
    return this.value() ?? this.internal() ?? (this.items()[0] ? [this.items()[0].id] : []);
  }

  isOpen(id: string): boolean {
    return this.open().includes(id);
  }

  toggle(id: string) {
    const open = this.open();
    const next = open.includes(id) ? open.filter((item) => item !== id) : this.multiple() ? [...open, id] : [id];
    if (this.value() === undefined) this.internal.set(next);
    this.valueChange.emit(next);
  }
}
