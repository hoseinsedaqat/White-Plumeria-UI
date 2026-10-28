import { formatNumber } from '@white-plumeria/core';
import { useId, useState } from 'react';
import { useWhitePlumeria } from './provider.tsx';

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

export function FileUpload({
  label,
  accept,
  maxSize,
  multiple = false,
  onFilesChange,
}: {
  label: string;
  accept?: string;
  maxSize?: number;
  multiple?: boolean;
  onFilesChange?: (files: File[]) => void;
}) {
  const id = useId();
  const { t, locale } = useWhitePlumeria();
  const [files, setFiles] = useState<File[]>([]);
  const [errors, setErrors] = useState<RejectedFile[]>([]);
  const [active, setActive] = useState(false);

  function acceptFiles(list: FileList | File[]) {
    const incoming = Array.from(list);
    const accepted: File[] = [];
    const rejected: RejectedFile[] = [];
    for (const file of incoming) {
      if (accept && !matchesAccept(file, accept)) {
        rejected.push({ name: file.name, reason: t('fileRejected') });
        continue;
      }
      if (maxSize !== undefined && file.size > maxSize) {
        rejected.push({ name: file.name, reason: t('fileRejected') });
        continue;
      }
      accepted.push(file);
    }
    const next = multiple ? [...files, ...accepted] : accepted.slice(0, 1);
    setFiles(next);
    setErrors(rejected);
    onFilesChange?.(next);
  }

  return (
    <div className="wpl-file">
      <label
        className="wpl-file-drop"
        data-active={active || undefined}
        htmlFor={id}
        onDragOver={(event) => {
          event.preventDefault();
          setActive(true);
        }}
        onDragLeave={() => setActive(false)}
        onDrop={(event) => {
          event.preventDefault();
          setActive(false);
          if (event.dataTransfer.files.length) acceptFiles(event.dataTransfer.files);
        }}
      >
        <span className="wpl-label">{label}</span>
        <span className="wpl-field-hint">
          {accept ? accept : locale === 'fa' ? 'هر نوع پرونده' : 'Any file type'}
          {maxSize ? ` · ${formatNumber(maxSize, locale)} B` : ''}
        </span>
        <input
          id={id}
          className="wpl-file-input"
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={(event) => {
            if (event.currentTarget.files) acceptFiles(event.currentTarget.files);
            event.currentTarget.value = '';
          }}
        />
      </label>
      {errors.length ? (
        <ul>
          {errors.map((error) => (
            <li key={error.name} className="wpl-field-error" role="alert">
              {error.name}: {error.reason}
            </li>
          ))}
        </ul>
      ) : null}
      {files.length ? (
        <ul className="wpl-file-list">
          {files.map((file) => (
            <li key={`${file.name}-${file.size}`} className="wpl-file-item">
              <span>
                {file.name}{' '}
                <span className="wpl-muted">{formatNumber(file.size, locale)} B</span>
              </span>
              <button
                type="button"
                className="wpl-btn wpl-btn-ghost wpl-btn-sm"
                onClick={() => {
                  const next = files.filter((item) => item !== file);
                  setFiles(next);
                  onFilesChange?.(next);
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
