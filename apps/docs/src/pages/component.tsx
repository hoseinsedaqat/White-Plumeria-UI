import { catalog, categoryLabels, getComponent, libraryExamples, serverExample, serverHosts } from '@white-plumeria/core';
import { CodeBlock } from '../copy.tsx';
import { A } from '../router.tsx';
import { Showcase } from '../showcases.tsx';

export function ComponentPage({ slug, onNavigate }: { slug: string; onNavigate: (href: string) => void }) {
  const component = getComponent(slug);
  if (!component) return <p>Unknown component.</p>;
  const index = catalog.findIndex((item) => item.slug === component.slug);
  const prev = catalog[index - 1];
  const next = catalog[index + 1];

  return (
    <article className="docs-article">
      <p className="docs-kicker">{categoryLabels[component.category].en}</p>
      <h1 className="docs-title">{component.name}</h1>
      <p className="docs-lede">{component.summary}</p>
      <Showcase slug={component.slug} />
      <ClassTable names={component.classes} />

      <section className="docs-block" id="usage">
        <h2>Examples</h2>
        <p>
          This page includes one example for every library. Server hosts use the adapter named under each heading. They are not
          separate packages, and nothing is published to npm until the set is complete.
        </p>
        <nav className="docs-example-nav" aria-label="Example libraries">
          {libraryExamples.map((item) => (
            <a key={item.id} href={`#example-${item.id}`}>
              {item.label}
            </a>
          ))}
          {serverHosts.map((item) => (
            <a key={item.id} href={`#example-${item.id}`}>
              {item.label}
            </a>
          ))}
        </nav>
        {libraryExamples.map((item) => (
          <section key={item.id} className="docs-example-block" id={`example-${item.id}`}>
            <h3>{item.label}</h3>
            <CodeBlock code={component.examples[item.id]} label={item.label} />
          </section>
        ))}
        <h2 id="servers">Server hosts</h2>
        <p>
          Next, Nuxt, and the other hosts below are application frameworks. Each example is the existing adapter in that host.
          <A href="/servers" onNavigate={onNavigate}>
            {' '}
            Server host notes
          </A>
          .
        </p>
        {serverHosts.map((item) => (
          <section key={item.id} className="docs-example-block" id={`example-${item.id}`}>
            <h3>{item.label}</h3>
            <p>
              Uses <code>@white-plumeria/{item.package}</code>. There is no <code>@white-plumeria/{item.id}</code> package.
            </p>
            <CodeBlock code={serverExample(component.examples, item.id)} label={item.label} />
          </section>
        ))}
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
