import { getComponent } from '@white-plumeria/core';
import type { ThemeName } from '@white-plumeria/tokens';
import { recommendComponents } from './recommend.ts';
import { angularCloseTag, angularHost } from '@white-plumeria/core';
import type { Analysis, FrameworkId, LayoutPlan, PreviewNode } from './types.ts';

const themeWords: Array<{ theme: ThemeName; words: string[] }> = [
  { theme: 'white', words: ['white', 'neutral', 'plain'] },
  { theme: 'ivory', words: ['ivory', 'paper', 'عاج', 'warm'] },
  { theme: 'ink', words: ['ink', 'letterpress', 'مرکب', 'formal', 'رسمی'] },
  { theme: 'saffron', words: ['saffron', 'finance', 'زعفران', 'مالی', 'gold'] },
  { theme: 'lagoon', words: ['lagoon', 'teal', 'تالاب', 'cool'] },
  { theme: 'blush', words: ['blush', 'coral', 'گل'] },
];

export function analyzePrompt(prompt: string): Analysis {
  const lower = prompt.toLowerCase();
  const keywords = lower
    .split(/[^\p{L}\p{N}+-]+/u)
    .map((term) => term.trim())
    .filter((term) => term.length > 1);
  const fa = /[\u0600-\u06FF]/.test(prompt) || keywords.some((word) => ['فارسی', 'rtl', 'راست'].includes(word));
  const dark = /(dark|night|تاریک|شب)/i.test(prompt);
  const theme = themeWords.find((item) => item.words.some((word) => lower.includes(word)))?.theme;
  const intent = detectIntent(lower);
  const recommendations = recommendComponents(prompt, 8);
  const limitations = [
    'This plan is produced by the local deterministic planner. It does not call a model and does not execute generated code.',
    'Sample figures in previews are labeled sample data and are not live metrics.',
  ];
  if (intent === 'general') {
    limitations.push('The prompt did not match a specialized layout, so a compact component composition is used.');
  }
  return {
    prompt,
    intent,
    keywords,
    theme,
    appearance: dark ? 'dark' : undefined,
    locale: fa ? 'fa' : 'en',
    direction: fa ? 'rtl' : 'ltr',
    recommendations,
    limitations,
  };
}

function detectIntent(prompt: string): string {
  if (/(dashboard|finance|مالی|داشبورد|تراکنش|transaction|invoice)/i.test(prompt)) return 'finance-dashboard';
  if (/(form|signup|login|ورود|فرم|ثبت)/i.test(prompt)) return 'form';
  if (/(settings|تنظیمات)/i.test(prompt)) return 'settings';
  if (/(empty|خالی)/i.test(prompt)) return 'empty';
  if (/(dialog|modal|گفتگو)/i.test(prompt)) return 'dialog';
  if (/(price range|budget|range slider|slider range|two thumbs)/i.test(prompt)) return 'number-range';
  if (/(range|بازه|start and end|from and to)/i.test(prompt)) return 'date-range';
  if (/(calendar|date|تاریخ|تقویم)/i.test(prompt)) return 'calendar';
  return 'general';
}

export function buildLayout(analysis: Analysis): LayoutPlan {
  const nodes = layouts[analysis.intent] ?? layouts.general ?? [];
  const unknown = collect(nodes).filter((name) => !getComponent(name));
  if (unknown.length) {
    throw new Error(`Planner referenced unknown components: ${unknown.join(', ')}`);
  }
  return {
    title: analysis.locale === 'fa' ? 'طرح تولیدشده' : 'Generated layout',
    titleFa: 'طرح تولیدشده',
    intent: analysis.intent,
    nodes: nodes,
    limitations: analysis.limitations,
  };
}

function collect(nodes: PreviewNode[]): string[] {
  return nodes.flatMap((node) => [node.component, ...(node.children ? collect(node.children) : [])]);
}

