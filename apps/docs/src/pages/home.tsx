import { brand, catalog } from '@white-plumeria/core';
import { themes, type ThemeDefinition } from '@white-plumeria/tokens';
import { Button, Checkbox, Input, Switch, useWhitePlumeria } from '@white-plumeria/react';
import { useEffect, useState, type CSSProperties } from 'react';
import { A } from '../router.tsx';
import '../home.css';

const install = 'npm i @white-plumeria/styles @white-plumeria/react';

const verboseForm = `<div style="width:20rem;border-radius:12px;background:#f6f1e8;padding:1.3rem">
  <input placeholder="Email" style="width:100%;border:1px solid #e0d5c6;border-radius:8px;padding:0.55rem 0.75rem" />
  <label style="display:flex;align-items:center;gap:0.4rem;margin-top:0.7rem">
    <input type="checkbox" checked /> Submit to newsletter
  </label>
  <label style="display:flex;align-items:center;gap:0.4rem;margin-top:0.7rem">
    <input type="checkbox" /> Accept terms of use
  </label>
  <button style="margin-top:0.7rem;border:0;border-radius:8px;background:#1c1915;color:#fff;padding:0.6rem 1rem;font-weight:650">Save</button>
</div>`;

const cleanForm = `<form class="wpl-stack">
  <input class="wpl-input" placeholder="Email" />
  <label class="wpl-check"><input type="checkbox" checked /> Submit to newsletter</label>
  <label class="wpl-check"><input type="checkbox" /> Accept terms of use</label>
  <button class="wpl-btn wpl-btn-primary" type="button">Save</button>
</form>`;

const fewer = Math.round((1 - cleanForm.length / verboseForm.length) * 100);
const chips = ['badge', 'card', 'input', 'select', 'dialog', 'tabs', 'alert', 'table'];
const swatches = [
  ['primary', 'var(--wpl-color-primary)'],
  ['accent', 'var(--wpl-color-accent)'],
  ['success', 'var(--wpl-color-success)'],
  ['warning', 'var(--wpl-color-warning)'],
  ['danger', 'var(--wpl-color-danger)'],
  ['info', 'var(--wpl-color-info)'],
] as const;

