import { catalog, getComponent, installCommand, searchComponents, type PackageName } from '@white-plumeria/core';
import { getTheme, themeNames } from '@white-plumeria/tokens';

export interface ToolResult {
  text: string;
  isError?: boolean;
}

const frameworks = ['html', 'react', 'vue', 'svelte', 'angular', 'solid', 'preact', 'qwik'] as const;
type Framework = (typeof frameworks)[number];

function frameworkOf(value: string | undefined): Framework {
  return frameworks.includes(value as Framework) ? (value as Framework) : 'react';
}

export function searchComponentsTool(query: string): ToolResult {
  const matches = searchComponents(query).map((item) => ({
    name: item.name,
    slug: item.slug,
    category: item.category,
    summary: item.summary,
  }));
  return { text: JSON.stringify({ matches }, null, 2) };
}

export function getComponentDocsTool(name: string): ToolResult {
  const component = getComponent(name);
  if (!component) return { isError: true, text: `Unknown component: ${name}` };
  return {
    text: JSON.stringify(
      {
        name: component.name,
        slug: component.slug,
        summary: component.summary,
        summaryFa: component.summaryFa,
        a11y: component.a11y,
        rtl: component.rtl,
        limitations: component.limitations,
        element: component.element,
      },
      null,
      2,
    ),
  };
}

export function getComponentPropsTool(name: string): ToolResult {
  const component = getComponent(name);
  if (!component) return { isError: true, text: `Unknown component: ${name}` };
  return { text: JSON.stringify({ props: component.props, events: component.events }, null, 2) };
}

export function getUsageExampleTool(name: string, framework?: string): ToolResult {
  const component = getComponent(name);
  if (!component) return { isError: true, text: `Unknown component: ${name}` };
  const target = frameworkOf(framework);
  return { text: component.examples[target] };
}

export function getDesignTokensTool(theme = 'white'): ToolResult {
  if (!(themeNames as readonly string[]).includes(theme)) {
    return { isError: true, text: `Unknown theme: ${theme}. Known themes: ${themeNames.join(', ')}` };
  }
  const found = getTheme(theme);
  if (!found) return { isError: true, text: `Theme ${theme} is not defined.` };
  return { text: JSON.stringify({ name: found.name, light: found.light, dark: found.dark }, null, 2) };
}

export function generateComponentExampleTool(name: string, framework?: string): ToolResult {
  const component = getComponent(name);
  if (!component) return { isError: true, text: `Refusing to invent a component named ${name}.` };
  return {
    text: [
      'Generated from the catalog. This tool does not call a model.',
      getUsageExampleTool(name, framework).text,
      component.limitations.length ? `Limitations: ${component.limitations.join(' ')}` : '',
    ]
      .filter(Boolean)
      .join('\n\n'),
  };
}

export function getFrameworkInstallationTool(framework?: string): ToolResult {
  const target = frameworkOf(framework);
  const names: PackageName[] =
    target === 'html'
      ? ['styles']
      : target === 'vue'
        ? ['styles', 'vue']
        : target === 'svelte'
          ? ['styles', 'svelte']
          : target === 'angular'
            ? ['styles', 'angular']
            : target === 'solid'
              ? ['styles', 'solid']
              : target === 'preact'
                ? ['styles', 'preact']
                : target === 'qwik'
                  ? ['styles', 'qwik']
                  : ['styles', 'react'];
  return {
    text: JSON.stringify(
      {
        published: false,
        note: 'Packages are not on npm yet. These commands are the intended install API.',
        command: installCommand(names, 'npm'),
      },
      null,
      2,
    ),
  };
}

export function checkComponentAvailabilityTool(name: string): ToolResult {
  const component = getComponent(name);
  return {
    text: JSON.stringify(
      {
        name,
        available: Boolean(component),
        slug: component?.slug ?? null,
        element: component?.element ?? false,
        catalogSize: catalog.length,
      },
      null,
      2,
    ),
  };
}
