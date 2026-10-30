import { createId, formatNumber } from '@white-plumeria/core';
import { defineTag, html, nothing, WplElement, type RenderResult } from './element';
import { localeOf, translate } from './provider';

export interface RejectedFile {
  name: string;
  reason: string;
}

function matchesAccept(file: File, accept: string): boolean {
  if (!accept.trim()) return true;
  const rules = accept.split(',').map((rule) => rule.trim().toLowerCase()).filter(Boolean);
  const name = file.name.toLowerCase();
  const type = file.type.toLowerCase();
  return rules.some((rule) => {
    if (rule.startsWith('.')) return name.endsWith(rule);
    if (rule.endsWith('/*')) return type.startsWith(rule.slice(0, -1));
    return type === rule;
  });
}

export class FileUpload extends WplElement {
  static override properties = {
    label: { type: String },
    accept: { type: String },
    maxSize: { type: Number, attribute: 'max-size' },
    multiple: { type: Boolean },
  };

  declare label: string;
  declare accept: string;
  declare maxSize: number | null;
  declare multiple: boolean;
  private files: File[] = [];
  private errors: RejectedFile[] = [];
  private active = false;
  private readonly inputId = createId('wpl-file');

  constructor() {
    super();
    this.label = '';
    this.accept = '';
    this.maxSize = null;
    this.multiple = false;
  }

  private acceptFiles(list: FileList | File[]): void {
    const incoming = Array.from(list);
    const accepted: File[] = [];
    const rejected: RejectedFile[] = [];
    for (const file of incoming) {
      if (this.accept && !matchesAccept(file, this.accept)) {
        rejected.push({ name: file.name, reason: translate(this, 'fileRejected') });
        continue;
      }
      if (this.maxSize !== null && file.size > this.maxSize) {
        rejected.push({ name: file.name, reason: translate(this, 'fileRejected') });
        continue;
      }
      accepted.push(file);
    }
    this.files = this.multiple ? [...this.files, ...accepted] : accepted.slice(0, 1);
    this.errors = rejected;
    this.emit('wpl-change', { value: this.files });
    this.requestUpdate();
  }

  protected override render(): RenderResult {
    const locale = localeOf(this);
    return html`<div class="wpl-file">
      <label
        class="wpl-file-drop"
        data-active=${this.active ? 'true' : nothing}
        for=${this.inputId}
        @dragover=${(event: DragEvent) => {
          event.preventDefault();
          this.active = true;
          this.requestUpdate();
        }}
        @dragleave=${() => {
          this.active = false;
          this.requestUpdate();
        }}
        @drop=${(event: DragEvent) => {
          event.preventDefault();
          this.active = false;
          if (event.dataTransfer?.files.length) this.acceptFiles(event.dataTransfer.files);
        }}
      >
        <span class="wpl-label">${this.label}</span>
        <span class="wpl-field-hint">
          ${this.accept || 'Any file type'}${this.maxSize !== null ? ` · ${formatNumber(this.maxSize, locale)} B` : ''}
        </span>
        <input
          id=${this.inputId}
          class="wpl-file-input"
          type="file"
          accept=${this.accept || nothing}
          ?multiple=${this.multiple}
          @change=${(event: Event) => {
            const element = event.target instanceof HTMLInputElement ? event.target : null;
            if (element?.files) this.acceptFiles(element.files);
            if (element) element.value = '';
          }}
        />
      </label>
      ${this.errors.length
        ? html`<ul>
            ${this.errors.map((error) => html`<li class="wpl-field-error" role="alert">${error.name}: ${error.reason}</li>`)}
          </ul>`
        : nothing}
      ${this.files.length
        ? html`<ul class="wpl-file-list">
            ${this.files.map(
              (file) => html`<li class="wpl-file-item">
                <span>${file.name} <span class="wpl-muted">${formatNumber(file.size, locale)} B</span></span>
                <button
                  type="button"
                  class="wpl-btn wpl-btn-ghost wpl-btn-sm"
                  @click=${() => {
                    this.files = this.files.filter((item) => item !== file);
                    this.emit('wpl-change', { value: this.files });
                    this.requestUpdate();
                  }}
                >
                  ${translate(this, 'dismiss')}
                </button>
              </li>`,
            )}
          </ul>`
        : nothing}
    </div>`;
  }
}

defineTag('wpl-file-upload', FileUpload);
