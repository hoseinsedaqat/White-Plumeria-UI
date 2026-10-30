const attributes: Record<string, string> = {
  pageCount: 'page-count',
  pageSize: 'page-size',
  showTime: 'show-time',
  startTime: 'start-time',
  endTime: 'end-time',
  maxSize: 'max-size',
  defaultValue: 'default-value',
  defaultChecked: 'default-checked',
  defaultIndex: 'default-index',
  defaultStart: 'default-start',
  defaultEnd: 'default-end',
  hideTitle: 'hide-title',
  visuallyHiddenLabel: 'visually-hidden-label',
  statusLabel: 'status-label',
  titleAs: 'title-as',
  reducedMotion: 'reduced-motion',
  inputMode: 'inputmode',
  readOnly: 'readonly',
  htmlFor: 'for',
  autoComplete: 'autocomplete',
};

const events: Record<string, string> = {
  onOpenChange: '@wpl-open-change',
  onSelect: '@wpl-select',
  onValueChange: '@wpl-change',
  onIndexChange: '@wpl-change',
  onPageChange: '@wpl-change',
  onCheckedChange: '@wpl-change',
  onFilesChange: '@wpl-change',
  onDismiss: '@wpl-dismiss',
  onSortChange: '@wpl-sort-change',
  onSizeChange: '@wpl-change',
  onTimeChange: '@wpl-time-change',
  onSearch: '@wpl-search',
  onClick: '@wpl-click',
};

export function litTag(name: string): string {
  return `wpl-${name.replace(/[A-Z]/g, (letter, index) => (index === 0 ? letter.toLowerCase() : `-${letter.toLowerCase()}`))}`;
}

export function litAttribute(name: string): string {
  return attributes[name] ?? name;
}

export function litExample(name: string, react: string): string {
  if (name === 'Toast') {
    return [
      'import { defineWhitePlumeria } from "@white-plumeria/lit";',
      'import "@white-plumeria/styles";',
      '',
      'defineWhitePlumeria();',
      '',
      'const provider = document.createElement("wpl-provider");',
      'document.body.append(provider);',
      'provider.pushToast({ title: "Saved", variant: "success" });',
      '',
    ].join('\n');
  }
  const markup =
    name === 'ResponsiveLayout'
      ? '<wpl-responsive-layout>\n  <wpl-sidebar slot="sidebar" label="Docs" .items=${[]}></wpl-sidebar>\n  Main\n</wpl-responsive-layout>'
      : name === 'SplitPane'
        ? '<wpl-split-pane label="Resize editor">\n  <p slot="start">Notes</p>\n  <p slot="end">Preview</p>\n</wpl-split-pane>'
        : reactToLit(react);
  return [
    'import { html, render } from "lit";',
    `import { ${name}, defineWhitePlumeria } from "@white-plumeria/lit";`,
    'import "@white-plumeria/styles";',
    '',
    'defineWhitePlumeria();',
    '',
    'const root = document.querySelector("#app");',
    'if (root) {',
    '  render(html`' + markup + '`, root);',
    '}',
    '',
  ].join('\n');
}

function reactToLit(source: string): string {
  let result = '';
  let index = 0;
  while (index < source.length) {
    if (source.startsWith('</', index) && /[A-Z]/.test(source[index + 2] ?? '')) {
      const end = source.indexOf('>', index);
      result += `</${litTag(source.slice(index + 2, end))}>`;
      index = end + 1;
      continue;
    }
    if (source[index] === '<' && /[A-Z]/.test(source[index + 1] ?? '')) {
      const end = findTagEnd(source, index);
      result += convertTag(source.slice(index, end));
      index = end;
      continue;
    }
    result += source[index];
    index += 1;
  }
  return result;
}

function convertTag(raw: string): string {
  const selfClosing = raw.endsWith('/>');
  const inner = raw.slice(1, selfClosing ? -2 : -1).trim();
  const name = /^[A-Z][A-Za-z0-9]*/.exec(inner)?.[0] ?? '';
  const tag = litTag(name);
  const attrs = convertAttrs(inner.slice(name.length));
  if (selfClosing) return `<${tag}${attrs}></${tag}>`;
  return `<${tag}${attrs}>`;
}

function convertAttrs(source: string): string {
  let index = 0;
  let result = '';
  while (index < source.length) {
    while (index < source.length && /\s/.test(source[index] ?? '')) index += 1;
    if (index >= source.length) break;
    const name = /^[A-Za-z_][\w-]*/.exec(source.slice(index))?.[0];
    if (!name) {
      result += source[index];
      index += 1;
      continue;
    }
    index += name.length;
    if (source[index] !== '=') {
      result += ` ${litAttribute(name)}`;
      continue;
    }
    index += 1;
    const quote = source[index];
    if (quote === '"' || quote === "'") {
      const end = source.indexOf(quote, index + 1);
      result += ` ${litAttribute(name)}="${source.slice(index + 1, end)}"`;
      index = end + 1;
      continue;
    }
    if (source[index] === '{') {
      const expression = readBrace(source, index);
      index += expression.length;
      result += convertExpression(name, expression.slice(1, -1).trim());
    }
  }
  return result;
}

function convertExpression(name: string, expression: string): string {
  const event = events[name];
  if (event) {
    if (expression === 'setOpen') return ` ${event}=\${(event) => setOpen(event.detail.open)}`;
    if (expression === 'setStep') return ` ${event}=\${(event) => setStep(event.detail.value)}`;
    return ` ${event}=\${${expression}}`;
  }
  if (expression === 'true') return ` ${litAttribute(name)}`;
  if (/^-?\d[\d_]*$/.test(expression)) return ` ${litAttribute(name)}="${expression.replaceAll('_', '')}"`;
  return ` .${name}=\${${expression}}`;
}

function findTagEnd(source: string, start: number): number {
  let quote: string | null = null;
  let braces = 0;
  for (let index = start + 1; index < source.length; index += 1) {
    const char = source[index];
    if (quote) {
      if (char === quote && source[index - 1] !== '\\') quote = null;
      continue;
    }
    if (char === '"' || char === "'") {
      quote = char;
      continue;
    }
    if (char === '{') braces += 1;
    else if (char === '}') braces = Math.max(0, braces - 1);
    else if (char === '>' && braces === 0) return index + 1;
  }
  return source.length;
}

function readBrace(source: string, start: number): string {
  let depth = 0;
  let quote: string | null = null;
  for (let index = start; index < source.length; index += 1) {
    const char = source[index];
    if (quote) {
      if (char === '\\') {
        index += 1;
        continue;
      }
      if (char === quote) quote = null;
      continue;
    }
    if (char === '"' || char === "'" || char === '`') {
      quote = char;
      continue;
    }
    if (char === '{') depth += 1;
    else if (char === '}') {
      depth -= 1;
      if (depth === 0) return source.slice(start, index + 1);
    }
  }
  return source.slice(start);
}
