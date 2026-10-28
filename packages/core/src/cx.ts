export function cx(...values: Array<string | false | null | undefined>): string {
  return values.filter((value): value is string => Boolean(value && value.trim())).join(' ');
}

export function normalizeClass(value: unknown): string {
  if (!value) return '';
  if (typeof value === 'string') return value;
  if (Array.isArray(value)) return value.map((item) => normalizeClass(item)).filter(Boolean).join(' ');
  if (typeof value === 'object') {
    return Object.entries(value as Record<string, unknown>)
      .filter(([, enabled]) => Boolean(enabled))
      .map(([key]) => key)
      .join(' ');
  }
  return '';
}
