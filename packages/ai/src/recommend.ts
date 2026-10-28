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
  date: ['datepicker', 'calendar'],
  تاریخ: ['datepicker', 'calendar'],
  nav: ['navbar', 'sidebar', 'breadcrumb'],
  chart: ['chartcontainer'],
  upload: ['fileupload'],
  search: ['searchinput', 'combobox'],
};

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
      const haystack = [component.name, component.slug, component.summary, component.summaryFa, ...component.tags]
        .join(' ')
        .toLowerCase();
      const overlap = terms.filter((term) => haystack.includes(term));
      const score = overlap.length + (boosted.get(component.slug) ?? 0) + (boosted.get(component.name.toLowerCase()) ?? 0);
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
