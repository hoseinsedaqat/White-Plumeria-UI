import {
  alertClassName,
  alertVariants,
  badgeClassName,
  badgeVariants,
  buttonAppearances,
  buttonClassName,
  buttonSizes,
  buttonVariants,
  catalog,
  getComponent,
  gridClassName,
  gridColumns,
  type AlertVariant,
  type BadgeVariant,
  type GridColumns,
} from '@white-plumeria/core';
import type { PreviewNode } from './types.ts';

type Props = NonNullable<PreviewNode['props']>;

let fieldSerial = 0;

const known = new Set<string>();
for (const item of catalog) {
  for (const name of item.classes) {
    if (name.startsWith('wpl-')) known.add(name);
  }
  for (const match of item.examples.html.matchAll(/class="([^"]*)"/g)) {
    for (const token of (match[1] ?? '').split(/\s+/)) {
      if (token.startsWith('wpl-')) known.add(token);
    }
  }
}

/** Classes that already appear on a catalog component or in its HTML example. */
export function knownClassNames(): ReadonlySet<string> {
  return known;
}

export function renderClassMarkup(nodes: PreviewNode[]): string {
  fieldSerial = 0;
  const body = nodes.map((node) => renderNode(node, 0)).join('\n');
  return [
    '<!-- Requires @white-plumeria/styles. Use catalog wpl- classes only. Tailwind is not required. Packages are not on npm. -->',
    body,
    '',
  ].join('\n');
}

function renderNode(node: PreviewNode, indent: number): string {
  const props = node.props ?? {};
  const kids = (node.children ?? []).map((child) => renderNode(child, indent + 2)).join('\n');
  if (!node.text && !node.children?.length && node.props == null) return catalogMarkup(node, indent, '');
  switch (node.component) {
    case 'Button':
      return inline(
        indent,
        'button',
        buttonClasses(props),
        escapeHtml(textOf(node.text, textOf(props.label, 'Save changes'))),
        ' type="button"',
      );
    case 'Badge':
      return inline(
        indent,
        'span',
        classes('Badge', badgeClassName(badgeVariant(props.variant))),
        escapeHtml(textOf(node.text, textOf(props.label, 'Badge'))),
      );
    case 'Alert':
      return block(indent, 'div', classes('Alert', alertClassName(alertVariant(props.variant))), join(
        props.title
          ? line(indent + 2, `<p class="wpl-alert-title">${escapeHtml(String(props.title))}</p>`)
          : '',
        node.text ? line(indent + 2, `<p>${escapeHtml(node.text)}</p>`) : '',
        kids,
      ), ' role="status"');
    case 'PageHeader':
      return block(indent, 'header', 'wpl-page-header', join(
        line(indent + 2, `<h1 class="wpl-page-title">${escapeHtml(textOf(props.title, node.text ?? 'Page'))}</h1>`),
        props.description
          ? line(indent + 2, `<p class="wpl-page-description">${escapeHtml(String(props.description))}</p>`)
          : '',
        kids,
      ));
    case 'Grid':
      return block(
        indent,
        'div',
        classes('Grid', gridClassName(columnsOf(props.columns))),
        kids,
      );
    case 'StatCard':
      return block(indent, 'article', 'wpl-card wpl-stat', join(
        line(indent + 2, `<p class="wpl-stat-label">${escapeHtml(textOf(props.label))}</p>`),
        line(indent + 2, `<p class="wpl-stat-value">${escapeHtml(textOf(props.value))}</p>`),
        props.hint ? line(indent + 2, `<p class="wpl-stat-hint">${escapeHtml(String(props.hint))}</p>`) : '',
      ));
    case 'ChartContainer':
      return block(
        indent,
        'figure',
        'wpl-chart',
        line(indent + 2, `<figcaption>${escapeHtml(textOf(props.title, 'Sample'))}</figcaption>`),
      );
    case 'Card':
      return block(indent, 'section', 'wpl-card', join(
        props.title
          ? line(indent + 2, `<h2 class="wpl-card-title">${escapeHtml(String(props.title))}</h2>`)
          : '',
        props.description
          ? line(indent + 2, `<p class="wpl-card-description">${escapeHtml(String(props.description))}</p>`)
          : '',
        node.text ? line(indent + 2, `<p>${escapeHtml(node.text)}</p>`) : '',
        kids,
      ));
    case 'FormField':
      return block(indent, 'div', props.invalid === true ? 'wpl-field wpl-field-invalid' : 'wpl-field', join(
        line(indent + 2, `<label class="wpl-label">${escapeHtml(textOf(props.label, 'Field'))}</label>`),
        props.required === true ? line(indent + 2, '<p class="wpl-field-hint">Required</p>') : '',
        kids,
      ));
    case 'Input':
      return voidTag(indent, 'input', 'wpl-input', inputAttrs(props));
    case 'Select':
      return block(
        indent,
        'label',
        'wpl-field',
        join(
          escapeHtml(textOf(props.label, 'Select')),
          line(
            indent + 2,
            `<select class="wpl-select"${nameAttr(props.label)}><option value="white">White</option></select>`,
          ),
        ),
      );
    case 'Switch':
      return block(
        indent,
        'button',
        'wpl-switch',
        join(
          line(indent + 2, '<span class="wpl-switch-control"></span>'),
          line(indent + 2, escapeHtml(textOf(props.label, node.text ?? 'Switch'))),
        ),
        ` type="button" role="switch" aria-checked="${props.checked === true ? 'true' : 'false'}"`,
      );
    case 'EmptyState':
      return block(indent, 'div', 'wpl-empty', join(
        line(indent + 2, `<h2 class="wpl-empty-title">${escapeHtml(textOf(props.title, 'Empty'))}</h2>`),
        props.description
          ? line(indent + 2, `<p class="wpl-empty-description">${escapeHtml(String(props.description))}</p>`)
          : '',
        kids,
      ));
    case 'Dialog':
      return block(indent, 'dialog', 'wpl-dialog', join(
        props.title
          ? line(indent + 2, `<h2 class="wpl-dialog-title">${escapeHtml(String(props.title))}</h2>`)
          : '',
        node.text ? line(indent + 2, `<p class="wpl-dialog-body">${escapeHtml(node.text)}</p>`) : '',
        kids,
      ));
    case 'Calendar':
      return block(
        indent,
        'div',
        'wpl-calendar',
        line(indent + 2, '<div class="wpl-calendar-grid" role="grid"></div>'),
      );
    case 'DatePicker':
      return block(
        indent,
        'label',
        'wpl-field',
        join(
          escapeHtml(textOf(props.label, 'Date')),
          line(
            indent + 2,
            `<input class="wpl-input" type="date" value="${escapeHtml(textOf(props.value, '2026-10-27'))}" />`,
          ),
        ),
      );
    case 'DateRangePicker':
      return block(indent, 'div', 'wpl-date', join(
        line(indent + 2, `<label>Start <input class="wpl-input" value="${escapeHtml(textOf(props.start, '2026-10-12'))}" /></label>`),
        line(indent + 2, `<label>End <input class="wpl-input" value="${escapeHtml(textOf(props.end, '2026-10-18'))}" /></label>`),
        props.showTime === true
          ? line(indent + 2, `<label>Start time <input class="wpl-input" type="time" value="${escapeHtml(textOf(props.startTime, '09:00'))}" /></label>`)
          : '',
        props.showTime === true
          ? line(indent + 2, `<label>End time <input class="wpl-input" type="time" value="${escapeHtml(textOf(props.endTime, '18:00'))}" /></label>`)
          : '',
      ));
    case 'NumberField':
      return renderNumber(indent, props);
    case 'RangeSlider':
      return renderRange(indent, props);
    default:
      return generic(node, indent, kids);
  }
}

