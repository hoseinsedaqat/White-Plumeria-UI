import { Button } from '@white-plumeria/react';

export function NotFoundPage({ onNavigate }: { onNavigate: (href: string) => void }) {
  return (
    <article className="docs-article">
      <p className="docs-kicker">404</p>
      <h1 className="docs-title">This path is not in the docs.</h1>
      <p className="docs-lede">The page is missing. It is not a placeholder for an unfinished feature.</p>
      <Button onClick={() => onNavigate('/')}>Back home</Button>
    </article>
  );
}
