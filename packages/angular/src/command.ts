import { ChangeDetectionStrategy, Component, ViewEncapsulation, booleanAttribute, computed, input, output, signal } from '@angular/core';
import { nextIndex } from '@white-plumeria/core';
import { Dialog } from './dialog';
import { injectWhitePlumeria } from './provider';

export interface CommandItem {
  id: string;
  label: string;
  group?: string;
  keywords?: string[];
}

@Component({
  selector: 'wpl-command-palette',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  imports: [Dialog],
  template: `
    <wpl-dialog [open]="open()" [title]="title()" hideTitle class="wpl-command" (openChange)="openChange.emit($event)">
      <input
        class="wpl-input wpl-command-input"
        role="combobox"
        aria-expanded="true"
        aria-controls="wpl-command-list"
        [attr.aria-label]="title()"
        [value]="query()"
        [placeholder]="searchLabel()"
        (input)="onInput($event)"
        (keydown)="onKey($event)"
      />
      <div id="wpl-command-list" role="listbox" class="wpl-command-list">
        @if (!filtered().length) {
          <p class="wpl-muted">{{ emptyLabel() }}</p>
        }
        @for (command of filtered(); track command.id; let index = $index) {
          <button
            type="button"
            role="option"
            class="wpl-menu-item"
            [attr.aria-selected]="index === active()"
            [attr.data-active]="index === active() ? 'true' : null"
            (mouseenter)="active.set(index)"
            (click)="choose(command)"
          >
            <span>{{ command.label }}</span>
            @if (command.group) {
              <span class="wpl-menu-shortcut">{{ command.group }}</span>
            }
          </button>
        }
      </div>
    </wpl-dialog>
  `,
})
export class CommandPalette {
  readonly open = input(false, { transform: booleanAttribute });
  readonly openChange = output<boolean>();
  readonly commands = input.required<CommandItem[]>();
  readonly select = output<string>();
  private readonly wpl = injectWhitePlumeria();
  readonly query = signal('');
  readonly active = signal(0);
  readonly title = computed(() => this.wpl.t('command'));
  readonly searchLabel = computed(() => this.wpl.t('search'));
  readonly emptyLabel = computed(() => this.wpl.t('noResults'));
  readonly filtered = computed(() => {
    const needle = this.query().trim().toLocaleLowerCase();
    const commands = this.commands();
    if (!needle) return commands;
    return commands.filter((command) =>
      [command.label, command.group, ...(command.keywords ?? [])].join(' ').toLocaleLowerCase().includes(needle),
    );
  });

  onInput(event: Event) {
    this.query.set(event.target instanceof HTMLInputElement ? event.target.value : '');
    this.active.set(0);
  }

  choose(command: CommandItem) {
    this.select.emit(command.id);
    this.openChange.emit(false);
  }

  onKey(event: KeyboardEvent) {
    const next = nextIndex(this.active(), this.filtered().length, event.key, 'vertical');
    if (next !== null) {
      event.preventDefault();
      this.active.set(next);
    }
    if (event.key === 'Enter') {
      const command = this.filtered()[this.active()];
      if (command) this.choose(command);
    }
  }
}
