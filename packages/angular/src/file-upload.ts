import { ChangeDetectionStrategy, Component, ViewEncapsulation, booleanAttribute, computed, input, numberAttribute, output, signal } from '@angular/core';
import { createId, formatNumber } from '@white-plumeria/core';
import { injectWhitePlumeria } from './provider';

export interface RejectedFile {
  name: string;
  reason: string;
}

function matchesAccept(file: File, accept: string): boolean {
  if (!accept.trim()) return true;
  const rules = accept
    .split(',')
    .map((rule) => rule.trim().toLowerCase())
    .filter(Boolean);
  const name = file.name.toLowerCase();
  const type = file.type.toLowerCase();
  return rules.some((rule) => {
    if (rule.startsWith('.')) return name.endsWith(rule);
    if (rule.endsWith('/*')) return type.startsWith(rule.slice(0, -1));
    return type === rule;
  });
}

@Component({
  selector: 'wpl-file-upload',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  template: `
    <div class="wpl-file">
      <label class="wpl-file-drop" [attr.data-active]="active() ? 'true' : null" [attr.for]="inputId" (dragover)="onDrag($event)" (dragleave)="active.set(false)" (drop)="onDrop($event)">
        <span class="wpl-label">{{ label() }}</span>
        <span class="wpl-field-hint">{{ hint() }}</span>
        <input class="wpl-file-input" type="file" [id]="inputId" [accept]="accept() || null" [multiple]="multiple()" (change)="onChange($event)" />
      </label>
      @if (errors().length) {
        <ul>
          @for (error of errors(); track error.name) {
            <li class="wpl-field-error" role="alert">{{ error.name }}: {{ error.reason }}</li>
          }
        </ul>
      }
      @if (files().length) {
        <ul class="wpl-file-list">
          @for (file of files(); track file.name + file.size) {
            <li class="wpl-file-item">
              <span>
                {{ file.name }}
                <span class="wpl-muted">{{ sizeLabel(file.size) }}</span>
              </span>
              <button type="button" class="wpl-btn wpl-btn-ghost wpl-btn-sm" (click)="remove(file)">{{ dismissLabel() }}</button>
            </li>
          }
        </ul>
      }
    </div>
  `,
})
export class FileUpload {
  readonly label = input.required<string>();
  readonly accept = input<string>();
  readonly maxSize = input<number, unknown>(undefined, { transform: (value) => (value == null || value === '' ? undefined : numberAttribute(value)) });
  readonly multiple = input(false, { transform: booleanAttribute });
  readonly filesChange = output<File[]>();
  private readonly wpl = injectWhitePlumeria();
  readonly inputId = createId('wpl-file');
  readonly files = signal<File[]>([]);
  readonly errors = signal<RejectedFile[]>([]);
  readonly active = signal(false);
  readonly dismissLabel = computed(() => this.wpl.t('dismiss'));
  readonly hint = computed(() => {
    const locale = this.wpl.preferences().locale;
    const accept = this.accept() ? this.accept() : locale === 'fa' ? 'هر نوع پرونده' : 'Any file type';
    const max = this.maxSize();
    return `${accept}${max ? ` · ${formatNumber(max, locale)} B` : ''}`;
  });

  sizeLabel(size: number): string {
    return `${formatNumber(size, this.wpl.preferences().locale)} B`;
  }

  acceptFiles(list: FileList | File[]) {
    const incoming = Array.from(list);
    const accepted: File[] = [];
    const rejected: RejectedFile[] = [];
    const accept = this.accept();
    const maxSize = this.maxSize();
    for (const file of incoming) {
      if (accept && !matchesAccept(file, accept)) {
        rejected.push({ name: file.name, reason: this.wpl.t('fileRejected') });
        continue;
      }
      if (maxSize !== undefined && file.size > maxSize) {
        rejected.push({ name: file.name, reason: this.wpl.t('fileRejected') });
        continue;
      }
      accepted.push(file);
    }
    const next = this.multiple() ? [...this.files(), ...accepted] : accepted.slice(0, 1);
    this.files.set(next);
    this.errors.set(rejected);
    this.filesChange.emit(next);
  }

  onDrag(event: DragEvent) {
    event.preventDefault();
    this.active.set(true);
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    this.active.set(false);
    if (event.dataTransfer?.files.length) this.acceptFiles(event.dataTransfer.files);
  }

  onChange(event: Event) {
    const input = event.target instanceof HTMLInputElement ? event.target : null;
    if (input?.files) this.acceptFiles(input.files);
    if (input) input.value = '';
  }

  remove(file: File) {
    const next = this.files().filter((item) => item !== file);
    this.files.set(next);
    this.filesChange.emit(next);
  }
}
