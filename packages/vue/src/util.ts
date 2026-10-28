export function mergeClass(base: string, extra: unknown): string {
  if (!extra) return base;
  if (typeof extra === 'string') return `${base} ${extra}`.trim();
  if (Array.isArray(extra)) {
    return `${base} ${extra.filter((item) => typeof item === 'string').join(' ')}`.trim();
  }
  return base;
}

export function callListener(listener: unknown, event: Event): void {
  if (typeof listener === 'function') {
    listener(event);
    return;
  }
  if (Array.isArray(listener)) {
    for (const item of listener) callListener(item, event);
  }
}
