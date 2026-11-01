import { useState } from 'react';
import '../examples.css';
import { isLivePenComponent, libraryPens, penById, penDocument, type PenId } from '../pen-meta.ts';

export function LiveLibraries({ slug, name }: { slug: string; name: string }) {
  const [id, setId] = useState<PenId>('vue');
  if (!isLivePenComponent(slug)) return null;
  const pen = penById(id);
  return (
    <section className="docs-block" id="live">
      <h2>This component, in each library</h2>
      <p>
        The frame is {pen.label}’s own document. It reads <code>?component={slug}</code> and mounts{' '}
        {name}. This page does not draw it.
      </p>
      <div className="pen-switch">
        {libraryPens.map((item) => (
          <button
            key={item.id}
            type="button"
            aria-pressed={item.id === id}
            onClick={() => setId(item.id)}
          >
            {item.label}
          </button>
        ))}
      </div>
      <div className="pen-stage">
        <iframe
          key={`${pen.id}-${slug}`}
          title={`${name} in ${pen.label}`}
          src={penDocument(pen.id, slug)}
        />
      </div>
    </section>
  );
}
