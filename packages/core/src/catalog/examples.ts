import { angularCloseTag, angularOpenTag } from './angular.ts';
import type { FrameworkExamples } from './types.ts';

export function examples(
  name: string,
  body: { react: string; vue: string; svelte: string; html: string },
): FrameworkExamples {
  return {
    html: body.html,
    react: `import { ${name} } from "@white-plumeria/react";\nimport "@white-plumeria/styles";\n\nexport function Example() {\n  return (\n    ${body.react}\n  );\n}`,
    vue: `<script setup lang="ts">\nimport { ${name} } from "@white-plumeria/vue";\nimport "@white-plumeria/styles";\n</script>\n\n<template>\n  ${body.vue}\n</template>\n`,
    svelte: `<script lang="ts">\n  import { ${name} } from "@white-plumeria/svelte";\n  import "@white-plumeria/styles";\n</script>\n\n${body.svelte}\n`,
    angular: angularExample(name, body.vue),
    solid: solidExample(name, body.react),
  };
}

function solidExample(name: string, react: string): string {
  if (name === 'Toast') {
    return `import { useToast } from "@white-plumeria/solid";\nimport "@white-plumeria/styles";\n\nexport function Example() {\n  const toast = useToast();\n  return <button type="button" onClick={() => toast.push({ title: "Saved", variant: "success" })}>Save</button>;\n}\n`;
  }
  return `import { ${name} } from "@white-plumeria/solid";\nimport "@white-plumeria/styles";\n\nexport function Example() {\n  return (\n    ${react}\n  );\n}`;
}

function angularExample(name: string, vue: string): string {
  if (name === 'Toast') {
    return `import { Component } from "@angular/core";\nimport { useToast } from "@white-plumeria/angular";\nimport "@white-plumeria/styles";\n\n@Component({\n  selector: "wpl-example",\n  template: \`<button type="button" (click)="save()">Save</button>\`,\n})\nexport class Example {\n  private readonly toast = useToast();\n  save() {\n    this.toast.push({ title: "Saved", variant: "success" });\n  }\n}\n`;
  }
  const template = angularTemplate(name, vue);
  const used = new Set<string>([name, ...componentNames(vue)]);
  const imports = [...used].sort();
  return `import { Component } from "@angular/core";\nimport { ${imports.join(', ')} } from "@white-plumeria/angular";\nimport "@white-plumeria/styles";\n\n@Component({\n  selector: "wpl-example",\n  imports: [${imports.join(', ')}],\n  template: \`\n    ${template}\n  \`,\n})\nexport class Example {}\n`;
}

function angularTemplate(name: string, vue: string): string {
  if (name === 'ResponsiveLayout') {
    return `<wpl-responsive-layout>\n      <wpl-sidebar label="Docs" [items]="[]" />\n      Main\n    </wpl-responsive-layout>`;
  }
  if (name === 'SplitPane') {
    return `<wpl-split-pane label="Resize editor">\n      <p wplStart>Notes</p>\n      <p wplEnd>Preview</p>\n    </wpl-split-pane>`;
  }
  return vue
    .replace(/<template #sidebar>([\s\S]*?)<\/template>/g, '$1')
    .replace(/<template #start>([\s\S]*?)<\/template>/g, '<div wplStart>$1</div>')
    .replace(/<template #end>([\s\S]*?)<\/template>/g, '<div wplEnd>$1</div>')
    .replace(/<([A-Z][A-Za-z0-9]*)\b([^>]*?)(\/?)>/g, (_match, tag: string, attrs: string, self: string) => {
      const converted = convertAttrs(tag, attrs);
      const open = angularOpenTag(tag, converted, !self);
      return self ? open.replace(/>$/, ' />') : open;
    })
    .replace(/<\/([A-Z][A-Za-z0-9]*)>/g, (_match, tag: string) => angularCloseTag(tag));
}

function convertAttrs(tag: string, attrs: string): string {
  let next = attrs
    .replace(/@([\w:.]+)="([^"]*)"/g, (_match, key: string, value: string) => ` (${angularEvent(key)})="${value}"`)
    .replace(/(?<![\w@-]):([A-Za-z0-9-]+)="([^"]*)"/g, (_match, key: string, value: string) => ` [${camel(key)}]="${value}"`)
    .replace(/\bmodel-value=/g, 'value=')
    .replace(/(^|\s)(loop|required)(?=\s|$)/g, (_match, space: string, key: string) => `${space}[${key}]="true"`);
  if (tag === 'Label') next = next.replace(/\bfor=/g, 'htmlFor=');
  return next;
}

function angularEvent(name: string): string {
  if (name === 'update:open') return 'openChange';
  if (name === 'update:modelValue') return 'valueChange';
  if (name === 'update:size') return 'sizeChange';
  if (name === 'update:page') return 'pageChange';
  if (name === 'sort-change') return 'sortChange';
  return camel(name);
}

function camel(value: string): string {
  return value.replace(/-([a-z])/g, (_match, letter: string) => letter.toUpperCase());
}

function componentNames(source: string): string[] {
  return [...source.matchAll(/<([A-Z][A-Za-z0-9]*)\b/g)].map((match) => match[1] ?? '').filter(Boolean);
}


