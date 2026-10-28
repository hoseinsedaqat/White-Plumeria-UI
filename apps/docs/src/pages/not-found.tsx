import { Button } from '@white-plumeria/react';

export function NotFoundPage({ onNavigate }: { onNavigate: (href: string) => void }) {
  return (
    <article>
      <p className="docs-kicker">404</p>
      <h1 className="docs-display" style={{ fontSize: 'clamp(2.4rem, 5vw, 4rem)' }}>
        This path is not in the docs.
      </h1>
      <p className="docs-lede">The page is missing. It is not a placeholder for an unfinished feature.</p>
      <Button onClick={() => onNavigate('/')}>Back home</Button>
    </article>
  );
}
