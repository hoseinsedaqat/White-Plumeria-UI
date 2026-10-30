declare module '*.marko' {
  const template: {
    mount(input: Record<string, never>, reference: Node): { destroy(): void };
  };
  export default template;
}