const layouts: Record<string, PreviewNode[]> = {
  'finance-dashboard': [
    {
      component: 'PageHeader',
      props: { title: 'Treasury', description: 'Sample workspace — not live balances' },
    },
    {
      component: 'Grid',
      props: { columns: 3 },
      children: [
        { component: 'StatCard', props: { label: 'Open invoices', value: '12', hint: 'Sample data' } },
        { component: 'StatCard', props: { label: 'Due this week', value: 'EUR 4,280', hint: 'Sample data' } },
        { component: 'StatCard', props: { label: 'Failed payments', value: '1', hint: 'Sample data' } },
      ],
    },
    {
      component: 'ChartContainer',
      props: { title: 'Sample volume' },
    },
    {
      component: 'Alert',
      props: { variant: 'info', title: 'Sample data' },
      text: 'Figures on this page are fixtures for the preview. They are not account data.',
    },
  ],
  form: [
    {
      component: 'Card',
      props: { title: 'Create account', description: 'Required fields are marked.' },
      children: [
        { component: 'FormField', props: { label: 'Work email', required: true } },
        { component: 'Input', props: { type: 'email', placeholder: 'ada@example.com' } },
        { component: 'Button', props: { variant: 'primary' }, text: 'Create account' },
      ],
    },
  ],
  settings: [
    { component: 'PageHeader', props: { title: 'Preferences' } },
    { component: 'Switch', props: { label: 'Reduced motion' } },
    { component: 'Select', props: { label: 'Theme' } },
  ],
  empty: [
    {
      component: 'EmptyState',
      props: { title: 'No invoices yet', description: 'Create the first invoice to see it here.' },
      children: [{ component: 'Button', props: { variant: 'primary' }, text: 'New invoice' }],
    },
  ],
  dialog: [
    {
      component: 'Dialog',
      props: { title: 'Discard draft?' },
      text: 'Unsaved notes will be lost.',
    },
  ],
  calendar: [
    { component: 'DatePicker', props: { label: 'From', value: '2026-10-27' } },
    { component: 'Calendar', props: { calendar: 'gregory' } },
  ],
  'date-range': [
    { component: 'DateRangePicker', props: { label: 'Stay', start: '2026-10-12', end: '2026-10-18', showTime: true, startTime: '09:00', endTime: '18:00' } },
  ],
  'number-range': [
    { component: 'RangeSlider', props: { label: 'Price', min: 0, max: 500, step: 10, start: 80, end: 320 } },
  ],
  general: [
    { component: 'PageHeader', props: { title: 'Composer', description: 'A small composition from the real catalog.' } },
    { component: 'Alert', props: { variant: 'neutral', title: 'Local planner' }, text: 'No external model was called.' },
    { component: 'Button', props: { variant: 'primary' }, text: 'Save changes' },
    { component: 'Badge', props: { variant: 'primary' }, text: 'Catalog' },
  ],
};

export function renderCode(nodes: PreviewNode[], framework: FrameworkId): string {
  if (framework === 'html') return nodes.map(renderHtml).join('\n');
  if (framework === 'react') return wrapReact(nodes.map((node) => renderReact(node, 2)).join('\n'));
  if (framework === 'solid') return wrapReact(nodes.map((node) => renderReact(node, 2)).join('\n')).replaceAll('@white-plumeria/react', '@white-plumeria/solid');
  if (framework === 'preact') return wrapReact(nodes.map((node) => renderReact(node, 2)).join('\n')).replaceAll('@white-plumeria/react', '@white-plumeria/preact');
  if (framework === 'qwik') return wrapQwik(nodes.map((node) => renderReact(node, 2)).join('\n'));
  if (framework === 'vue') return wrapVue(nodes.map((node) => renderVue(node, 1)).join('\n'));
  if (framework === 'angular') return wrapAngular(nodes);
  return wrapSvelte(nodes.map((node) => renderSvelte(node, 0)).join('\n'));
}

function names(nodes: PreviewNode[]): string[] {
  return [...new Set(collect(nodes))];
}

function renderReact(node: PreviewNode, indent: number): string {
  const pad = ' '.repeat(indent);
  const props = propString(node.props, 'react');
  const kids = [
    node.text ? `${pad}  ${node.text}` : '',
    ...(node.children ?? []).map((child) => renderReact(child, indent + 2)),
  ].filter(Boolean);
  if (!kids.length) return `${pad}<${node.component}${props} />`;
  return `${pad}<${node.component}${props}>\n${kids.join('\n')}\n${pad}</${node.component}>`;
}

function renderVue(node: PreviewNode, indent: number): string {
  const pad = ' '.repeat(indent);
  const props = propString(node.props, 'vue');
  const kids = [
    node.text ? `${pad}  ${node.text}` : '',
    ...(node.children ?? []).map((child) => renderVue(child, indent + 2)),
  ].filter(Boolean);
  if (!kids.length) return `${pad}<${node.component}${props} />`;
  return `${pad}<${node.component}${props}>\n${kids.join('\n')}\n${pad}</${node.component}>`;
}

