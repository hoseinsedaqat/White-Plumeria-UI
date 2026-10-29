import { analyzePrompt, buildLayout, renderCode } from './plan.ts';
import type { AIProvider, AIRequest, FrameworkId, PlanResult } from './types.ts';
import { validateGeneratedCode } from './validate.ts';

const frameworks: FrameworkId[] = ['react', 'vue', 'svelte', 'angular', 'solid', 'html'];

export function planFromPrompt(request: AIRequest): PlanResult {
  const prompt = request.prompt.trim();
  if (!prompt) {
    throw new Error('Prompt is empty.');
  }
  if (prompt.length > 2000) {
    throw new Error('Prompt is longer than 2000 characters.');
  }
  const analysis = analyzePrompt(prompt);
  if (request.locale) {
    analysis.locale = request.locale;
    analysis.direction = request.locale === 'fa' ? 'rtl' : analysis.direction;
  }
  const layout = buildLayout(analysis);
  const code = {
    react: bundle('react', renderCode(layout.nodes, 'react')),
    vue: bundle('vue', renderCode(layout.nodes, 'vue')),
    svelte: bundle('svelte', renderCode(layout.nodes, 'svelte')),
    angular: bundle('angular', renderCode(layout.nodes, 'angular')),
    solid: bundle('solid', renderCode(layout.nodes, 'solid')),
    html: bundle('html', renderCode(layout.nodes, 'html')),
  };
  const validation = {
    react: validateGeneratedCode(code.react.files[0]?.contents ?? '', 'react'),
    vue: validateGeneratedCode(code.vue.files[0]?.contents ?? '', 'vue'),
    svelte: validateGeneratedCode(code.svelte.files[0]?.contents ?? '', 'svelte'),
    angular: validateGeneratedCode(code.angular.files[0]?.contents ?? '', 'angular'),
    solid: validateGeneratedCode(code.solid.files[0]?.contents ?? '', 'solid'),
    html: validateGeneratedCode(code.html.files[0]?.contents ?? '', 'html'),
  };
  return { analysis, layout, code, validation };
}

function bundle(framework: FrameworkId, contents: string) {
  const extension = framework === 'vue' ? 'vue' : framework === 'svelte' ? 'svelte' : framework === 'html' ? 'html' : framework === 'angular' ? 'ts' : 'tsx';
  const language = framework === 'html' ? 'html' : framework === 'vue' ? 'vue' : framework === 'angular' ? 'ts' : 'tsx';
  return {
    framework,
    files: [{ path: `Example.${extension}`, language, contents }],
    notes: [
      'Imports are limited to @white-plumeria packages that exist in this repository.',
      'Preview renders a structured plan. It does not eval this source.',
    ],
  };
}

export class LocalDeterministicProvider implements AIProvider {
  readonly id = 'local-deterministic';

  async complete(request: AIRequest): Promise<PlanResult> {
    return planFromPrompt(request);
  }
}

export interface HttpProviderOptions {
  endpoint: string;
  timeoutMs?: number;
  fetchImpl?: typeof fetch;
}

export class HttpProvider implements AIProvider {
  readonly id = 'http';
  private readonly endpoint: string;
  private readonly timeoutMs: number;
  private readonly fetchImpl: typeof fetch;

  constructor(options: HttpProviderOptions) {
    if (!options.endpoint || /api[_-]?key|secret|sk-/i.test(options.endpoint)) {
      throw new Error('Refusing an endpoint that appears to contain a secret. Call your own backend with a relative URL.');
    }
    this.endpoint = options.endpoint;
    this.timeoutMs = options.timeoutMs ?? 8000;
    this.fetchImpl = options.fetchImpl ?? fetch;
  }

  async complete(request: AIRequest, signal?: AbortSignal): Promise<PlanResult> {
    const timeout = AbortSignal.timeout(this.timeoutMs);
    const combined = signal ? AbortSignal.any([signal, timeout]) : timeout;
    const response = await this.fetchImpl(this.endpoint, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ prompt: request.prompt, framework: request.framework, locale: request.locale }),
      signal: combined,
    });
    if (!response.ok) {
      throw new Error(`AI endpoint returned ${response.status}. No key is stored in this package.`);
    }
    const payload = (await response.json()) as PlanResult;
    if (!payload?.layout || !payload.code) {
      throw new Error('AI endpoint returned an unexpected payload.');
    }
    return payload;
  }
}

export { frameworks };
