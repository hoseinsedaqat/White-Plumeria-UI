export interface AngularHost {
  element: string;
  attribute?: string;
}

const attributeHosts: Record<string, AngularHost> = {
  Button: { element: 'button', attribute: 'wplButton' },
  IconButton: { element: 'button', attribute: 'wplIconButton' },
  Link: { element: 'a', attribute: 'wplLink' },
  Input: { element: 'input', attribute: 'wplInput' },
  Textarea: { element: 'textarea', attribute: 'wplTextarea' },
  Select: { element: 'select', attribute: 'wplSelect' },
};

const elementAliases: Record<string, string> = {
  EmptyState: 'wpl-empty',
  StatCard: 'wpl-stat',
  ChartContainer: 'wpl-chart',
  TreeView: 'wpl-tree',
  WhitePlumeriaProvider: 'wpl-provider',
};

export function angularHost(name: string): AngularHost {
  const attribute = attributeHosts[name];
  if (attribute) return attribute;
  const alias = elementAliases[name];
  if (alias) return { element: alias };
  return { element: `wpl-${name.replace(/[A-Z]/g, (letter, index) => (index === 0 ? letter.toLowerCase() : `-${letter.toLowerCase()}`))}` };
}

export function angularOpenTag(name: string, attrs = '', hasChildren = false): string {
  const host = angularHost(name);
  const extra = name === 'IconButton' && hasChildren ? ' [hasIcon]="true"' : '';
  const directive = host.attribute ? ` ${host.attribute}` : '';
  return `<${host.element}${directive}${extra}${attrs}>`;
}

export function angularCloseTag(name: string): string {
  return `</${angularHost(name).element}>`;
}

export function angularSelector(name: string): string {
  const host = angularHost(name);
  return host.attribute ? `${host.element}[${host.attribute}]` : host.element;
}
