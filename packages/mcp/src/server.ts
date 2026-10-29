import { McpServer } from '@modelcontextprotocol/server';
import { z } from 'zod/v4';
import { brand } from '@white-plumeria/core';
import {
  checkComponentAvailabilityTool,
  generateComponentExampleTool,
  getComponentDocsTool,
  getComponentPropsTool,
  getDesignTokensTool,
  getFrameworkInstallationTool,
  getUsageExampleTool,
  searchComponentsTool,
  type ToolResult,
} from './tools.ts';

function text(result: ToolResult) {
  return {
    content: [{ type: 'text' as const, text: result.text }],
    isError: result.isError,
  };
}

export function createServer(): McpServer {
  const server = new McpServer({ name: brand.slug, version: brand.version });
  server.registerTool(
    'search_components',
    {
      title: 'Search components',
      description: 'Search the real White Plumeria catalog. Does not invent components.',
      inputSchema: z.object({ query: z.string() }),
    },
    async ({ query }) => text(searchComponentsTool(query)),
  );
  server.registerTool(
    'get_component_docs',
    {
      title: 'Get component docs',
      description: 'Return summary, accessibility, RTL notes, and limitations for one catalog component.',
      inputSchema: z.object({ name: z.string() }),
    },
    async ({ name }) => text(getComponentDocsTool(name)),
  );
  server.registerTool(
    'get_component_props',
    {
      title: 'Get component props',
      description: 'Return the typed props and events documented for one component.',
      inputSchema: z.object({ name: z.string() }),
    },
    async ({ name }) => text(getComponentPropsTool(name)),
  );
  server.registerTool(
    'get_usage_example',
    {
      title: 'Get usage example',
      description: 'Return the catalog example for html, react, vue, svelte, or angular.',
      inputSchema: z.object({ name: z.string(), framework: z.enum(['html', 'react', 'vue', 'svelte', 'angular', 'solid']).optional() }),
    },
    async ({ name, framework }) => text(getUsageExampleTool(name, framework)),
  );
  server.registerTool(
    'get_design_tokens',
    {
      title: 'Get design tokens',
      description: 'Return light and dark color tokens for a named theme.',
      inputSchema: z.object({ theme: z.string().optional() }),
    },
    async ({ theme }) => text(getDesignTokensTool(theme)),
  );
  server.registerTool(
    'generate_component_example',
    {
      title: 'Generate component example',
      description: 'Return a catalog example. Refuses unknown component names. Does not call a model.',
      inputSchema: z.object({ name: z.string(), framework: z.enum(['html', 'react', 'vue', 'svelte', 'angular', 'solid']).optional() }),
    },
    async ({ name, framework }) => text(generateComponentExampleTool(name, framework)),
  );
  server.registerTool(
    'get_framework_installation',
    {
      title: 'Get framework installation',
      description: 'Return the intended install command. Packages are not published yet.',
      inputSchema: z.object({ framework: z.enum(['html', 'react', 'vue', 'svelte', 'angular', 'solid']).optional() }),
    },
    async ({ framework }) => text(getFrameworkInstallationTool(framework)),
  );
  server.registerTool(
    'check_component_availability',
    {
      title: 'Check component availability',
      description: 'Say whether a name exists in the catalog.',
      inputSchema: z.object({ name: z.string() }),
    },
    async ({ name }) => text(checkComponentAvailabilityTool(name)),
  );
  return server;
}
