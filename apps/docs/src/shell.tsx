import { brand, catalog, categoryLabels, searchComponents } from '@white-plumeria/core';
import { Mark, useWhitePlumeria } from '@white-plumeria/react';
import { useEffect, useMemo, useState } from 'react';
import { copy } from './i18n.ts';
import { AiPage } from './pages/ai.tsx';
import { ComponentPage } from './pages/component.tsx';
import { GuidePage } from './pages/guides.tsx';
import { HomePage } from './pages/home.tsx';
import { NotFoundPage } from './pages/not-found.tsx';
import { PlaygroundPage } from './pages/playground.tsx';
import { ThemeLabPage } from './pages/theme-lab.tsx';
import { A, useRoute } from './router.tsx';

export function DocsApp() {
  const { path, navigate } = useRoute();
  const { preferences, setPreferences, locale } = useWhitePlumeria();
  const t = copy[locale];
  const [query, setQuery] = useState('');
  const [navOpen, setNavOpen] = useState(false);
  const results = useMemo(() => (query.trim() ? searchComponents(query).slice(0, 8) : []), [query]);
  const componentSlug = path.match(/^\/components\/([a-z0-9-]+)$/)?.[1];
  const showSide = path !== '/';

  useEffect(() => {
    document.title = componentSlug ? `${componentSlug} · ${brand.productName}` : brand.productName;
  }, [componentSlug, path]);

  function go(href: string) {
    setNavOpen(false);
    setQuery('');
    navigate(href);
  }

  let page = <NotFoundPage onNavigate={go} />;
  if (path === '/') page = <HomePage onNavigate={go} />;
  else if (path === '/playground') page = <PlaygroundPage />;
  else if (path === '/ai') page = <AiPage />;
  else if (path === '/themes') page = <ThemeLabPage />;
  else if (componentSlug) page = <ComponentPage slug={componentSlug} />;
  else if (
    ['/start', '/install', '/theming', '/rtl', '/accessibility', '/changelog', '/contributing', '/security'].includes(path)
  ) {
    page = <GuidePage path={path} />;
  }

  return (
    <div className="docs-shell wpl-root wpl-reset">
      <a className="docs-skip wpl-btn wpl-btn-primary" href="#content">
        {t.skip}
      </a>
      <header className="docs-top">
        <A href="/" className="docs-brand" onNavigate={go}>
          <Mark />
          <span>
            {t.product}
            <small>{t.tag} · {brand.version}</small>
          </span>
        </A>
        <button type="button" className="wpl-icon-btn wpl-btn-ghost docs-menu-btn" aria-expanded={navOpen} onClick={() => setNavOpen((value) => !value)}>
          <span className="wpl-sr-only">{t.menu}</span>
          ☰
        </button>
        <div className="docs-search">
          <label className="wpl-sr-only" htmlFor="docs-search">
            {t.search}
          </label>
          <input
            id="docs-search"
            className="wpl-input wpl-input-sm"
            placeholder={t.search}
            value={query}
            onChange={(event) => setQuery(event.currentTarget.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' && results[0]) go(`/components/${results[0].slug}`);
              if (event.key === 'Escape') setQuery('');
            }}
          />
          {results.length ? (
            <div className="docs-search-results" role="listbox">
              {results.map((item) => (
                <A key={item.slug} href={`/components/${item.slug}`} onNavigate={go}>
                  <strong>{item.name}</strong>
                  <div className="wpl-muted">{locale === 'fa' ? item.summaryFa : item.summary}</div>
                </A>
              ))}
            </div>
          ) : null}
        </div>
        <nav className="docs-nav" aria-label="Primary">
          <A href="/start" onNavigate={go} current={path === '/start'}>
            {t.docs}
          </A>
          <A href="/playground" onNavigate={go} current={path === '/playground'}>
            {t.playground}
          </A>
          <A href="/ai" onNavigate={go} current={path === '/ai'}>
            {t.ai}
          </A>
          <a className="docs-keep" href={brand.repository}>
            {t.github}
          </a>
          <button
            type="button"
            className="docs-text-btn"
            onClick={() =>
              setPreferences({
                locale: locale === 'fa' ? 'en' : 'fa',
                direction: locale === 'fa' ? 'ltr' : 'rtl',
              })
            }
          >
            {locale === 'fa' ? 'EN' : 'فا'}
          </button>
          <button
            type="button"
            className="docs-text-btn"
            onClick={() =>
              setPreferences({
                appearance: preferences.appearance === 'dark' ? 'light' : preferences.appearance === 'light' ? 'system' : 'dark',
              })
            }
          >
            {preferences.appearance}
          </button>
        </nav>
      </header>
      <div className="docs-body" data-nav={navOpen ? 'open' : 'closed'}>
        {showSide ? (
          <aside className="docs-side">
            <h2>{t.start}</h2>
            {[
              ['/start', locale === 'fa' ? 'شروع سریع' : 'Quick start'],
              ['/install', t.install],
              ['/theming', locale === 'fa' ? 'تم' : 'Theming'],
              ['/rtl', 'RTL'],
              ['/accessibility', locale === 'fa' ? 'دسترس‌پذیری' : 'Accessibility'],
              ['/playground', t.playground],
              ['/ai', t.ai],
              ['/themes', t.themes],
            ].map(([href, label]) => (
              <A key={href} href={href!} onNavigate={go} current={path === href}>
                {label}
              </A>
            ))}
            {(Object.keys(categoryLabels) as Array<keyof typeof categoryLabels>).map((category) => (
              <div key={category}>
                <h2>{locale === 'fa' ? categoryLabels[category].fa : categoryLabels[category].en}</h2>
                {catalog
                  .filter((item) => item.category === category)
                  .map((item) => (
                    <A key={item.slug} href={`/components/${item.slug}`} onNavigate={go} current={path === `/components/${item.slug}`}>
                      {item.name}
                    </A>
                  ))}
              </div>
            ))}
          </aside>
        ) : null}
        <main id="content" className="docs-main">
          {page}
        </main>
      </div>
    </div>
  );
}
