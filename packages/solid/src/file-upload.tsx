import { formatNumber } from '@white-plumeria/core';
import { createSignal , createUniqueId } from 'solid-js';
import { useWhitePlumeria } from './provider.tsx';

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

export function FileUpload(props: {
  label: string;
  accept?: string;
  maxSize?: number;
  multiple?: boolean;
  onFilesChange?: (files: File[]) => void;
}) {
  const id = createUniqueId();
  const { t, locale } = useWhitePlumeria();
  const [files, setFiles] = createSignal<File[]>([]);
  const [errors, setErrors] = createSignal<RejectedFile[]>([]);
  const [active, setActive] = createSignal(false);

  function acceptFiles(list: FileList | File[]) {
    const incoming = Array.from(list);
    const accepted: File[] = [];
    const rejected: RejectedFile[] = [];
    for (const file of incoming) {
      if (props.accept && !matchesAccept(file, props.accept)) {
        rejected.push({ name: file.name, reason: t('fileRejected') });
        continue;
      }
      if (props.maxSize !== undefined && file.size > props.maxSize) {
        rejected.push({ name: file.name, reason: t('fileRejected') });
        continue;
      }
      accepted.push(file);
    }
    const next = props.multiple ? [...files(), ...accepted] : accepted.slice(0, 1);
    setFiles(next);
    setErrors(rejected);
    props.onFilesChange?.(next);
  }

  return (
    <div class="wpl-file">
      <label
        class="wpl-file-drop"
        data-active={active() || undefined}
        for={id}
        onDragOver={(event) => {
          event.preventDefault();
          setActive(true);
        }}
        onDragLeave={() => setActive(false)}
        onDrop={(event) => {
          event.preventDefault();
          setActive(false);
          if (event.dataTransfer?.files.length) acceptFiles(event.dataTransfer.files);
        }}
      >
        <span class="wpl-label">{props.label}</span>
        <span class="wpl-field-hint">
          {props.accept ? props.accept : 'Any file type'}
          {props.maxSize ? ` · ${formatNumber(props.maxSize, locale())} B` : ''}
        </span>
        <input
          id={id}
          class="wpl-file-input"
          type="file"
          accept={props.accept}
          multiple={props.multiple}
          onChange={(event) => {
            if (event.currentTarget.files) acceptFiles(event.currentTarget.files);
            event.currentTarget.value = '';
          }}
        />
      </label>
      {errors().length ? (
        <ul>
          {errors().map((error) => (
            <li class="wpl-field-error" role="alert">
              {error.name}: {error.reason}
            </li>
          ))}
        </ul>
      ) : null}
      {files().length ? (
        <ul class="wpl-file-list">
          {files().map((file) => (
            <li class="wpl-file-item">
              <span>
                {file.name} <span class="wpl-muted">{formatNumber(file.size, locale())} B</span>
              </span>
              <button
                type="button"
                class="wpl-btn wpl-btn-ghost wpl-btn-sm"
                onClick={() => {
                  const next = files().filter((item) => item !== file);
                  setFiles(next);
                  props.onFilesChange?.(next);
                }}
              >
                {t('dismiss')}
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
