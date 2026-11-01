import { brand, catalog, categoryLabels, isThemeName, searchComponents } from '@white-plumeria/core';
import { Icon, Mark, useWhitePlumeria } from '@white-plumeria/react';
import { themes, type ThemeDefinition } from '@white-plumeria/tokens';
import { useEffect, useMemo, useRef, useState } from 'react';
import { AiPage } from './pages/ai.tsx';
import { BlocksPage } from './pages/blocks.tsx';
import { ComponentPage } from './pages/component.tsx';
import { GalleryPage } from './pages/gallery.tsx';
import { ExamplePage, ExamplesPage } from './pages/examples.tsx';
import { GuidePage } from './pages/guides.tsx';
import { HomePage } from './pages/home.tsx';
import { NotFoundPage } from './pages/not-found.tsx';
import { PlaygroundPage } from './pages/playground.tsx';
import { ThemeLabPage } from './pages/theme-lab.tsx';
import { useDocsScheme } from './preview.tsx';
import { isExampleId } from './pen-meta.ts';
import { A, useRoute } from './router.tsx';

const startLinks = [
  ['/start', 'Quick start'],
  ['/install', 'Install'],
  ['/servers', 'Server hosts'],
  ['/theming', 'Theming'],
  ['/direction', 'Direction'],
  ['/accessibility', 'Accessibility'],
  ['/components', 'All components'],
  ['/blocks', 'Blocks'],
  ['/examples', 'Examples'],
  ['/playground', 'Playground'],
  ['/ai', 'AI studio'],
  ['/themes', 'Theme lab'],
  ['/changelog', 'Changelog'],
  ['/contributing', 'Contributing'],
  ['/security', 'Security'],
] as const;

const guidePaths = ['/start', '/install', '/servers', '/theming', '/direction', '/rtl', '/accessibility', '/changelog', '/contributing', '/security'];

