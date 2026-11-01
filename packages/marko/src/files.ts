import { message, type Locale } from '@white-plumeria/core';

export interface RejectedFile {
  name: string;
  reason: string;
}

export interface TakenFiles {
  accepted: string[];
  rejected: RejectedFile[];
}

export function matchesFile(file: File, rule: string): boolean {
  if (!rule) return true;
  if (rule.startsWith('.')) return file.name.toLowerCase().endsWith(rule.toLowerCase());
  if (rule.endsWith('/*')) return file.type.startsWith(rule.slice(0, -1));
  return file.type === rule;
}

export function takeFiles(
  files: FileList | null,
  accept = '',
  maxSize = 0,
  locale: Locale = 'en',
): TakenFiles {
  const accepted: string[] = [];
  const rejected: RejectedFile[] = [];
  const rules = accept
    .split(',')
    .map((rule) => rule.trim())
    .filter(Boolean);
  for (const file of files ? [...files] : []) {
    const typeOk = rules.length === 0 || rules.some((rule) => matchesFile(file, rule));
    const sizeOk = !maxSize || file.size <= maxSize;
    if (!typeOk || !sizeOk)
      rejected.push({ name: file.name, reason: message(locale, 'fileRejected') });
    else accepted.push(file.name);
  }
  return { accepted, rejected };
}
