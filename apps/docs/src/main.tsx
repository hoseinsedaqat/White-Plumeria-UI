import '@fontsource-variable/figtree';
import '@fontsource-variable/fraunces';
import '@fontsource-variable/outfit';
import '@white-plumeria/styles';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App.tsx';
import './docs.css';

const root = document.getElementById('root');
if (!root) throw new Error('Missing #root');
createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
