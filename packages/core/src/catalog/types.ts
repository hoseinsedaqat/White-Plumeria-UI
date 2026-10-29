export type ComponentCategory = 'base' | 'form' | 'interaction' | 'data' | 'layout';

export interface PropDoc {
  name: string;
  type: string;
  defaultValue?: string;
  description: string;
  descriptionFa: string;
}

export interface EventDoc {
  name: string;
  react: string;
  vue: string;
  svelte: string;
  description: string;
}

export interface FrameworkExamples {
  html: string;
  react: string;
  vue: string;
  svelte: string;
  angular: string;
  solid: string;
}

export interface ComponentDoc {
  name: string;
  slug: string;
  category: ComponentCategory;
  summary: string;
  summaryFa: string;
  tags: string[];
  classes: string[];
  props: PropDoc[];
  events: EventDoc[];
  a11y: string[];
  rtl: string[];
  limitations: string[];
  element: boolean;
  examples: FrameworkExamples;
}

export const categoryLabels = {
  base: { en: 'Base', fa: 'پایه' },
  form: { en: 'Forms', fa: 'فرم‌ها' },
  interaction: { en: 'Interaction', fa: 'تعامل' },
  data: { en: 'Data', fa: 'داده' },
  layout: { en: 'Layout', fa: 'چیدمان' },
} as const;