function renderNumber(indent: number, props: Props): string {
  const id = nextId(textOf(props.label, 'number'));
  const min = props.min == null ? '' : ` min="${escapeHtml(String(props.min))}"`;
  const max = props.max == null ? '' : ` max="${escapeHtml(String(props.max))}"`;
  const value = props.value == null ? '' : ` value="${escapeHtml(String(props.value))}"`;
  return block(indent, 'div', 'wpl-field', join(
    line(indent + 2, `<label class="wpl-label" for="${id}">${escapeHtml(textOf(props.label, 'Number'))}</label>`),
    block(
      indent + 2,
      'div',
      'wpl-number',
      join(
        line(indent + 4, '<button class="wpl-number-step" type="button">−</button>'),
        line(indent + 4, `<input class="wpl-input" id="${id}" type="number"${min}${max}${value} />`),
        line(indent + 4, '<button class="wpl-number-step" type="button">+</button>'),
      ),
    ),
  ));
}

function renderRange(indent: number, props: Props): string {
  const min = typeof props.min === 'number' ? props.min : 0;
  const max = typeof props.max === 'number' ? props.max : 500;
  const start = typeof props.start === 'number' ? props.start : 80;
  const end = typeof props.end === 'number' ? props.end : 320;
  const span = max - min || 1;
  const left = Math.round(((start - min) / span) * 100);
  const size = Math.round(((end - start) / span) * 100);
  const label = textOf(props.label, 'Value');
  return block(
    indent,
    'div',
    'wpl-range',
    join(
      line(indent + 2, '<span class="wpl-range-track"></span>'),
      line(indent + 2, '<span class="wpl-range-fill"></span>'),
      line(indent + 2, `<input class="wpl-range-input" type="range" min="${min}" max="${max}" value="${start}" aria-label="${escapeHtml(label)} start" />`),
      line(indent + 2, `<input class="wpl-range-input" type="range" min="${min}" max="${max}" value="${end}" aria-label="${escapeHtml(label)} end" />`),
    ),
    ` style="--wpl-range-start: ${left}%; --wpl-range-size: ${size}%"`,
  );
}

