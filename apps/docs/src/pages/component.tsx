import { catalog, categoryLabels, getComponent } from '@white-plumeria/core';
import { useState } from 'react';
import { CodeBlock } from '../copy.tsx';
import { A } from '../router.tsx';
import { Showcase } from '../showcases.tsx';

export function ComponentPage({ slug, onNavigate }: { slug: string; onNavigate: (href: string) => void }) {
  const component = getComponent(slug);
  const [tab, setTab] = useState<'react' | 'vue' | 'svelte' | 'angular' | 'solid' | 'preact' | 'qwik' | 'lit' | 'html'>('react');
  if (!component) return <p>Unknown component.</p>;
  const index = catalog.findIndex((item) => item.slug === component.slug);
  const prev = catalog[index - 1];
  const next = catalog[index + 1];

  return (
    <article className="docs-article">
      <p className="docs-kicker">{categoryLabels[component.category].en}</p>
      <h1 className="docs-title">{component.name}</h1>
      <p className="docs-lede">{component.summary}</p>
      <ClassTable names={component.classes} />
      <Showcase slug={component.slug} />

      <section className="docs-block" id="usage">
        <h2>Usage</h2>
        <div className="docs-tabs" role="tablist" aria-label="Framework examples">
          {(['react', 'vue', 'svelte', 'angular', 'solid', 'preact', 'qwik', 'lit', 'html'] as const).map((item) => (
            <button
              key={item}
              type="button"
              role="tab"
              aria-selected={tab === item}
              className={tab === item ? 'wpl-btn wpl-btn-primary wpl-btn-sm' : 'wpl-btn wpl-btn-ghost wpl-btn-sm'}
              onClick={() => setTab(item)}
            >
              {item}
            </button>
          ))}
        </div>
        <CodeBlock code={component.examples[tab]} label={tab} />
      </section>

      <section className="docs-block" id="props">
        <h2>Props</h2>
        <div className="docs-table-wrap">
          <table className="docs-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Type</th>
                <th>Default</th>
                <th>Description</th>
              </tr>
            </thead>
            <tbody>
              {component.props.map((prop) => (
                <tr key={prop.name}>
                  <td>
                    <code>{prop.name}</code>
                  </td>
                  <td>
                    <code>{prop.type}</code>
                  </td>
                  <td>{prop.defaultValue ?? '—'}</td>
                  <td>{prop.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="docs-block" id="events">
        <h2>Events</h2>
        {component.events.length === 0 ? <p>No custom events. Use the native control event.</p> : null}
        <ul>
          {component.events.map((event) => (
            <li key={event.name}>
              <code>{event.react}</code> / <code>{event.vue}</code> / <code>{event.svelte}</code> / <code>{angularEvent(event.react)}</code> — {event.description}
            </li>
          ))}
        </ul>
      </section>

      <section className="docs-block" id="accessibility">
        <h2>Accessibility</h2>
        <ul>
          {component.a11y.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>

      <section className="docs-block" id="direction">
        <h2>Direction</h2>
        <ul>
          {component.rtl.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>

      {component.limitations.length ? (
        <section className="docs-block" id="limitations">
          <h2>Limitations</h2>
          <ul>
            {component.limitations.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>
      ) : null}

      <p className="docs-note">
        {component.element
          ? 'A light-DOM custom element exists for this component. It does not use Shadow DOM.'
          : 'No custom element is published for this component. Use the CSS classes or a framework adapter.'}
      </p>

      <nav className="docs-pager" aria-label="Component pages">
        {prev ? (
          <A href={`/components/${prev.slug}`} onNavigate={onNavigate}>
            <small>Previous</small>
            <strong>{prev.name}</strong>
          </A>
        ) : (
          <span />
        )}
        {next ? (
          <A href={`/components/${next.slug}`} onNavigate={onNavigate}>
            <small>Next</small>
            <strong>{next.name}</strong>
          </A>
        ) : (
          <span />
        )}
      </nav>
    </article>
  );
}

function angularEvent(reactName: string): string {
  if (!reactName.startsWith('on') || reactName.length < 3 || reactName.includes(' ')) return 'output binding';
  const name = reactName.slice(2);
  return `(${name.charAt(0).toLowerCase()}${name.slice(1)})`;
}

function classKind(name: string) {
  if (/-sm$|-md$|-lg$|-xs$|-xl$/.test(name)) return 'Size';
  if (/primary|secondary|outline|ghost|danger|success|warning|info|neutral|link/.test(name)) return 'Style';
  if (/loading|disabled|block|active/.test(name)) return 'State';
  return 'Component';
}

function ClassTable({ names }: { names: string[] }) {
  if (names.length === 0) return null;
  return (
    <div className="docs-table-wrap" style={{ marginTop: '1.2rem' }}>
      <table className="docs-table">
        <thead>
          <tr>
            <th>Class</th>
            <th>Kind</th>
          </tr>
        </thead>
        <tbody>
          {names.map((name) => (
            <tr key={name}>
              <td>
                <code>{name}</code>
              </td>
              <td>{classKind(name)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
