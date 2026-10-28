import { WhitePlumeriaProvider } from '@white-plumeria/react';
import { DocsApp } from './shell.tsx';

export function App() {
  return (
    <WhitePlumeriaProvider>
      <DocsApp />
    </WhitePlumeriaProvider>
  );
}
