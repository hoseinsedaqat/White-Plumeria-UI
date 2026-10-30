export function markoTagFile(name: string): string {
  return `wpl-${name.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase()}.marko`;
}

export function markoExample(name: string, react: string): string {
  if (name === 'Toast') return toastExample();
  if (name === 'ResponsiveLayout') return responsiveExample();
  if (name === 'SplitPane') return splitExample();
  const body = jsxToMarko(react.trim());
  const used = componentNames(body);
  if (!used.includes(name)) used.unshift(name);
  const imports = used
    .map((item) => `import ${item} from "@white-plumeria/marko/tags/${markoTagFile(item)}";`)
    .join('\n');
  return `${imports}\nimport "@white-plumeria/styles";\n\n${body}\n`;
}

function toastExample(): string {
  return `import { pushToast } from "@white-plumeria/marko";
import Provider from "@white-plumeria/marko/tags/wpl-provider.marko";
import "@white-plumeria/styles";

<Provider persist=false>
  <button type="button" onClick(event) {
    pushToast(event.target, { title: "Saved", variant: "success" });
  }>Save</button>
</Provider>
`;
}

function responsiveExample(): string {
  return `import ResponsiveLayout from "@white-plumeria/marko/tags/wpl-responsive-layout.marko";
import Sidebar from "@white-plumeria/marko/tags/wpl-sidebar.marko";
import "@white-plumeria/styles";

<ResponsiveLayout>
  <@sidebar><Sidebar label="Docs" items=[]/></@sidebar>
  Main
</ResponsiveLayout>
`;
}

function splitExample(): string {
  return `import SplitPane from "@white-plumeria/marko/tags/wpl-split-pane.marko";
import "@white-plumeria/styles";

<SplitPane label="Resize editor" start="Notes" end="Preview"/>
`;
}

function componentNames(source: string): string[] {
  return [
    ...new Set(
      [...source.matchAll(/<([A-Z][A-Za-z0-9]*)\b/g)]
        .map((match) => match[1] ?? '')
        .filter(Boolean),
    ),
  ];
}

function jsxToMarko(source: string): string {
  let result = '';
  let index = 0;
  while (index < source.length) {
    const start = source.indexOf('<', index);
    if (start < 0) {
      result += source.slice(index);
      break;
    }
    result += source.slice(index, start);
    const next = source[start + 1] ?? '';
    if (next === '/' || next === '!' || /[a-z]/.test(next)) {
      const end = source.indexOf('>', start);
      result += source.slice(start, end + 1);
      index = end + 1;
      continue;
    }
    const name = /^<([A-Z][A-Za-z0-9]*)/.exec(source.slice(start))?.[1];
    if (!name) {
      result += '<';
      index = start + 1;
      continue;
    }
    const openEnd = tagEnd(source, start);
    let attrs = source.slice(start + name.length + 1, openEnd).trim();
    const self = attrs.endsWith('/');
    if (self) attrs = attrs.slice(0, -1).trim();
    const converted = convertAttrs(attrs);
    if (self) {
      result += `<${name}${converted ? ` ${converted}` : ''}/>`;
      index = openEnd + 1;
      continue;
    }
    const close = `</${name}>`;
    const closeAt = source.indexOf(close, openEnd + 1);
    const inner = closeAt < 0 ? '' : source.slice(openEnd + 1, closeAt);
    result += `<${name}${converted ? ` ${converted}` : ''}>${jsxToMarko(inner)}</${name}>`;
    index = closeAt < 0 ? source.length : closeAt + close.length;
  }
  return result;
}

function tagEnd(source: string, start: number): number {
  let quote = '';
  let braces = 0;
  for (let index = start; index < source.length; index += 1) {
    const char = source[index] ?? '';
    if (quote) {
      if (char === quote && source[index - 1] !== '\\') quote = '';
      continue;
    }
    if (char === '"' || char === "'") {
      quote = char;
      continue;
    }
    if (char === '{') braces += 1;
    else if (char === '}') braces = Math.max(0, braces - 1);
    else if (char === '>' && braces === 0) return index;
  }
  return source.length - 1;
}

function convertAttrs(attrs: string): string {
  if (!attrs) return '';
  const parts: string[] = [];
  let index = 0;
  while (index < attrs.length) {
    while (attrs[index] === ' ' || attrs[index] === '\n') index += 1;
    if (index >= attrs.length) break;
    const nameEnd = attrs.slice(index).search(/[\s=]/);
    const name = nameEnd < 0 ? attrs.slice(index) : attrs.slice(index, index + nameEnd);
    if (!name) break;
    index += name.length;
    if (attrs[index] !== '=') {
      parts.push(name);
      continue;
    }
    index += 1;
    if (attrs[index] === '{') {
      const end = matchingBrace(attrs, index);
      const value = attrs.slice(index + 1, end).trim();
      index = end + 1;
      if (/^on[A-Z]/.test(name) || /^set[A-Z]/.test(value) || value === 'open' || value === 'step')
        continue;
      if (value.startsWith('<')) continue;
      parts.push(`${name}=${value}`);
      continue;
    }
    const quote = attrs[index];
    if (quote === '"' || quote === "'") {
      const end = attrs.indexOf(quote, index + 1);
      parts.push(attrs.slice(index - name.length - 1, end + 1).trim());
      index = end + 1;
      continue;
    }
    const end = attrs.slice(index).search(/\s/);
    const raw = end < 0 ? attrs.slice(index) : attrs.slice(index, index + end);
    parts.push(`${name}=${raw}`);
    index += raw.length;
  }
  return parts.join(' ');
}

function matchingBrace(source: string, start: number): number {
  let depth = 0;
  for (let index = start; index < source.length; index += 1) {
    const char = source[index];
    if (char === '{') depth += 1;
    else if (char === '}') {
      depth -= 1;
      if (depth === 0) return index;
    }
  }
  return source.length - 1;
}
