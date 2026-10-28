import { useEffect, useState, type ReactNode } from 'react';

export function basePath(): string {
  return import.meta.env.BASE_URL.replace(/\/$/, '');
}

export function stripBase(pathname: string): string {
  const base = basePath();
  const path = base && pathname.startsWith(base) ? pathname.slice(base.length) : pathname;
  return path.startsWith('/') ? path : `/${path}`;
}

export function useRoute() {
  const [path, setPath] = useState(() =>
    typeof window === 'undefined' ? '/' : stripBase(window.location.pathname),
  );

  useEffect(() => {
    const onPop = () => setPath(stripBase(window.location.pathname));
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  function navigate(to: string) {
    const next = to.startsWith('/') ? to : `/${to}`;
    window.history.pushState({}, '', `${basePath()}${next}`);
    setPath(next);
    window.scrollTo(0, 0);
  }

  return { path, navigate };
}

export function A({
  href,
  children,
  className,
  current,
  onNavigate,
}: {
  href: string;
  children: ReactNode;
  className?: string;
  current?: boolean;
  onNavigate: (href: string) => void;
}) {
  return (
    <a
      className={className}
      href={`${basePath()}${href}`}
      aria-current={current ? 'page' : undefined}
      onClick={(event) => {
        if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
        event.preventDefault();
        onNavigate(href);
      }}
    >
      {children}
    </a>
  );
}
