declare module 'alpinejs' {
  interface AlpineInstance {
    plugin(plugin: (alpine: AlpineInstance) => void): void;
    data(name: string, callback: (config?: object) => object): void;
    start(): void;
    initTree(element: Node): void;
    $data(element: Element): Record<string, unknown>;
  }

  const Alpine: AlpineInstance;
  export default Alpine;
}

declare module '@white-plumeria/styles';
