import { catalog, isThemeName, libraryExamples, serverExample, serverHosts, type ServerHostId } from '@white-plumeria/core';
import { useWhitePlumeria } from '@white-plumeria/react';
import { themeNames } from '@white-plumeria/tokens';
import { useState } from 'react';
import { CodeBlock } from '../copy.tsx';
import { ThemedFrame } from '../preview.tsx';
import { renderDemo } from '../demos.tsx';

export function PlaygroundPage() {
  const { preferences, setPreferences } = useWhitePlumeria();
  const [slug, setSlug] = useState('button');
  const [framework, setFramework] = useState<(typeof libraryExamples)[number]['id'] | ServerHostId>('react');
  const component = catalog.find((item) => item.slug === slug) ?? catalog[0];
  if (!component) return null;

  return (
    <article className="docs-article">
      <p className="docs-kicker">Playground</p>
      <h1 className="docs-title">Try the real components</h1>
      <p className="docs-lede">
        The preview imports @white-plumeria/react. Vue, Svelte, Angular, and HTML snippets come from the same catalog and are not a second implementation.
      </p>
      <div className="docs-split">
        <div className="docs-controls">
          <label>
            Component
            <select className="wpl-select" value={slug} onChange={(event) => setSlug(event.currentTarget.value)}>
              {catalog.map((item) => (
                <option key={item.slug} value={item.slug}>
                  {item.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            Theme
            <select
              className="wpl-select"
              value={preferences.theme}
              onChange={(event) => {
                const next = event.currentTarget.value;
                if (isThemeName(next)) setPreferences({ theme: next });
              }}
            >
              {themeNames.map((theme) => (
                <option key={theme} value={theme}>
                  {theme}
                </option>
              ))}
            </select>
          </label>
          <label>
            Appearance
            <select
              className="wpl-select"
              value={preferences.appearance}
              onChange={(event) =>
                setPreferences({ appearance: event.currentTarget.value as 'light' | 'dark' | 'system' })
              }
            >
              <option value="light">light</option>
              <option value="dark">dark</option>
              <option value="system">system</option>
            </select>
          </label>
        </div>
        <div>
          <ThemedFrame className="docs-canvas">{renderDemo(component.slug)}</ThemedFrame>
          <div className="docs-tabs" style={{ marginTop: '1rem' }}>
            {libraryExamples.map((item) => (
              <button
                key={item.id}
                type="button"
                className={framework === item.id ? 'wpl-btn wpl-btn-primary wpl-btn-sm' : 'wpl-btn wpl-btn-ghost wpl-btn-sm'}
                onClick={() => setFramework(item.id)}
              >
                {item.label}
              </button>
            ))}
          </div>
          <div className="docs-tabs">
            {serverHosts.map((item) => (
              <button
                key={item.id}
                type="button"
                className={framework === item.id ? 'wpl-btn wpl-btn-primary wpl-btn-sm' : 'wpl-btn wpl-btn-ghost wpl-btn-sm'}
                onClick={() => setFramework(item.id)}
              >
                {item.label}
              </button>
            ))}
          </div>
          <CodeBlock
            code={
              serverHosts.some((item) => item.id === framework)
                ? serverExample(component.examples, framework as ServerHostId)
                : component.examples[framework as (typeof libraryExamples)[number]['id']]
            }
            label={framework}
          />
        </div>
      </div>
      {component.limitations.length ? (
        <ul>
          {component.limitations.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      ) : null}
    </article>
  );
}