function renderSvelte(node: PreviewNode, indent: number): string {
  return renderVue(node, indent);
}

function renderAngular(node: PreviewNode, indent: number): string {
  const pad = ' '.repeat(indent);
  const host = angularHost(node.component);
  const props = propString(node.props, 'angular');
  const projected = Boolean(node.text || node.children?.length);
  const icon = host.attribute === 'wplIconButton' && projected ? ' [hasIcon]="true"' : '';
  const directive = host.attribute ? ` ${host.attribute}` : '';
  const kids = [
    node.text ? `${pad}  ${node.text}` : '',
    ...(node.children ?? []).map((child) => renderAngular(child, indent + 2)),
  ].filter(Boolean);
  if (!kids.length) return `${pad}<${host.element}${directive}${props} />`;
  return `${pad}<${host.element}${directive}${icon}${props}>\n${kids.join('\n')}\n${pad}${angularCloseTag(node.component)}`;
}

function wrapAngular(nodes: PreviewNode[]): string {
  const imported = names(nodes);
  const body = nodes.map((node) => renderAngular(node, 2)).join('\n');
  return `import { ${imported.join(', ')} } from "@white-plumeria/angular";\nimport { Component } from "@angular/core";\nimport "@white-plumeria/styles";\n\n@Component({\n  selector: "wpl-example",\n  imports: [${imported.join(', ')}],\n  template: \`\n${body}\n  \`,\n})\nexport class Example {}\n`;
}

function renderHtml(node: PreviewNode): string {
  const component = getComponent(node.component);
  const className = component?.classes[0] ?? 'wpl-root';
  const text = node.text ?? String(node.props?.title ?? node.props?.label ?? node.component);
  return `<div class="${className}" data-component="${node.component}">${escapeHtml(text)}</div>`;
}

function propString(props: PreviewNode['props'], framework: FrameworkId): string {
  if (!props) return '';
  return Object.entries(props)
    .map(([key, value]) => {
      if (typeof value === 'boolean') {
        if (framework === 'vue') return value ? ` ${key}` : '';
        if (framework === 'angular') return value ? ` [${key}]="true"` : ` [${key}]="false"`;
        return value ? ` ${key}` : ` ${key}={false}`;
      }
      if (typeof value === 'number') {
        if (framework === 'angular') return ` [${key}]="${value}"`;
        return framework === 'react' || framework === 'svelte' || framework === 'solid' || framework === 'preact' || framework === 'qwik' ? ` ${key}={${value}}` : ` :${kebab(key)}="${value}"`;
      }
      return ` ${key}="${escapeAttr(String(value))}"`;
    })
    .join('');
}

function wrapQwik(body: string): string {
  const converted = body.replace(/\bon([A-Z][A-Za-z]*)=/g, 'on$1$=');
  return `import { component$ } from "@qwik.dev/core";\nimport { ${namesFrom(body).join(', ')} } from "@white-plumeria/qwik";\nimport "@white-plumeria/styles";\n\nexport const Example = component$(() => {\n  return (\n    <>\n${converted}\n    </>\n  );\n});\n`;
}

function wrapReact(body: string): string {
  return `import { ${namesFrom(body).join(', ')} } from "@white-plumeria/react";\nimport "@white-plumeria/styles";\n\nexport function Example() {\n  return (\n    <>\n${body}\n    </>\n  );\n}\n`;
}

function wrapVue(body: string): string {
  return `<script setup lang="ts">\nimport { ${namesFrom(body).join(', ')} } from "@white-plumeria/vue";\nimport "@white-plumeria/styles";\n</script>\n\n<template>\n${body}\n</template>\n`;
}

function wrapSvelte(body: string): string {
  return `<script lang="ts">\n  import { ${namesFrom(body).join(', ')} } from "@white-plumeria/svelte";\n  import "@white-plumeria/styles";\n</script>\n\n${body}\n`;
}

function namesFrom(body: string): string[] {
  const found = new Set<string>();
  for (const match of body.matchAll(/<([A-Z][A-Za-z0-9]*)/g)) {
    if (match[1]) found.add(match[1]);
  }
  return [...found];
}

function kebab(value: string): string {
  return value.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`);
}

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char] ?? char);
}

function escapeAttr(value: string): string {
  return escapeHtml(value);
}
