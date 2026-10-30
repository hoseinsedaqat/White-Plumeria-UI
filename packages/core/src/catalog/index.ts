import { catalog as baseCatalog } from './components.ts';
import { dataCatalog } from './data.ts';
import { formCatalog } from './forms.ts';
import { interactionCatalog } from './interaction.ts';
import { layoutCatalog } from './layout.ts';
import type { ComponentCategory, ComponentDoc } from './types.ts';

export const catalog: ComponentDoc[] = [
  ...baseCatalog,
  ...formCatalog,
  ...interactionCatalog,
  ...dataCatalog,
  ...layoutCatalog,
];

const names = new Set<string>();
for (const component of catalog) {
  if (names.has(component.name) || names.has(component.slug)) {
    throw new Error(`Duplicate catalog entry: ${component.name}`);
  }
  names.add(component.name);
  names.add(component.slug);
}

export function getComponent(nameOrSlug: string): ComponentDoc | undefined {
  const key = nameOrSlug.trim().toLowerCase();
  return catalog.find(
    (component) => component.name.toLowerCase() === key || component.slug === key,
  );
}

export function searchComponents(query: string, category?: ComponentCategory): ComponentDoc[] {
  const terms = query
    .toLowerCase()
    .split(/\s+/)
    .map((term) => term.trim())
    .filter(Boolean);
  return catalog
    .filter((component) => (category ? component.category === category : true))
    .map((component) => {
      const haystack = [
        component.name,
        component.slug,
        component.summary,
        component.summaryFa,
        component.category,
        ...component.tags,
        ...component.props.map((prop) => prop.name),
      ]
        .join(' ')
        .toLowerCase();
      const score = terms.reduce((total, term) => total + (haystack.includes(term) ? 1 : 0), 0);
      return { component, score: terms.length === 0 ? 1 : score };
    })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score || a.component.name.localeCompare(b.component.name))
    .map((item) => item.component);
}

export function componentNames(): string[] {
  return catalog.map((component) => component.name);
}

export { angularCloseTag, angularHost, angularSelector } from './angular.ts';
export type { AngularHost } from './angular.ts';
export { litAttribute, litTag } from './lit.ts';
export type { ComponentCategory, ComponentDoc, EventDoc, FrameworkExamples, PropDoc } from './types.ts';
export { categoryLabels } from './types.ts';
