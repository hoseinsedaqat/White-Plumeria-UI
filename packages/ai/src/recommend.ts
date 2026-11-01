import { catalog, searchComponents, type ComponentDoc } from '@white-plumeria/core';
import type { Recommendation } from './types.ts';

const synonyms: Record<string, string[]> = {
  dashboard: ['statcard', 'chartcontainer', 'pageheader', 'grid'],
  finance: ['datatable', 'statcard', 'datepicker', 'badge'],
  مالی: ['datatable', 'statcard', 'datepicker'],
  داشبورد: ['statcard', 'chartcontainer', 'pageheader'],
  table: ['datatable', 'table', 'pagination'],
  جدول: ['datatable', 'table'],
  form: ['formfield', 'input', 'button', 'validationmessage'],
  فرم: ['formfield', 'input', 'button'],
  dialog: ['dialog', 'modal'],
  date: ['datepicker', 'calendar', 'daterangepicker'],
  تاریخ: ['datepicker', 'calendar', 'daterangepicker'],
  range: ['daterangepicker', 'date-range-picker'],
  بازه: ['daterangepicker', 'date-range-picker'],
  nav: ['navbar', 'sidebar', 'breadcrumb'],
  chart: ['chartcontainer'],
  upload: ['fileupload'],
  search: ['searchinput', 'combobox'],
  steps: ['steps'],
  checkout: ['steps', 'formfield', 'button'],
  carousel: ['carousel'],
  slider: ['carousel', 'slider', 'rangeslider', 'range-slider'],
  price: ['rangeslider', 'range-slider', 'slider'],
  budget: ['rangeslider', 'range-slider'],
  password: ['passwordfield'],
  otp: ['otpfield'],
  rating: ['rating'],
  quantity: ['numberfield', 'number-field'],
  guests: ['numberfield', 'number-field'],
  stepper: ['numberfield', 'number-field'],
  segmented: ['togglegroup', 'toggle-group'],
  appearance: ['togglegroup', 'toggle-group'],
  toggle: ['togglegroup', 'toggle-group', 'switch'],
  kbd: ['kbd'],
};

export function componentsNamedInPrompt(prompt: string): { names: string[]; truncated: boolean } {
  const tokens = prompt
    .toLowerCase()
    .split(/[^\p{L}\p{N}+-]+/u)
    .map((term) => term.trim())
    .filter((term) => term.length > 1);
  const hits: Array<{ name: string; start: number; end: number }> = [];
  for (const component of catalog) {
    const parts = component.slug.split('-').filter(Boolean);
    for (let index = 0; index <= tokens.length - parts.length; index += 1) {
      if (parts.every((part, offset) => tokens[index + offset] === part)) {
        hits.push({ name: component.name, start: index, end: index + parts.length });
      }
    }
    for (const [index, token] of tokens.entries()) {
      const aliases = synonyms[token] ?? [];
      if (
        aliases.some(
          (alias) => alias === component.slug || alias.replace(/-/g, '') === component.slug.replace(/-/g, ''),
        )
      ) {
        hits.push({ name: component.name, start: index, end: index + 1 });
      }
    }
  }
  const visible = hits.filter(
    (hit) =>
      !hits.some(
        (other) =>
          other.name !== hit.name &&
          other.start <= hit.start &&
          other.end >= hit.end &&
          other.end - other.start > hit.end - hit.start,
      ),
  );
  const ordered: Array<{ name: string; start: number }> = [];
  for (const hit of visible) {
    const existing = ordered.find((item) => item.name === hit.name);
    if (!existing) ordered.push({ name: hit.name, start: hit.start });
    else if (hit.start < existing.start) existing.start = hit.start;
  }
  ordered.sort((left, right) => left.start - right.start || left.name.localeCompare(right.name));
  return { names: ordered.slice(0, 6).map((item) => item.name), truncated: ordered.length > 6 };
}

export function recommendComponents(prompt: string, limit = 6): Recommendation[] {
  const terms = prompt
    .toLowerCase()
    .split(/[^\p{L}\p{N}+-]+/u)
    .map((term) => term.trim())
    .filter((term) => term.length > 1);
  const boosted = new Map<string, number>();
  for (const term of terms) {
    const names = synonyms[term] ?? [];
    for (const name of names) boosted.set(name, (boosted.get(name) ?? 0) + 3);
  }
  const found = searchComponents(terms.join(' '));
  const pool = found.length > 0 ? found : catalog;
  const ranked = pool
    .map((component) => {
      const haystack = [
        component.name,
        component.slug,
        component.summary,
        component.summaryFa,
        ...component.tags,
      ]
        .join(' ')
        .toLowerCase();
      const overlap = terms.filter((term) => haystack.includes(term));
      const score =
        overlap.length +
        (boosted.get(component.slug) ?? 0) +
        (boosted.get(component.name.toLowerCase()) ?? 0);
      return { component, score, overlap };
    })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score || a.component.name.localeCompare(b.component.name))
    .slice(0, limit);

  return ranked.map((item) => reasonFor(item.component, item.overlap, item.score));
}

function reasonFor(component: ComponentDoc, overlap: string[], score: number): Recommendation {
  const matched = overlap.slice(0, 3).join(', ') || component.tags[0] || component.category;
  return {
    component: component.name,
    slug: component.slug,
    score,
    reason: `${component.name} is in the catalog under ${component.category}. It matches “${matched}”. ${component.summary}`,
    reasonFa: `${component.name} در کاتالوگ و دستهٔ ${component.category} است. با «${matched}» هم‌خوان است. ${component.summaryFa}`,
  };
}
