import { CodeBlock } from '../copy.tsx';
import { deskSources } from '../desk-sources.ts';
import '../examples.css';
import {
  deskDocument,
  hostById,
  hostPens,
  libraryPens,
  penById,
  penDocument,
  type DeskId,
  type ExampleId,
  type PenId,
} from '../pen-meta.ts';
import { penSources } from '../pen-sources.ts';
import { A } from '../router.tsx';

export function ExamplesPage({ onNavigate }: { onNavigate: (href: string) => void }) {
  return (
    <article className="docs-article">
      <p className="docs-kicker">Examples</p>
      <h1 className="docs-title">One pen per library</h1>
      <p className="docs-lede">
        Each stage is that library’s own document. The docs page is React, and it does not draw the
        other libraries for them. Button, Badge, Alert, Card, Switch, and Input open that same
        document from their component page.
      </p>
      <h2>Libraries</h2>
      <ul className="pen-index">
        {libraryPens.map((pen) => (
          <li key={pen.id}>
            <A href={`/examples/${pen.id}`} onNavigate={onNavigate}>
              <strong>{pen.label}</strong>
              <small>{pen.mount}</small>
            </A>
          </li>
        ))}
      </ul>
      <h2>Server hosts</h2>
      <p>
        Next and Nuxt open the host export. The other hosts still use the client document. None of
        these hosts is a separate package.
      </p>
      <ul className="pen-index">
        {hostPens.map((host) => (
          <li key={host.id}>
            <A href={`/examples/${host.id}`} onNavigate={onNavigate}>
              <strong>{host.label}</strong>
              <small>{host.desk ? host.desk.caption : `Uses the ${host.pen.label} pen`}</small>
            </A>
          </li>
        ))}
      </ul>
    </article>
  );
}

export function ExamplePage({
  id,
  onNavigate,
}: {
  id: ExampleId;
  onNavigate: (href: string) => void;
}) {
  const host = hostById(id);
  const pen = host?.pen ?? penById(id);
  if (!pen) return null;
  const title = host?.label ?? pen.label;
  return (
    <article className="docs-article">
      <p className="docs-kicker">Examples</p>
      <h1 className="docs-title">{title}</h1>
      <p className="docs-lede">{host ? host.note : pen.runtime}</p>
      <p>
        <A href="/examples" onNavigate={onNavigate}>
          All examples
        </A>
      </p>
      <ul className="pen-switch">
        {libraryPens.map((item) => (
          <li key={item.id}>
            <A
              href={`/examples/${item.id}`}
              onNavigate={onNavigate}
              current={item.id === pen.id && !host}
            >
              {item.label}
            </A>
          </li>
        ))}
      </ul>
      {host?.desk ? (
        <DeskStage id={host.id as DeskId} title={title} caption={host.desk.caption} />
      ) : (
        <PenStage
          penId={pen.id}
          title={title}
          caption={host ? `Rendered by ${pen.label}` : pen.mount}
        />
      )}
      <CodeBlock
        code={host?.desk ? deskSources[host.id as DeskId] : penSources[pen.id]}
        label={host?.desk?.file ?? pen.file}
      />
    </article>
  );
}

function DeskStage({ id, title, caption }: { id: DeskId; title: string; caption: string }) {
  const src = deskDocument(id);
  return (
    <div className="pen-stage">
      <div className="pen-stage-bar">
        <span>Result · {caption}</span>
        <a href={src} target="_blank" rel="noreferrer">
          Open host document
        </a>
      </div>
      <iframe title={`${title} example`} src={src} />
    </div>
  );
}

function PenStage({ penId, title, caption }: { penId: PenId; title: string; caption: string }) {
  const src = penDocument(penId);
  return (
    <div className="pen-stage">
      <div className="pen-stage-bar">
        <span>Result · {caption}</span>
        <a href={src} target="_blank" rel="noreferrer">
          Open pen document
        </a>
      </div>
      <iframe title={`${title} example`} src={src} />
    </div>
  );
}
