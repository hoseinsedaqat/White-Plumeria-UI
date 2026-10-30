import { createFocusTrap, createId, supportsModalDialog, type FocusTrap } from '@white-plumeria/core';
import type { PropertyValues } from 'lit';
import { defineTag, html, nothing, WplElement, type RenderResult } from './element';
import { iconSvg } from './icon';
import { translate } from './provider';

export function openNativeDialog(dialog: HTMLDialogElement): void {
  if (dialog.open) return;
  try {
    dialog.showModal();
  } catch {
    dialog.setAttribute('open', '');
  }
}

export function closeNativeDialog(dialog: HTMLDialogElement): void {
  if (!dialog.open && !dialog.hasAttribute('open')) return;
  try {
    dialog.close();
  } catch {
    dialog.removeAttribute('open');
  }
}

export class Dialog extends WplElement {
  static override properties = {
    open: { type: Boolean },
    title: { type: String },
    description: { type: String },
    hideTitle: { type: Boolean, attribute: 'hide-title' },
  };

  declare open: boolean;
  declare title: string;
  declare description: string;
  declare hideTitle: boolean;
  private readonly titleId = createId('wpl-dialog-title');
  private readonly descriptionId = createId('wpl-dialog-desc');
  private trap: FocusTrap | null = null;
  private wired = false;

  constructor() {
    super();
    this.open = false;
    this.title = '';
    this.description = '';
    this.hideTitle = false;
  }

  override disconnectedCallback(): void {
    this.trap?.deactivate();
    this.trap = null;
    super.disconnectedCallback();
  }

  requestClose(): void {
    this.open = false;
    this.emit('wpl-open-change', { open: false });
  }

  protected override updated(changed: PropertyValues): void {
    super.updated(changed);
    const dialog = this.view.querySelector('dialog');
    if (dialog) {
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
    const fallback = this.view.querySelector<HTMLElement>('[data-wpl-fallback]');
    if (this.open && fallback && !supportsModalDialog()) {
      if (!this.trap) {
        this.trap = createFocusTrap(fallback);
        this.trap.activate();
      }
    } else {
      this.trap?.deactivate();
      this.trap = null;
    }
  }

  protected override render(): RenderResult {
    const native = supportsModalDialog();
    const titleClass = this.hideTitle ? 'wpl-sr-only' : 'wpl-dialog-title';
    const descriptionClass = this.hideTitle ? 'wpl-sr-only' : 'wpl-dialog-description';
    const body = html`
      <header class="wpl-dialog-header">
        <div>
          <h2 id=${this.titleId} class=${titleClass}>${this.title}</h2>
          ${this.description ? html`<p id=${this.descriptionId} class=${descriptionClass}>${this.description}</p>` : nothing}
        </div>
        <button type="button" class="wpl-icon-btn wpl-btn-ghost" aria-label=${translate(this, 'close')} @click=${() => this.requestClose()}>
          ${iconSvg('close')}
        </button>
      </header>
      <div class="wpl-dialog-body"><span data-wpl-slot="" style="display:contents"></span></div>
    `;
    if (!native) {
      if (!this.open) return nothing;
      return html`<div class="wpl-overlay">
        <div
          data-wpl-fallback
          role="dialog"
          aria-modal="true"
          aria-labelledby=${this.titleId}
          aria-describedby=${this.description ? this.descriptionId : nothing}
          class=${this.panelClass()}
          @keydown=${(event: KeyboardEvent) => {
            if (event.key === 'Escape') {
              event.stopPropagation();
              this.requestClose();
            }
          }}
        >
          ${body}
        </div>
      </div>`;
    }
    return html`<dialog
      class=${this.dialogClass()}
      aria-labelledby=${this.titleId}
      aria-describedby=${this.description ? this.descriptionId : nothing}
    >
      ${body}
    </dialog>`;
  }

  protected dialogClass(): string {
    return 'wpl-dialog';
  }

  protected panelClass(): string {
    return 'wpl-dialog-panel';
  }
}

export class Modal extends Dialog {}

export class Drawer extends Dialog {
  static override properties = {
    ...Dialog.properties,
    side: { type: String },
  };

  declare side: 'start' | 'end';

  constructor() {
    super();
    this.side = 'end';
  }

  protected override dialogClass(): string {
    return this.side === 'start' ? 'wpl-drawer wpl-drawer-start' : 'wpl-drawer';
  }

  protected override panelClass(): string {
    return 'wpl-drawer-panel';
  }
}

defineTag('wpl-dialog', Dialog);
defineTag('wpl-modal', Modal);
defineTag('wpl-drawer', Drawer);