export function DocsApp() {
  const { path, navigate } = useRoute();
  const { preferences, setPreferences } = useWhitePlumeria();
  const [query, setQuery] = useState('');
  const [navOpen, setNavOpen] = useState(false);
  const [themeOpen, setThemeOpen] = useState(false);
  const [narrow, setNarrow] = useState(false);
  const themeRef = useRef<HTMLDivElement>(null);
  const results = useMemo(() => (query.trim() ? searchComponents(query).slice(0, 8) : []), [query]);
  const componentSlug = path.match(/^\/components\/([a-z0-9-]+)$/)?.[1];
  const exampleId = path.match(/^\/examples\/([a-z0-9-]+)$/)?.[1];
  const showSide = path !== '/';
  const theme = themes.find((item) => item.name === preferences.theme) ?? themes[0];
  const scheme = useDocsScheme(preferences.appearance);
  // Component pages keep the chrome on White. The selected theme stays on the preview, so a color change cannot paint the page and the component the same color.

  useEffect(() => {
    document.title = componentSlug ? `${componentSlug} · ${brand.productName}` : brand.productName;
  }, [componentSlug]);

  useEffect(() => {
    if (typeof window.matchMedia !== 'function') return;
    const queryList = window.matchMedia('(max-width: 960px)');
    const apply = () => setNarrow(queryList.matches);
    apply();
    queryList.addEventListener('change', apply);
    return () => queryList.removeEventListener('change', apply);
  }, []);

  useEffect(() => {
    document.documentElement.lang = 'en';
    document.documentElement.dir = 'ltr';
    if (preferences.locale !== 'en') setPreferences({ locale: 'en' });
  }, [preferences, setPreferences]);

  useEffect(() => {
    function onPointer(event: PointerEvent) {
      if (!themeRef.current?.contains(event.target as Node)) setThemeOpen(false);
    }
    function onKey(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setThemeOpen(false);
        setQuery('');
        setNavOpen(false);
      }
    }
    document.addEventListener('pointerdown', onPointer);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('pointerdown', onPointer);
      document.removeEventListener('keydown', onKey);
    };
  }, []);

  function go(href: string) {
    setNavOpen(false);
    setQuery('');
    setThemeOpen(false);
    navigate(href);
  }

  let page = <NotFoundPage onNavigate={go} />;
  if (path === '/') page = <HomePage onNavigate={go} />;
  else if (path === '/components') page = <GalleryPage onNavigate={go} />;
  else if (path === '/blocks') page = <BlocksPage />;
  else if (path === '/examples') page = <ExamplesPage onNavigate={go} />;
  else if (exampleId && isExampleId(exampleId)) page = <ExamplePage id={exampleId} onNavigate={go} />;
  else if (path === '/playground') page = <PlaygroundPage />;
  else if (path === '/ai') page = <AiPage />;
  else if (path === '/themes') page = <ThemeLabPage />;
  else if (componentSlug) page = <ComponentPage slug={componentSlug} onNavigate={go} />;
  else if (path === '/rtl') page = <GuidePage path="/direction" />;
  else if (guidePaths.includes(path)) page = <GuidePage path={path} />;

  return (
    <div
      className="docs-app wpl-root wpl-reset"
      data-home={showSide ? 'false' : 'true'}
      data-wpl-theme={path === '/' ? preferences.theme : 'white'}
      data-wpl-scheme={scheme}
    >
      <a className="docs-skip wpl-btn wpl-btn-primary" href="#content">
        Skip to content
      </a>
      <A href="/blocks" className="home-banner" onNavigate={go}>
        <span>
          {catalog.length} free components. Patterns other libraries sell are included.
        </span>
        <span aria-hidden="true">→</span>
      </A>
      <header className="docs-top">
        <button
          type="button"
          className="wpl-icon-btn wpl-btn-ghost docs-menu-btn"
          aria-expanded={navOpen}
          aria-label={navOpen ? 'Close menu' : 'Open menu'}
          onClick={() => setNavOpen((value) => !value)}
        >
          <MenuIcon />
        </button>
        <A href="/" className="docs-brand" onNavigate={go}>
          <Mark />
          <span>
            White Plumeria
            <small>Design system · {brand.version}</small>
          </span>
        </A>
        <div className="docs-search">
          <label className="wpl-sr-only" htmlFor="docs-search">
            Search docs
          </label>
          <div className="docs-search-field">
            <span className="docs-search-icon" aria-hidden="true">
              <Icon name="search" />
            </span>
            <input
              id="docs-search"
              className="wpl-input wpl-input-sm"
              placeholder="Search components"
              value={query}
              onChange={(event) => setQuery(event.currentTarget.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' && results[0]) go(`/components/${results[0].slug}`);
              }}
            />
          </div>
          {query.trim() ? (
            <div className="docs-search-results" role="listbox" aria-label="Search results">
              {results.length === 0 ? <p className="docs-search-empty">No components match.</p> : null}
              {results.map((item) => (
                <A key={item.slug} href={`/components/${item.slug}`} onNavigate={go}>
                  <strong>{item.name}</strong>
                  <small>{item.summary}</small>
                </A>
              ))}
            </div>
          ) : null}
        </div>
        <nav className="docs-links" aria-label="Primary">
          <A href="/start" onNavigate={go} current={path === '/start'}>
            Docs
          </A>
          <A href="/components" onNavigate={go} current={path === '/components' || Boolean(componentSlug)}>
            Components
          </A>
          <A href="/examples" onNavigate={go} current={path === '/examples' || path.startsWith('/examples/')}>
            Examples
          </A>
          <A href="/playground" onNavigate={go} current={path === '/playground'}>
            Playground
          </A>
          <A href="/ai" onNavigate={go} current={path === '/ai'}>
            AI
          </A>
        </nav>
        <div className="docs-tools">
          <div className="docs-pop" ref={themeRef}>
            <button
              type="button"
              className="docs-tool docs-theme-trigger"
              aria-expanded={themeOpen}
              aria-haspopup="dialog"
              aria-label={`Theme: ${theme?.label ?? 'White'}`}
              onClick={() => setThemeOpen((value) => !value)}
            >
              {theme ? <ThemeSwatch colors={signatureColors(theme)} /> : null}
              <span className="docs-theme-name">{theme?.label}</span>
            </button>
            {themeOpen ? (
              <div className="docs-pop-panel" role="dialog" aria-label="Theme, direction, and motion">
                <p className="docs-note-line">
                  Themes color the components. Direction and motion change previews only. This page stays left to right.
                </p>
                <h2>Appearance</h2>
                <div className="docs-segment" role="group" aria-label="Appearance">
                  {(['light', 'dark', 'system'] as const).map((item) => (
                    <button
                      key={item}
                      type="button"
                      aria-pressed={preferences.appearance === item}
                      onClick={() => setPreferences({ appearance: item })}
                    >
                      {item}
                    </button>
                  ))}
                </div>
                <h2>Direction</h2>
                <div className="docs-segment" role="group" aria-label="Direction">
                  {(['auto', 'ltr', 'rtl'] as const).map((item) => (
                    <button
                      key={item}
                      type="button"
                      aria-pressed={preferences.direction === item}
                      onClick={() => setPreferences({ direction: item })}
                    >
                      {item === 'auto' ? 'Auto' : item.toUpperCase()}
                    </button>
                  ))}
                </div>
                <h2>Motion</h2>
                <div className="docs-segment" role="group" aria-label="Motion">
                  {(
                    [
                      ['system', 'System'],
                      ['reduce', 'Reduce'],
                      ['no-preference', 'Allow'],
                    ] as const
                  ).map(([item, label]) => (
                    <button
                      key={item}
                      type="button"
                      aria-pressed={preferences.reducedMotion === item}
                      onClick={() => setPreferences({ reducedMotion: item })}
                    >
                      {label}
                    </button>
                  ))}
                </div>
                <h2>Theme</h2>
                <div className="docs-theme-list" role="listbox" aria-label="Themes">
                  {themes.map((item) => (
                    <button
                      key={item.name}
                      type="button"
                      role="option"
                      className="docs-theme-row"
                      aria-selected={preferences.theme === item.name}
                      aria-pressed={preferences.theme === item.name}
                      onClick={() => {
                        if (isThemeName(item.name)) setPreferences({ theme: item.name });
                      }}
                    >
                      <ThemeSwatch colors={signatureColors(item)} />
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
          <a className="docs-tool" href={brand.repository}>
            GitHub
          </a>
        </div>
      </header>
      <div className="docs-frame" data-nav={navOpen ? 'open' : 'closed'} data-home={showSide ? 'false' : 'true'}>
        <button type="button" className="docs-backdrop" aria-label="Close menu" onClick={() => setNavOpen(false)} />
        <aside
          className={`docs-side${showSide ? ' is-docked' : ''}${navOpen ? ' is-open' : ''}`}
          hidden={narrow ? !navOpen : !showSide}
        >
          <div className="docs-side-search">
            <label className="wpl-sr-only" htmlFor="docs-search-mobile">
              Search components
            </label>
            <div className="docs-search-field">
              <span className="docs-search-icon" aria-hidden="true">
                <Icon name="search" />
              </span>
              <input
                id="docs-search-mobile"
                className="wpl-input wpl-input-sm"
                placeholder="Search components"
                value={query}
                onChange={(event) => setQuery(event.currentTarget.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' && results[0]) go(`/components/${results[0].slug}`);
                }}
              />
            </div>
            {query.trim() ? (
              <div className="docs-side-results">
                {results.length === 0 ? <p>No components match.</p> : null}
                {results.map((item) => (
                  <A key={item.slug} href={`/components/${item.slug}`} onNavigate={go}>
                    <strong>{item.name}</strong>
                    <small>{item.summary}</small>
                  </A>
                ))}
              </div>
            ) : null}
          </div>
          <h2>Start</h2>
          {startLinks.map(([href, label]) => (
            <A key={href} href={href} onNavigate={go} current={path === href}>
              {label}
            </A>
          ))}
          {(Object.keys(categoryLabels) as Array<keyof typeof categoryLabels>).map((category) => (
            <div key={category}>
              <h2>{categoryLabels[category].en}</h2>
              {catalog
                .filter((item) => item.category === category)
                .map((item) => (
                  <A
                    key={item.slug}
                    href={`/components/${item.slug}`}
                    onNavigate={go}
                    current={path === `/components/${item.slug}`}
                  >
                    {item.name}
                  </A>
                ))}
            </div>
          ))}
        </aside>
        <main id="content" className={showSide ? 'docs-main' : 'docs-home'}>
          {page}
        </main>
      </div>
    </div>
  );
}

function MenuIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
      <path d="M3 5h12M3 9h12M3 13h12" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function signatureColors(theme: ThemeDefinition) {
  return [theme.light.primary, theme.light.danger, theme.light.success, theme.light.info];
}

function ThemeSwatch({ colors }: { colors: string[] }) {
  return (
    <span className="docs-swatch" aria-hidden="true">
      {colors.map((color, index) => (
        <i key={`${color}-${index}`} style={{ background: color }} />
      ))}
    </span>
  );
}
