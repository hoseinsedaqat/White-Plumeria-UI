import { formatNumber } from '@white-plumeria/core';
import { $, component$, useId, useSignal, type QRL } from '@qwik.dev/core';
import { useWhitePlumeria } from './provider';

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

export const FileUpload = component$<{
  label: string;
  accept?: string;
  maxSize?: number;
  multiple?: boolean;
  onFilesChange$?: QRL<(files: File[]) => void>;
}>((props) => {
  const id = useId();
  const wpl = useWhitePlumeria();
  const files = useSignal<File[]>([]);
  const errors = useSignal<RejectedFile[]>([]);
  const active = useSignal(false);
  const acceptFiles = $((list: FileList | File[]) => {
    const incoming = Array.from(list);
    const accepted: File[] = [];
    const rejected: RejectedFile[] = [];
    for (const file of incoming) {
      if (props.accept && !matchesAccept(file, props.accept)) {
        rejected.push({ name: file.name, reason: wpl.t('fileRejected') });
        continue;
      }
      if (props.maxSize !== undefined && file.size > props.maxSize) {
        rejected.push({ name: file.name, reason: wpl.t('fileRejected') });
        continue;
      }
      accepted.push(file);
    }
    const next = props.multiple ? [...files.value, ...accepted] : accepted.slice(0, 1);
    files.value = next;
    errors.value = rejected;
    void props.onFilesChange$?.(next);
  });

  return (
    <div class="wpl-file">
      <label
        class="wpl-file-drop"
        data-active={active.value || undefined}
        for={id}
        preventdefault:dragover
        preventdefault:drop
        onDragOver$={() => { active.value = true; }}
        onDragLeave$={() => { active.value = false; }}
        onDrop$={(event) => {
          active.value = false;
          if (event.dataTransfer?.files.length) void acceptFiles(event.dataTransfer.files);
        }}
      >
        <span class="wpl-label">{props.label}</span>
        <span class="wpl-field-hint">
          {props.accept ? props.accept : 'Any file type'}
          {props.maxSize ? ` · ${formatNumber(props.maxSize, wpl.locale)} B` : ''}
        </span>
        <input
          id={id}
          class="wpl-file-input"
          type="file"
          accept={props.accept}
          multiple={props.multiple}
          onChange$={(_, element) => {
            if (element.files) void acceptFiles(element.files);
            element.value = '';
          }}
        />
      </label>
      {errors.value.length ? (
        <ul>
          {errors.value.map((error) => (
            <li key={error.name} class="wpl-field-error" role="alert">{error.name}: {error.reason}</li>
          ))}
        </ul>
      ) : null}
      {files.value.length ? (
        <ul class="wpl-file-list">
          {files.value.map((file) => (
            <li key={`${file.name}-${file.size}`} class="wpl-file-item">
              <span>{file.name} <span class="wpl-muted">{formatNumber(file.size, wpl.locale)} B</span></span>
              <button
                type="button"
                class="wpl-btn wpl-btn-ghost wpl-btn-sm"
                onClick$={() => {
                  const next = files.value.filter((item) => item !== file);
                  files.value = next;
                  void props.onFilesChange$?.(next);
                }}
              >
                {wpl.t('dismiss')}
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
});