export function HomePage({ onNavigate }: { onNavigate: (href: string) => void }) {
  const [copied, setCopied] = useState(false);
  const [mode, setMode] = useState<'verbose' | 'clean'>('clean');
  const { preferences, setPreferences } = useWhitePlumeria();
  const scheme = useScheme(preferences.appearance);
  const selected = themes.find((theme) => theme.name === preferences.theme);

  async function copyInstall() {
    try {
      await navigator.clipboard.writeText(install);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1400);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="home">
      <section className="home-hero" aria-label="Introduction">
        <div className="home-intro">
          <div className="home-intro-inner">
            <button type="button" className="home-install" onClick={() => void copyInstall()}>
              <CopyIcon />
              <code>{copied ? 'Copied' : install}</code>
            </button>
            <h1 className="home-title">
              <span className="home-title-strong">Faster, cleaner, easier</span>
              <span className="home-title-thin">component development</span>
            </h1>
            <p className="home-sub">
              White Plumeria is a design system you can read. Semantic classes, built-in themes, and native
              components. Write less markup. Tailwind is not required.
            </p>
            <div className="home-ctas">
              <A className="home-cta home-cta-dark" href="/components" onNavigate={onNavigate}>
                See components
              </A>
              <A className="home-cta" href="/start" onNavigate={onNavigate}>
                How to use?
              </A>
            </div>
            <p className="home-note">Not on npm yet. The pill copies the intended install command.</p>
          </div>
        </div>

        <div className="home-stage" aria-label="Theme preview">
          <article className="home-float home-float-system" data-wpl-theme={preferences.theme} data-wpl-scheme="dark">
            <header>
              <span>Design system</span>
              <span className="home-float-mark" aria-hidden="true" />
            </header>
            <Switch label="Faster to read" defaultChecked />
            <Switch label="Themeable" defaultChecked />
            <Switch label="Pure CSS" defaultChecked />
            <div className="home-sizes" aria-label="Button sizes">
              <Button size="xs">xs</Button>
              <Button size="sm">sm</Button>
              <Button size="md">md</Button>
              <Button size="lg">lg</Button>
            </div>
          </article>
          <article className="home-float home-float-colors" data-wpl-theme={preferences.theme} data-wpl-scheme="dark">
            <header>
              <span>Semantic colors</span>
            </header>
            <div className="home-colors">
              {swatches.map(([name, background]) => (
                <div key={name}>
                  <i style={{ background }} />
                  {name}
                </div>
              ))}
            </div>
          </article>
        </div>
      </section>

      <section className="home-beats" aria-label="Why it is shorter">
        <div className="home-beat">
          <h2>
            Don&apos;t restyle
            <br />
            the same control
            <br />
            <span>every time</span>
          </h2>
          <p>Without a design system, you rewrite color, spacing, and focus styles for every element.</p>
        </div>
        <div className="home-beat">
          <h2>
            <span>instead of writing</span>
            <br />
            <span className="home-danger">a long style</span>
            <br />
            attribute
          </h2>
          <p>For every element, every page, every project, again and again.</p>
        </div>
        <div className="home-beat">
          <h2>
            <span>use </span>
            <span className="home-ok">semantic</span>
            <br />
            class names
          </h2>
          <p>Shorter markup. The same names in CSS, React, Vue, Svelte, and Angular.</p>
        </div>
      </section>

      <section className="home-section">
        <h2>
          Take the markup
          <br />
          <span className="home-gradient">to the next level</span>
        </h2>
        <p className="home-inline-links">
          Class names and components like{' '}
          <A href="/components/button" onNavigate={onNavigate}>
            Button
          </A>
          ,{' '}
          <A href="/components/card" onNavigate={onNavigate}>
            Card
          </A>
          , and{' '}
          <A href="/components/switch" onNavigate={onNavigate}>
            Switch
          </A>
          , plus {Math.max(catalog.length - 3, 0)} more.
        </p>
        <div className="home-ctas">
          <A className="home-cta home-cta-dark" href="/components" onNavigate={onNavigate}>
            See all components
          </A>
        </div>
      </section>

      <section className="home-section">
        <h2>
          No more
          <br />
          ugly HTML
        </h2>
        <p>The same form. One version is a style attribute. The other uses classes from this library.</p>
        <div className="home-switch" role="group" aria-label="Markup style">
          <button type="button" aria-pressed={mode === 'verbose'} onClick={() => setMode('verbose')}>
            Long style
          </button>
          <button type="button" aria-pressed={mode === 'clean'} onClick={() => setMode('clean')}>
            White Plumeria
          </button>
        </div>
        <div className="home-compare">
          <pre className="home-code">
            <code>{mode === 'clean' ? cleanForm : verboseForm}</code>
          </pre>
          <div className="home-eq" aria-hidden="true">
            =
          </div>
          <div className="home-form">
            <Input placeholder="Email" aria-label="Email" />
            <Checkbox label="Submit to newsletter" defaultChecked />
            <Checkbox label="Accept terms of use" />
            <Button>Save</Button>
          </div>
        </div>
        <div className="home-meter">
          <div>
            <strong>{verboseForm.length}</strong>
            <span>characters, long style</span>
          </div>
          <div>
            <strong>{cleanForm.length}</strong>
            <span>characters, class names</span>
          </div>
          <div>
            <strong>{fewer}%</strong>
            <span>shorter in this example</span>
          </div>
        </div>
      </section>

      <section className="home-section">
        <h2>
          Unlimited themes
          <br />
          <span>with zero extra classes</span>
        </h2>
        <p>
          Pick a theme. The floating cards show its dark scheme. The preview below follows the appearance you choose.
          The page canvas stays dark.
        </p>
        <div className="home-switch" role="group" aria-label="Color scheme">
          {(['light', 'dark', 'system'] as const).map((appearance) => (
            <button
              key={appearance}
              type="button"
              aria-pressed={preferences.appearance === appearance}
              onClick={() => setPreferences({ appearance })}
            >
              {appearance[0]?.toUpperCase()}
              {appearance.slice(1)}
            </button>
          ))}
        </div>
        <div className="home-theme-row" role="group" aria-label="Themes">
          {themes.map((theme) => (
            <button
              key={theme.name}
              type="button"
              aria-pressed={preferences.theme === theme.name}
              onClick={() => setPreferences({ theme: theme.name })}
            >
              <span className="docs-swatch" aria-hidden="true">
                <i style={{ background: theme.light.primary }} />
                <i style={{ background: theme.light.danger }} />
                <i style={{ background: theme.light.success }} />
                <i style={{ background: theme.light.info }} />
              </span>
              {theme.label}
            </button>
          ))}
        </div>
        {selected ? (
          <div className="home-preview" style={cssVars(selected, scheme)}>
            <div className="home-sizes">
              <Button size="sm">Primary</Button>
              <Button size="sm" variant="outline">
                Outline
              </Button>
              <Button size="sm" variant="danger">
                Danger
              </Button>
              <Button size="sm" variant="ghost">
                Ghost
              </Button>
            </div>
            <div className="home-colors">
              {swatches.map(([name, background]) => (
                <div key={name}>
                  <i style={{ background }} />
                  {name}
                </div>
              ))}
            </div>
          </div>
        ) : null}
        <div className="home-theme-cards">
          {themes.map((theme) => (
            <button
              key={theme.name}
              type="button"
              className="home-theme-card"
              style={cssVars(theme, scheme)}
              aria-pressed={preferences.theme === theme.name}
              onClick={() => setPreferences({ theme: theme.name })}
            >
              <strong>{theme.label}</strong>
              <span>
                <i style={{ background: 'var(--wpl-color-primary)' }} />
                <i style={{ background: 'var(--wpl-color-accent)' }} />
                <i style={{ background: 'var(--wpl-color-success)' }} />
                <i style={{ background: 'var(--wpl-color-info)' }} />
              </span>
            </button>
          ))}
        </div>
        <div className="home-ctas">
          <A className="home-cta" href="/themes" onNavigate={onNavigate}>
            Open theme lab
          </A>
        </div>
      </section>

      <section className="home-section">
        <h2>
          Pure CSS.
          <br />
          <span>Works everywhere.</span>
        </h2>
        <p>The stylesheet does not require a framework. The components are native in each one.</p>
        <div className="home-frameworks" aria-label="Frameworks">
          <span>HTML</span>
          <span>React</span>
          <span>Vue</span>
          <span>Svelte</span>
          <span>Angular</span>
        </div>
      </section>

      <section className="home-section">
        <h2>
          {catalog.length} components.
          <br />
          <span>One catalog.</span>
        </h2>
        <p>Every name below is a real component.</p>
        <div className="home-chips">
          {chips.map((slug) => {
            const item = catalog.find((entry) => entry.slug === slug);
            if (!item) return null;
            return (
              <A key={slug} href={`/components/${slug}`} onNavigate={onNavigate}>
                {item.name}
              </A>
            );
          })}
        </div>
      </section>

      <p className="home-foot">
        {brand.productName} {brand.version} · {brand.license}. Packages are not published to npm yet.
      </p>
    </div>
  );
}

function cssVars(theme: ThemeDefinition, scheme: 'light' | 'dark'): CSSProperties {
  const style: Record<string, string> = {};
  for (const [key, value] of Object.entries(theme[scheme])) {
    const kebab = key.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`);
    style[`--wpl-color-${kebab}`] = value;
  }
  return style;
}

function useScheme(appearance: 'light' | 'dark' | 'system') {
  const [system, setSystem] = useState<'light' | 'dark'>('light');
  useEffect(() => {
    if (typeof window.matchMedia !== 'function') return;
    const query = window.matchMedia('(prefers-color-scheme: dark)');
    const apply = () => setSystem(query.matches ? 'dark' : 'light');
    apply();
    query.addEventListener('change', apply);
    return () => query.removeEventListener('change', apply);
  }, []);
  return appearance === 'system' ? system : appearance;
}

function CopyIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" aria-hidden="true">
      <rect x="8" y="8" width="12" height="12" rx="2" fill="none" stroke="currentColor" strokeWidth="2" />
      <path d="M6 16H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" fill="none" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}
