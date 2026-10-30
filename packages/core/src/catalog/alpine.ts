export function alpineExample(name: string, react: string): string {
  const imported = name === 'Toast' ? 'pushToast, whitePlumeria' : 'whitePlumeria';
  const body = name === 'Toast' ? toastSnippet() : alpineMarkup(name, react);
  return `import Alpine from "alpinejs";
import { ${imported} } from "@white-plumeria/alpine";
import "@white-plumeria/styles";

document.addEventListener("alpine:init", () => {
  Alpine.plugin(whitePlumeria);
});
Alpine.start();

${body}
`;
}

function toastSnippet(): string {
  return `const region = document.querySelector("[data-wpl-provider]");
if (region) pushToast(region, { title: "Saved", variant: "success" });`;
}

function alpineMarkup(name: string, react: string): string {
  if (name === 'ResponsiveLayout') {
    return `<div x-data="ResponsiveLayout()">
  <div x-data="Sidebar({ label: 'Docs', items: [] })"></div>
  <p>Main</p>
</div>`;
  }
  if (name === 'SplitPane') {
    return `<div x-data="SplitPane({ label: 'Resize editor' })">
  <p data-wpl-start>Notes</p>
  <p data-wpl-end>Preview</p>
</div>`;
  }
  const converted = convertJsx(react.trim());
  return converted.includes(`x-data="${name}`) ? converted : `<div x-data="${name}()"></div>`;
}

function convertJsx(source: string): string {
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
    if (self) {
      result += element(name, attrs);
      index = openEnd + 1;
      continue;
    }
    const close = `</${name}>`;
    const closeAt = source.indexOf(close, openEnd + 1);
    const inner = closeAt < 0 ? '' : source.slice(openEnd + 1, closeAt);
    const nested = /<[A-Z]/.test(inner);
    const html = /<[a-z]/.test(inner);
    const text = inner.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
    if (nested) result += `<div x-data="${name}(${configFrom(attrs)})">\n${convertJsx(inner)}\n</div>`;
    else if (html) result += `<div x-data="${name}(${configFrom(attrs)})">${inner.trim()}</div>`;
    else result += element(name, attrs, text);
    index = closeAt < 0 ? source.length : closeAt + close.length;
  }
  return result.trim();
}

function element(name: string, attrs: string, text = ''): string {
  const config = configFrom(attrs, text);
  return `<div x-data="${name}(${config})"></div>`;
}

function configFrom(attrs: string, text = ''): string {
  const parts: string[] = [];
  let index = 0;
  while (index < attrs.length) {
    while (index < attrs.length && /\s/.test(attrs[index] ?? '')) index += 1;
    const name = /^[A-Za-z][A-Za-z0-9]*/.exec(attrs.slice(index))?.[0];
    if (!name) break;
    index += name.length;
    if (attrs[index] !== '=') {
      if (!name.startsWith('on')) parts.push(`${name}: true`);
      continue;
    }
    index += 1;
    if (attrs[index] === '"') {
      const end = attrs.indexOf('"', index + 1);
      parts.push(`${name}: '${escapeQuote(attrs.slice(index + 1, end))}'`);
      index = end + 1;
      continue;
    }
    if (attrs[index] === '{') {
      const end = matchingBrace(attrs, index);
      const raw = attrs.slice(index + 1, end).trim();
      index = end + 1;
      if (name.startsWith('on') || raw.includes('<') || /^[A-Za-z_][A-Za-z0-9_]*$/.test(raw)) continue;
      parts.push(`${name}: ${jsxLiteral(raw)}`);
    }
  }
  if (text && !parts.some((part) => part.startsWith('label:') || part.startsWith('title:'))) {
    parts.push(`label: '${escapeQuote(text)}'`);
  }
  return parts.length ? `{ ${parts.join(', ')} }` : '';
}

function jsxLiteral(raw: string): string {
  let out = '';
  let index = 0;
  while (index < raw.length) {
    const char = raw[index] ?? '';
    if (char === '"' || char === "'") {
      const end = raw.indexOf(char, index + 1);
      out += `'${escapeQuote(raw.slice(index + 1, end < 0 ? raw.length : end))}'`;
      index = end < 0 ? raw.length : end + 1;
      continue;
    }
    if (/[A-Za-z_]/.test(char)) {
      const word = /^[A-Za-z_][A-Za-z0-9_]*/.exec(raw.slice(index))?.[0] ?? char;
      const rest = raw.slice(index + word.length);
      if (/^\s*:/.test(rest) || word === 'true' || word === 'false' || word === 'null') out += word;
      else out += `'${word}'`;
      index += word.length;
      continue;
    }
    if (char === '_' && /\d/.test(raw[index - 1] ?? '')) {
      index += 1;
      continue;
    }
    out += char;
    index += 1;
  }
  return out;
}

function tagEnd(source: string, start: number): number {
  let quote = '';
  let depth = 0;
  for (let index = start; index < source.length; index += 1) {
    const char = source[index] ?? '';
    if (quote) {
      if (char === quote) quote = '';
      continue;
    }
    if (char === '"' || char === "'") {
      quote = char;
      continue;
    }
    if (char === '{') depth += 1;
    else if (char === '}') depth = Math.max(0, depth - 1);
    else if (char === '>' && depth === 0) return index;
  }
  return source.length - 1;
}

function matchingBrace(source: string, start: number): number {
  let depth = 0;
  let quote = '';
  for (let index = start; index < source.length; index += 1) {
    const char = source[index] ?? '';
    if (quote) {
      if (char === quote) quote = '';
      continue;
    }
    if (char === '"' || char === "'") {
      quote = char;
      continue;
    }
    if (char === '{') depth += 1;
    if (char === '}') {
      depth -= 1;
      if (depth === 0) return index;
    }
  }
  return source.length - 1;
}

function escapeQuote(value: string): string {
  return value.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
}
