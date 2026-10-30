import { createId, nextIndex } from '@white-plumeria/core';
import type { PropertyValues } from 'lit';
import { defineTag, html, nothing, WplElement, type RenderResult } from './element';
import { closeNativeDialog, openNativeDialog } from './dialog';
import { translate } from './provider';

export interface CommandItem {
  id: string;
  label: string;
  group?: string;
  keywords?: string[];
}

export class CommandPalette extends WplElement {
  static override properties = {
    open: { type: Boolean },
    commands: { attribute: false },
  };

  declare open: boolean;
  declare commands: CommandItem[];
  private query = '';
  private active = 0;
  private readonly listId = createId('wpl-command');
  private wired = false;

  constructor() {
    super();
    this.open = false;
    this.commands = [];
  }

  private filtered(): CommandItem[] {
    const needle = this.query.trim().toLocaleLowerCase();
    if (!needle) return this.commands;
    return this.commands.filter((command) =>
      [command.label, command.group, ...(command.keywords ?? [])].join(' ').toLocaleLowerCase().includes(needle),
    );
  }

  private requestClose(): void {
    this.open = false;
    this.emit('wpl-open-change', { open: false });
  }

  private choose(id: string): void {
    this.emit('wpl-select', { id });
    this.requestClose();
  }

  protected override updated(changed: PropertyValues): void {
    super.updated(changed);
    const dialog = this.view.querySelector('dialog');
    if (!dialog) return;
    if (!this.wired) {
      this.wired = true;
      dialog.addEventListener('cancel', (event) => {
        event.preventDefault();
        this.requestClose();
      });
    }
    if (this.open) openNativeDialog(dialog);
    else closeNativeDialog(dialog);
  }

  protected override render(): RenderResult {
    const filtered = this.filtered();
    const title = translate(this, 'command');
    return html`<dialog class="wpl-dialog wpl-command" aria-label=${title}>
      <input
        class="wpl-input wpl-command-input"
        .value=${this.query}
        placeholder=${translate(this, 'search')}
        role="combobox"
        aria-expanded="true"
        aria-controls=${this.listId}
        aria-label=${title}
        @input=${(event: Event) => {
          const element = event.target instanceof HTMLInputElement ? event.target : null;
          this.query = element?.value ?? '';
          this.active = 0;
          this.requestUpdate();
        }}
        @keydown=${(event: KeyboardEvent) => {
          const next = nextIndex(this.active, filtered.length, event.key, 'vertical');
          if (next !== null) {
            event.preventDefault();
            this.active = next;
            this.requestUpdate();
          }
          if (event.key === 'Enter') {
            const command = filtered[this.active];
            if (command) this.choose(command.id);
          }
        }}
      />
      <div id=${this.listId} role="listbox" class="wpl-command-list">
        ${filtered.length === 0 ? html`<p class="wpl-muted">${translate(this, 'noResults')}</p>` : nothing}
        ${filtered.map(
          (command, index) => html`<button
            type="button"
            role="option"
            aria-selected=${index === this.active ? 'true' : 'false'}
            class="wpl-menu-item"
            data-active=${index === this.active ? 'true' : nothing}
            @mouseenter=${() => {
              this.active = index;
              this.requestUpdate();
            }}
            @click=${() => this.choose(command.id)}
          >
            <span>${command.label}</span>
            ${command.group ? html`<span class="wpl-menu-shortcut">${command.group}</span>` : nothing}
          </button>`,
        )}
      </div>
    </dialog>`;
  }
}

defineTag('wpl-command-palette', CommandPalette);
