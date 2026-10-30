export function emberExample(name: string, react: string): string {
  if (name === 'Toast') return toastExample();
  if (name === 'ResponsiveLayout') return responsiveExample();
  if (name === 'SplitPane') return splitExample();
  const hoisted: string[] = [];
  const body = jsxToEmber(react.trim(), hoisted);
  const used = componentNames(body);
  if (!used.includes(name)) used.unshift(name);
  const consts = hoisted.length ? `${hoisted.join('\n')}\n\n` : '';
  return `import { ${used.join(', ')} } from "@white-plumeria/ember";\nimport "@white-plumeria/styles";\n\n${consts}<template>\n  ${body}\n</template>\n`;
}

function toastExample(): string {
  return `import { WhitePlumeriaProvider, pushToast } from "@white-plumeria/ember";
import "@white-plumeria/styles";

const save = (event: Event) => {
  const target = event.currentTarget;
  if (target instanceof Element) pushToast(target, { title: "Saved", variant: "success" });
};

<template>
  <WhitePlumeriaProvider @persist={{false}}>
    <button type="button" {{on "click" save}}>Save</button>
  </WhitePlumeriaProvider>
</template>
`;
}

function responsiveExample(): string {
  return `import { ResponsiveLayout, Sidebar } from "@white-plumeria/ember";
import "@white-plumeria/styles";

<template>
  <ResponsiveLayout>
    <:sidebar>
      <Sidebar @label="Docs" />
    </:sidebar>
    Main
  </ResponsiveLayout>
</template>
`;
}

function splitExample(): string {
  return `import { SplitPane } from "@white-plumeria/ember";
import "@white-plumeria/styles";

<template>
  <SplitPane @label="Resize editor" @start="Notes" @end="Preview" />
</template>
`;
}

function componentNames(source: string): string[] {
  return [
    ...new Set(
      [...source.matchAll(/<([A-Z][A-Za-z0-9]*)\b/g)].map((match) => match[1] ?? '').filter(Boolean),
    ),
  ];
}

function jsxToEmber(source: string, hoisted: string[]): string {
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
    const converted = convertAttrs(attrs, hoisted);
    if (self) {
      result += `<${name}${converted ? ` ${converted}` : ''} />`;
      index = openEnd + 1;
      continue;
    }
    const close = `</${name}>`;
    const closeAt = source.indexOf(close, openEnd + 1);
    const inner = closeAt < 0 ? '' : source.slice(openEnd + 1, closeAt);
    result += `<${name}${converted ? ` ${converted}` : ''}>${jsxToEmber(inner, hoisted)}</${name}>`;
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

function convertAttrs(attrs: string, hoisted: string[]): string {
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
      parts.push(`@${name}={{true}}`);
      continue;
    }
    index += 1;
    if (attrs[index] === '{') {
      const end = matchingBrace(attrs, index);
      const value = attrs.slice(index + 1, end).trim();
      index = end + 1;
      if (/^on[A-Z]/.test(name) || value.startsWith('set') || value.includes('=>') || value.startsWith('<')) continue;
      if (/^[A-Za-z_$][A-Za-z0-9_$]*$/.test(value) || /^-?\d+(\.\d+)?$/.test(value) || value === 'true' || value === 'false') {
        parts.push(`@${name}={{${value}}}`);
        continue;
      }
      const binding = uniqueName(name, hoisted);
      hoisted.push(`const ${binding} = ${value};`);
      parts.push(`@${name}={{${binding}}}`);
      continue;
    }
    const quote = attrs[index];
    if (quote === '"' || quote === "'") {
      const end = attrs.indexOf(quote, index + 1);
      const raw = attrs.slice(index + 1, end);
      parts.push(`@${name}="${raw}"`);
      index = end + 1;
      continue;
    }
    const end = attrs.slice(index).search(/\s/);
    const raw = end < 0 ? attrs.slice(index) : attrs.slice(index, index + end);
    parts.push(`@${name}={{${raw}}}`);
    index += raw.length;
  }
  return parts.join(' ');
}

function uniqueName(name: string, hoisted: string[]): string {
  const base = /^[A-Za-z_]/.test(name) ? name : 'value';
  if (!hoisted.some((line) => line.startsWith(`const ${base} `))) return base;
  let index = 2;
  while (hoisted.some((line) => line.startsWith(`const ${base}${index} `))) index += 1;
  return `${base}${index}`;
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
