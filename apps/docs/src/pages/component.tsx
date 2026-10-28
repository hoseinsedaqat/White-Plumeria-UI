import { getComponent } from '@white-plumeria/core';
import { useWhitePlumeria } from '@white-plumeria/react';
import { useState } from 'react';
import { CodeBlock } from '../copy.tsx';
import { renderDemo } from '../demos.tsx';

export function ComponentPage({ slug }: { slug: string }) {
  const component = getComponent(slug);
  const { locale } = useWhitePlumeria();
  const [tab, setTab] = useState<'react' | 'vue' | 'svelte' | 'html'>('react');
  if (!component) return <p>Unknown component.</p>;
  return (
    <article>
      <p className="docs-kicker">{component.category}</p>
      <h1 className="docs-display" style={{ fontSize: 'clamp(2.4rem, 5vw, 4rem)' }}>
        {component.name}
      </h1>
      <p className="docs-lede">{locale === 'fa' ? component.summaryFa : component.summary}</p>
      <div className="docs-stage" style={{ marginBlock: '1.5rem' }}>
        {renderDemo(component.slug)}
      </div>
      <div className="docs-tabs" role="tablist" aria-label="Framework examples">
        {(['react', 'vue', 'svelte', 'html'] as const).map((item) => (
          <button
            key={item}
            type="button"
            className={tab === item ? 'wpl-btn wpl-btn-primary wpl-btn-sm' : 'wpl-btn wpl-btn-ghost wpl-btn-sm'}
            role="tab"
            aria-selected={tab === item}
            onClick={() => setTab(item)}
          >
            {item}
          </button>
        ))}
      </div>
      <CodeBlock code={component.examples[tab]} />
      <h2>Props</h2>
      <table className="docs-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Type</th>
            <th>Default</th>
            <th>{locale === 'fa' ? 'توضیح' : 'Description'}</th>
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
              <td>{locale === 'fa' ? prop.descriptionFa : prop.description}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <h2>Events</h2>
      {component.events.length === 0 ? <p className="wpl-muted">No custom events.</p> : null}
      <ul>
        {component.events.map((event) => (
          <li key={event.name}>
            <code>{event.react}</code> / <code>{event.vue}</code> / <code>{event.svelte}</code> — {event.description}
          </li>
        ))}
      </ul>
      <h2>{locale === 'fa' ? 'دسترس‌پذیری' : 'Accessibility'}</h2>
      <ul>
        {component.a11y.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
      <h2>RTL</h2>
      <ul>
        {component.rtl.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
      <h2>Classes</h2>
      <p>
        {component.classes.map((name) => (
          <code key={name} style={{ marginInlineEnd: '0.5rem' }}>
            {name}
          </code>
        ))}
      </p>
      {component.limitations.length ? (
        <>
          <h2>{locale === 'fa' ? 'محدودیت‌ها' : 'Limitations'}</h2>
          <ul>
            {component.limitations.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </>
      ) : null}
      <p className="docs-note">
        {component.element
          ? 'A custom element exists for this component.'
          : 'No custom element is published for this component. Use CSS classes or a framework adapter.'}
      </p>
    </article>
  );
}
