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
} from '@angular/core';
import { bindDismissable, createId, nextIndex } from '@white-plumeria/core';
import { injectWhitePlumeria } from './provider';

export interface ComboOption {
  value: string;
  label: string;
}

@Component({
  selector: 'wpl-combobox',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  template: `
    <div class="wpl-combo">
      <label class="wpl-label" [attr.for]="id">{{ label() }}</label>
      <input
        class="wpl-input"
        role="combobox"
        [id]="id"
        [attr.aria-expanded]="open()"
        [attr.aria-controls]="listId"
        aria-autocomplete="list"
        [attr.aria-activedescendant]="open() ? listId + '-' + active() : null"
        [value]="query()"
        [placeholder]="placeholder() || null"
        (input)="onInput($event)"
        (focus)="open.set(true)"
        (keydown)="onKey($event)"
      />
      @if (open()) {
        <ul class="wpl-listbox" role="listbox" [id]="listId">
          @if (!filtered().length) {
            <li class="wpl-listbox-item">{{ emptyLabel() }}</li>
          } @else {
            @for (option of filtered(); track option.value; let index = $index) {
              <li>
                <button
                  type="button"
                  role="option"
                  class="wpl-listbox-item"
                  [id]="listId + '-' + index"
                  [attr.aria-selected]="option.value === value()"
                  [attr.data-active]="index === active() ? 'true' : null"
                  (mouseenter)="active.set(index)"
                  (click)="choose(option)"
                >
                  {{ option.label }}
                </button>
              </li>
            }
          }
        </ul>
      }
    </div>
  `,
})
export class Combobox {
  readonly label = input.required<string>();
  readonly options = input.required<ComboOption[]>();
  readonly value = input<string>();
  readonly placeholder = input<string>();
  readonly valueChange = output<string>();
  private readonly wpl = injectWhitePlumeria();
  private readonly host = inject(ElementRef<HTMLElement>);
  readonly id = createId('wpl-combo');
  readonly listId = this.id + '-list';
  readonly query = signal('');
  readonly open = signal(false);
  readonly active = signal(0);
  readonly emptyLabel = () => this.wpl.t('noResults');

  constructor() {
    effect((onCleanup) => {
      if (!this.open()) return;
      const stop = bindDismissable({ root: this.host.nativeElement, onDismiss: () => this.open.set(false) });
      onCleanup(stop);
    });
  }

  selected(): ComboOption | undefined {
    return this.options().find((option) => option.value === this.value());
  }

  filtered(): ComboOption[] {
    const selected = this.selected();
    const needle = this.query().trim().toLocaleLowerCase();
    if (!needle || needle === selected?.label.toLocaleLowerCase()) return this.options();
    return this.options().filter((option) => option.label.toLocaleLowerCase().includes(needle));
  }

  onInput(event: Event) {
    this.query.set(event.target instanceof HTMLInputElement ? event.target.value : '');
    this.open.set(true);
    this.active.set(0);
  }

  choose(option: ComboOption) {
    this.valueChange.emit(option.value);
    this.query.set(option.label);
    this.open.set(false);
  }

  onKey(event: KeyboardEvent) {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp' || event.key === 'Home' || event.key === 'End') {
      event.preventDefault();
      this.open.set(true);
      const next = nextIndex(this.active(), this.filtered().length, event.key, 'vertical');
      if (next !== null) this.active.set(next);
    }
    if (event.key === 'Enter' && this.open()) {
      event.preventDefault();
      const option = this.filtered()[this.active()];
      if (option) this.choose(option);
    }
    if (event.key === 'Escape') this.open.set(false);
  }
}
