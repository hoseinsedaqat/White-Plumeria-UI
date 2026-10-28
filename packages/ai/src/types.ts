import type { ThemeName } from '@white-plumeria/tokens';
import type { ComponentDoc } from '@white-plumeria/core';

export type FrameworkId = 'html' | 'react' | 'vue' | 'svelte';

export interface Recommendation {
  component: string;
  slug: string;
  reason: string;
  reasonFa: string;
  score: number;
}

export interface PreviewNode {
  component: string;
  props?: Record<string, string | number | boolean>;
  text?: string;
  children?: PreviewNode[];
}

export interface LayoutPlan {
  title: string;
  titleFa: string;
  intent: string;
  nodes: PreviewNode[];
  limitations: string[];
}

export interface GeneratedFile {
  path: string;
  language: string;
  contents: string;
}

export interface CodeBundle {
  framework: FrameworkId;
  files: GeneratedFile[];
  notes: string[];
}

export interface Analysis {
  prompt: string;
  intent: string;
  keywords: string[];
  theme?: ThemeName;
  appearance?: 'light' | 'dark';
  locale: 'en' | 'fa';
  direction: 'ltr' | 'rtl';
  recommendations: Recommendation[];
  limitations: string[];
}

export interface PlanResult {
  analysis: Analysis;
  layout: LayoutPlan;
  code: Record<FrameworkId, CodeBundle>;
  validation: Record<FrameworkId, ValidationResult>;
}

export interface ValidationResult {
  ok: boolean;
  errors: string[];
}

export interface ContrastCheck {
  pair: string;
  ratio: number | null;
  minimum: number;
  pass: boolean;
}

export interface GeneratedTheme {
  name: string;
  description: string;
  light: Record<string, string>;
  dark: Record<string, string>;
  css: string;
  checks: ContrastCheck[];
  adjustments: string[];
}

export interface AIRequest {
  prompt: string;
  framework?: FrameworkId;
  locale?: 'en' | 'fa';
}

export interface AIProvider {
  id: string;
  complete(request: AIRequest, signal?: AbortSignal): Promise<PlanResult>;
}

export type CatalogSlice = Pick<
  ComponentDoc,
  'name' | 'slug' | 'summary' | 'summaryFa' | 'tags' | 'category' | 'limitations'
>;
