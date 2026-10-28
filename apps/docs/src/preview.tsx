import { useWhitePlumeria } from '@white-plumeria/react';
import { useEffect, useState, type ReactNode } from 'react';
import { CodeBlock } from './copy.tsx';

export function useDocsScheme(appearance: 'light' | 'dark' | 'system') {
  const [system, setSystem] = useState<'light' | 'dark'>('light');
  useEffect(() => {
    if (typeof window.matchMedia !== 'function') return;
    const query = window.matchMedia('(prefers-color-scheme: dark)');
    const apply = () => setSystem(query.matches ? 'dark' : 'light');
    apply();
    query.addEventListener('change', apply);
    return () => query.removeEventListener('change', apply);
  }, []);
  return appearance === 'system' ? system : appearance;
}

export function ThemedFrame({ className, children }: { className?: string; children: ReactNode }) {
  const { preferences } = useWhitePlumeria();
  const scheme = useDocsScheme(preferences.appearance);
  return (
    <div className={className} data-wpl-theme={preferences.theme} data-wpl-scheme={scheme}>
      {children}
    </div>
  );
}

export function Preview({
  title,
  code,
  children,
  open = true,
}: {
  title: string;
  code?: string;
  children: ReactNode;
  open?: boolean;
}) {
  const [shown, setShown] = useState(open);
  return (
    <section className="docs-example">
      <div className="docs-example-bar">
        <h3>{title}</h3>
        {code ? (
          <button type="button" className="wpl-btn wpl-btn-ghost wpl-btn-sm" onClick={() => setShown((value) => !value)}>
            {shown ? 'Hide code' : 'Show code'}
          </button>
        ) : null}
      </div>
      <ThemedFrame className="docs-canvas">{children}</ThemedFrame>
      {shown && code ? <CodeBlock code={code} label={title} /> : null}
    </section>
  );
}
