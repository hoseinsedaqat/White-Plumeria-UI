declare module '@white-plumeria/styles';

declare module '@ember/renderer' {
  export function renderComponent(
    component: unknown,
    options: { into?: Element; args?: Record<string, unknown> },
  ): { destroy(): void };
  export function renderSettled(): Promise<void>;
}

declare module '@ember/helper' {
  export const and: unknown;
  export const eq: unknown;
  export const fn: unknown;
  export const gt: unknown;
  export const gte: unknown;
  export const lt: unknown;
  export const lte: unknown;
  export const not: unknown;
  export const or: unknown;
}

declare module '@ember/modifier' {
  export function capabilities(version: string): unknown;
  export function on(...args: unknown[]): unknown;
  export function setModifierManager(...args: unknown[]): unknown;
}

declare module '@ember/reactive/collections' {
  export function trackedObject<T>(value: T): T;
}

declare module '@ember/template-compiler' {
  export function template(source: string, options?: unknown): unknown;
}
