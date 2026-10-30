/// <reference types="marko" />

declare module '*.marko' {
  const template: Marko.Template<Record<string, unknown>>;
  export default template;
}
