import { catalog, isThemeName } from '@white-plumeria/core';
import { useWhitePlumeria } from '@white-plumeria/react';
import { themeNames } from '@white-plumeria/tokens';
import { useState } from 'react';
import { CodeBlock } from '../copy.tsx';
import { renderDemo } from '../demos.tsx';

export function PlaygroundPage() {
  const { preferences, setPreferences, locale } = useWhitePlumeria();
  const [slug, setSlug] = useState('button');
  const [framework, setFramework] = useState<'react' | 'vue' | 'svelte' | 'html'>('react');
  const component = catalog.find((item) => item.slug === slug) ?? catalog[0];
  if (!component) return null;
  return (
    <article>
      <p className="docs-kicker">Playground</p>
      <h1 className="docs-display" style={{ fontSize: 'clamp(2.4rem, 5vw, 4rem)' }}>
        {locale === 'fa' ? 'زمین بازی' : 'Try the real components'}
      </h1>
      <p className="docs-lede">
        {locale === 'fa'
          ? 'پیش‌نمایش از بستهٔ ری‌اکت است، نه یک نسخهٔ جدا. کد زبان‌های دیگر از همان کاتالوگ می‌آید.'
          : 'The live preview imports @white-plumeria/react. Other framework snippets come from the same catalog.'}
      </p>
      <div className="wpl-cluster" style={{ marginBlock: '1rem' }}>
        <label>
          Component{' '}
          <select className="wpl-select" value={slug} onChange={(event) => setSlug(event.currentTarget.value)}>
            {catalog.map((item) => (
              <option key={item.slug} value={item.slug}>
                {item.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          Theme{' '}
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
          Direction{' '}
          <select
            className="wpl-select"
            value={preferences.direction}
            onChange={(event) =>
              setPreferences({ direction: event.currentTarget.value as 'ltr' | 'rtl' | 'auto' })
            }
          >
            <option value="auto">auto</option>
            <option value="ltr">ltr</option>
            <option value="rtl">rtl</option>
          </select>
        </label>
      </div>
      <div className="docs-stage" dir={preferences.direction === 'auto' ? undefined : preferences.direction}>
        {renderDemo(component.slug)}
      </div>
      <div className="docs-tabs" style={{ marginBlockStart: '1rem' }}>
        {(['react', 'vue', 'svelte', 'html'] as const).map((item) => (
          <button
            key={item}
            type="button"
            className={framework === item ? 'wpl-btn wpl-btn-primary wpl-btn-sm' : 'wpl-btn wpl-btn-ghost wpl-btn-sm'}
            onClick={() => setFramework(item)}
          >
            {item}
          </button>
        ))}
      </div>
      <CodeBlock code={component.examples[framework]} />
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