function generic(node: PreviewNode, indent: number, kids: string): string {
  return catalogMarkup(node, indent, kids);
}

function catalogMarkup(node: PreviewNode, indent: number, kids: string): string {
  const html = getComponent(node.component)?.examples.html.trim();
  if (!html) throw new Error(`Planner has no catalog HTML for ${node.component}.`);
  const indented = html
    .split('\n')
    .map((row) => (row.length ? `${' '.repeat(indent)}${row}` : row))
    .join('\n');
  if (!kids) return indented;
  const close = indented.lastIndexOf('</');
  if (close < 0) return `${indented}\n${kids}`;
  return `${indented.slice(0, close)}\n${kids}\n${' '.repeat(indent)}${indented.slice(close)}`;
}

function buttonClasses(props: Props): string {
  return classes(
    'Button',
    buttonClassName({
      variant: oneOf(props?.variant, buttonVariants, 'primary'),
      size: optionalOneOf(props?.size, buttonSizes),
      appearance: optionalOneOf(props?.appearance, buttonAppearances),
      loading: props?.loading === true,
      block: props?.block === true,
    }),
  );
}

function classes(component: string, value: string): string {
  const tokens = value.split(/\s+/).filter((token) => known.has(token));
  if (tokens.length) return tokens.join(' ');
  const fallback = getComponent(component)?.classes.find((name) => known.has(name));
  if (!fallback) throw new Error(`Planner has no catalog class for ${component}.`);
  return fallback;
}

function inputAttrs(props: Props): string {
  const type = oneOf(props?.type, ['text', 'email', 'password', 'number', 'date', 'time', 'search', 'tel', 'url'] as const, 'text');
  const placeholder = props?.placeholder ? ` placeholder="${escapeHtml(String(props.placeholder))}"` : '';
  const name = nameAttr(props?.name ?? props?.label);
  return ` type="${type}"${name}${placeholder}`;
}

function nameAttr(value: unknown): string {
  const name = textOf(value).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  return name ? ` name="${name}"` : '';
}

function nextId(label: string): string {
  fieldSerial += 1;
  const slug = label.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'field';
  return `wpl-${slug}-${fieldSerial}`;
}

function alertVariant(value: unknown): AlertVariant {
  return oneOf(value, alertVariants, 'neutral');
}

function badgeVariant(value: unknown): BadgeVariant {
  return oneOf(value, badgeVariants, 'primary');
}

function columnsOf(value: unknown): GridColumns {
  const parsed = typeof value === 'number' ? value : Number(value);
  return (gridColumns as readonly number[]).includes(parsed) ? (parsed as GridColumns) : 2;
}

function oneOf<T extends string>(value: unknown, allowed: readonly T[], fallback: T): T {
  return typeof value === 'string' && (allowed as readonly string[]).includes(value) ? (value as T) : fallback;
}

function optionalOneOf<T extends string>(value: unknown, allowed: readonly T[]): T | undefined {
  return typeof value === 'string' && (allowed as readonly string[]).includes(value) ? (value as T) : undefined;
}

function textOf(value: unknown, fallback = ''): string {
  return value == null ? fallback : String(value);
}

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (char) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char] ?? char,
  );
}

function line(indent: number, content: string): string {
  return `${' '.repeat(indent)}${content}`;
}

function join(...parts: string[]): string {
  return parts.filter(Boolean).join('\n');
}

function inline(indent: number, tag: string, className: string, text: string, attrs = ''): string {
  return `${' '.repeat(indent)}<${tag} class="${className}"${attrs}>${text}</${tag}>`;
}

function voidTag(indent: number, tag: string, className: string, attrs = ''): string {
  return `${' '.repeat(indent)}<${tag} class="${className}"${attrs} />`;
}

function block(indent: number, tag: string, className: string, inner: string, attrs = ''): string {
  const pad = ' '.repeat(indent);
  const open = `${pad}<${tag} class="${className}"${attrs}>`;
  if (!inner) return `${open}</${tag}>`;
  if (!inner.includes('\n') && !inner.startsWith(' ')) return `${open}${inner}</${tag}>`;
  return `${open}\n${inner}\n${pad}</${tag}>`;
}
