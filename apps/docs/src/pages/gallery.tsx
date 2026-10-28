import { catalog, categoryLabels, type ComponentCategory } from '@white-plumeria/core';
import { useMemo, useState } from 'react';
import { ThemedFrame } from '../preview.tsx';
import { MiniPreview } from '../showcases.tsx';
import { A } from '../router.tsx';

const categories = ['all', 'base', 'form', 'interaction', 'data', 'layout'] as const;

export function GalleryPage({ onNavigate }: { onNavigate: (href: string) => void }) {
  const [category, setCategory] = useState<(typeof categories)[number]>('all');
  const [query, setQuery] = useState('');
  const items = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return catalog.filter((item) => {
      if (category !== 'all' && item.category !== category) return false;
      if (!needle) return true;
      return `${item.name} ${item.slug} ${item.summary}`.toLowerCase().includes(needle);
    });
  }, [category, query]);

  return (
    <article className="docs-article">
      <p className="docs-kicker">Catalog</p>
      <h1 className="docs-title">Components</h1>
      <p className="docs-lede">
        Every catalog entry has a live preview. Open a card for props, code, and keyboard behavior.
      </p>
      <div className="docs-filters" role="group" aria-label="Category">
        {categories.map((item) => (
          <button
            key={item}
            type="button"
            className="wpl-btn wpl-btn-secondary wpl-btn-sm"
            aria-pressed={category === item}
            onClick={() => setCategory(item)}
          >
            {item === 'all' ? 'All' : categoryLabels[item as ComponentCategory].en}
          </button>
        ))}
      </div>
      <label className="wpl-label" htmlFor="gallery-filter">
        Filter
      </label>
      <input
        id="gallery-filter"
        className="wpl-input"
        value={query}
        placeholder="Filter by name"
        onChange={(event) => setQuery(event.currentTarget.value)}
      />
      <div className="docs-mosaic" style={{ marginTop: '1rem' }}>
        {items.map((item) => (
          <article key={item.slug} className="docs-tile">
            <ThemedFrame className="docs-tile-preview">
              <MiniPreview slug={item.slug} />
            </ThemedFrame>
            <A href={`/components/${item.slug}`} className="docs-tile-meta" onNavigate={onNavigate}>
              <strong>{item.name}</strong>
              <span>{item.summary}</span>
            </A>
          </article>
        ))}
      </div>
      {items.length === 0 ? <p className="docs-note">No components match that filter.</p> : null}
    </article>
  );
}
