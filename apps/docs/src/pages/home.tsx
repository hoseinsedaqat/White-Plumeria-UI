import { brand, buttonClassName, catalog, categoryLabels, resolveDirection } from '@white-plumeria/core';
import { themes, type ThemeDefinition } from '@white-plumeria/tokens';
import { Button, Card, Checkbox, Input, Mark, Switch, ToggleGroup, useWhitePlumeria } from '@white-plumeria/react';
import type { ButtonSize } from '@white-plumeria/core';
import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { A } from '../router.tsx';
import '../home.css';

const install = 'npm i @white-plumeria/styles @white-plumeria/react';
const longStyle =
  'display:inline-flex;align-items:center;justify-content:center;height:2.75rem;padding:0 1.1rem;border:1px solid transparent;border-radius:999px;background:#1c1915;color:#fff;font-weight:650;cursor:pointer';
const shortClass = 'wpl-btn wpl-btn-primary';

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

function markAttr(source: string, attr: 'style' | 'class') {
  return source.split(new RegExp(`(${attr}="[^"]*")`, 'g')).map((part, index) =>
    part.startsWith(`${attr}="`) ? (
      <span key={index} className={attr === 'style' ? 'is-long' : 'is-short'}>
        {part}
      </span>
    ) : (
      part
    ),
  );
}
const pureMarkup = `<input class="wpl-input" placeholder="Email" />
<label class="wpl-check"><input type="checkbox" checked /> Submit to newsletter</label>
<button class="wpl-btn wpl-btn-primary" type="button">Save</button>`;
const catalogGroups = (['base', 'form', 'interaction', 'data', 'layout'] as const).map((category) => ({
  category,
  label: categoryLabels[category].en,
  items: catalog.filter((item) => item.category === category),
}));
const principles = [
  ['One vocabulary', 'Class names stay wpl-. Tokens stay --wpl-. A theme change does not fork the markup.'],
  ['Native, not wrapped', 'Each adapter is written for that framework. Vue is not React in a costume, and Ember is not Alpine.'],
  ['Theme once', 'Color, type, and focus come from CSS variables, so the same component follows the selected theme.'],
] as const;
const adapters = [
  ['HTML', '@white-plumeria/styles', 'Stylesheet only', 'Put the classes on native elements. No framework runtime. The elements package is a smaller custom-element set, not a second catalog.'],
  ['React', '@white-plumeria/react', 'Docs and hooks', 'Controlled props and hooks. The live previews on this site render from this package.'],
  ['Vue', '@white-plumeria/vue', 'Single-file components', 'Templates and v-model. The same names as React, with Vue events instead of a React wrapper.'],
  ['Svelte', '@white-plumeria/svelte', 'Svelte 5', 'Runes and markup in the component file. State does not go through another framework.'],
  ['Angular', '@white-plumeria/angular', 'Signals', 'Standalone components and signal inputs. Templates stay Angular templates.'],
  ['Solid', '@white-plumeria/solid', 'Fine-grained', 'JSX with Solid signals. It is not the React package under another import.'],
  ['Preact', '@white-plumeria/preact', 'Smaller runtime', 'A React-shaped API of its own. It does not re-export @white-plumeria/react.'],
  ['Qwik', '@white-plumeria/qwik', 'Resumable', 'Components and QRL handlers for Qwik. The stylesheet is still the shared one.'],
  ['Lit', '@white-plumeria/lit', 'Custom elements', 'Light DOM, so the shared stylesheet reaches the controls. Register the tags, then use them as elements.'],
  ['Alpine', '@white-plumeria/alpine', 'HTML behavior', 'Add behavior to markup you already have. No compile step and no Vue wrapper.'],
  ['Marko', '@white-plumeria/marko', 'Tags', 'Tag files for Marko 6. Button and Provider have a tested server render. The other tags are client components.'],
  ['Ember', '@white-plumeria/ember', 'Glimmer', 'Native Glimmer components for Ember 7.4. Rendered on the client. Server render is not claimed.'],
] as const;
const swatches = [
  ['primary', 'var(--wpl-color-primary)', 'var(--wpl-color-primary-fg)'],
  ['accent', 'var(--wpl-color-accent)', ''],
  ['success', 'var(--wpl-color-success)', 'var(--wpl-color-success-fg)'],
  ['warning', 'var(--wpl-color-warning)', 'var(--wpl-color-warning-fg)'],
  ['danger', 'var(--wpl-color-danger)', 'var(--wpl-color-danger-fg)'],
  ['info', 'var(--wpl-color-info)', 'var(--wpl-color-info-fg)'],
  ['surface', 'var(--wpl-color-surface)', 'var(--wpl-color-text)'],
  ['text', 'var(--wpl-color-text)', 'var(--wpl-color-bg)'],
] as const;
const sizes = ['xs', 'sm', 'md', 'lg', 'xl'] as const satisfies readonly ButtonSize[];
const radii = [
  ['sm', 'var(--wpl-radius-sm)'],
  ['md', 'var(--wpl-radius-md)'],
  ['lg', 'var(--wpl-radius-lg)'],
  ['xl', 'var(--wpl-radius-xl)'],
  ['full', 'var(--wpl-radius-full)'],
] as const;
const spaces = [
  ['2', 'var(--wpl-space-2)'],
  ['3', 'var(--wpl-space-3)'],
  ['4', 'var(--wpl-space-4)'],
  ['6', 'var(--wpl-space-6)'],
  ['8', 'var(--wpl-space-8)'],
] as const;
const palette = [
  ['primary', 'var(--wpl-color-primary)', 'var(--wpl-color-primary-fg)'],
  ['success', 'var(--wpl-color-success)', 'var(--wpl-color-success-fg)'],
  ['warning', 'var(--wpl-color-warning)', 'var(--wpl-color-warning-fg)'],
  ['danger', 'var(--wpl-color-danger)', 'var(--wpl-color-danger-fg)'],
  ['info', 'var(--wpl-color-info)', 'var(--wpl-color-info-fg)'],
  ['accent', 'var(--wpl-color-accent)', 'var(--wpl-color-accent-fg)'],
  ['canvas', 'var(--wpl-color-bg)', 'var(--wpl-color-text)'],
  ['muted', 'var(--wpl-color-bg-muted)', 'var(--wpl-color-text)'],
  ['surface', 'var(--wpl-color-surface)', 'var(--wpl-color-text)'],
] as const;
const cleanShare = Math.max(8, Math.round((cleanForm.length / verboseForm.length) * 100));
const verboseDecls = (verboseForm.match(/;/g) ?? []).length;
const cleanTokens = [...cleanForm.matchAll(/class="([^"]*)"/g)].reduce((count, match) => count + match[1].split(/\s+/).filter(Boolean).length, 0);
const declShare = Math.max(8, Math.round((cleanTokens / Math.max(verboseDecls, 1)) * 100));
const declFewer = Math.round((1 - cleanTokens / Math.max(verboseDecls, 1)) * 100);
const semantic = palette.filter(([name]) => name !== 'canvas' && name !== 'muted' && name !== 'surface');
const surfaces = [
  ['canvas', 'var(--wpl-color-bg)', 'var(--wpl-color-text)'],
  ['muted', 'var(--wpl-color-bg-muted)', 'var(--wpl-color-text)'],
  ['surface', 'var(--wpl-color-surface)', 'var(--wpl-color-text)'],
  ['text', 'var(--wpl-color-text)', 'var(--wpl-color-bg)'],
] as const;

export function HomePage({ onNavigate }: { onNavigate: (href: string) => void }) {
  const heroRef = useRef<HTMLElement>(null);
  const [progress, setProgress] = useState(0);
  const [copied, setCopied] = useState(false);
  const [panel, setPanel] = useState('Dashboard');
  const [tab, setTab] = useState('Features');
  const [view, setView] = useState<'auto' | 'dashboard' | 'markup'>('auto');
  const [outline, setOutline] = useState(false);
  const [soft, setSoft] = useState(false);
  const [large, setLarge] = useState(false);
  const [round, setRound] = useState(true);
  const customClass = ['wpl-btn', outline ? 'wpl-btn-outline' : 'wpl-btn-primary', soft ? 'wpl-btn-soft' : '', large ? 'wpl-btn-lg' : '', round ? 'wpl-btn-pill' : '']
    .filter(Boolean)
    .join(' ');
  const classChoices = [
    { key: 'outline', label: 'Outline', note: 'replaces primary', token: 'wpl-btn-outline', on: outline, toggle: () => setOutline((value) => !value) },
    { key: 'soft', label: 'Soft', note: 'adds a class', token: 'wpl-btn-soft', on: soft, toggle: () => setSoft((value) => !value) },
    { key: 'large', label: 'Large', note: 'adds a class', token: 'wpl-btn-lg', on: large, toggle: () => setLarge((value) => !value) },
    { key: 'round', label: 'Round', note: 'adds a class', token: 'wpl-btn-pill', on: round, toggle: () => setRound((value) => !value) },
  ] as const;
  const { preferences, setPreferences } = useWhitePlumeria();
  const scheme = useScheme(preferences.appearance);
  const showMarkup = view === 'auto' ? progress > 24 : view === 'markup';
  const typed = sliceByProgress(progress, longStyle, shortClass);

  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const el = heroRef.current;
      if (!el) return;
      const total = el.offsetHeight - window.innerHeight;
      const scrolled = Math.min(Math.max(-el.getBoundingClientRect().top, 0), Math.max(total, 0));
      setProgress(total <= 0 ? 0 : (scrolled / total) * 100);
    };
    const onScroll = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  async function copyInstall() {
    try {
      await navigator.clipboard.writeText(install);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1400);
    } catch {
      setCopied(false);
    }
  }

  const tilt = lerp(progress, 0, 16, 1, 0);

  return (
    <div className="home">
      <section className="home-hero" ref={heroRef} aria-label="Introduction">
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
              White Plumeria is a design system you can read.
              <br />
              Semantic classes, built-in themes, and native components.
              <br />
              Write less markup. Tailwind is not required.
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
            <ul className="home-stats">
              <li>
                <small>In this repository</small>
                <strong>{catalog.length}</strong>
                <span>components</span>
              </li>
              <li>
                <small>Written natively</small>
                <strong>{adapters.length}</strong>
                <span>adapters</span>
              </li>
              <li>
                <small>Light and dark</small>
                <strong>{themes.length}</strong>
                <span>themes</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="home-rail-col">
          <div
            className="home-window"
            dir={resolveDirection(preferences)}
            lang="en"
            data-wpl-theme={preferences.theme}
            data-wpl-scheme={scheme}
            data-wpl-motion={preferences.reducedMotion === 'system' ? undefined : preferences.reducedMotion}
            style={{ '--home-tilt': String(tilt) } as CSSProperties}
            aria-label="Live component preview"
          >
            <div className="home-window-bar">
              <span className="home-dots" aria-hidden="true">
                <i />
                <i />
                <i />
              </span>
              <div className="home-window-tools">
                <button type="button" aria-pressed={!showMarkup} onClick={() => setView('dashboard')}>
                  Preview
                </button>
                <button type="button" aria-pressed={showMarkup} onClick={() => setView('markup')}>
                  Markup
                </button>
              </div>
            </div>
            <div className="home-window-body">
              {showMarkup ? (
                <div className="home-markup">
                  <pre>
                    <code>
                      <span className="is-dim">{'// Styling a simple button\n'}</span>
                      {'<button '}
                      {typed.kind === 'short' ? 'class' : 'style'}
                      {'="'}
                      <span className={typed.kind === 'short' ? 'is-short' : 'is-long'}>{typed.text}</span>
                      {'">\n  White Plumeria button\n</button>'}
                    </code>
                  </pre>
                  <div>
                    <div className="is-dim">{'// Result'}</div>
                    <Button>Save</Button>
                  </div>
                </div>
              ) : (
                <div className="home-dash">
                  <div className="home-rail" role="toolbar" aria-label="Preview rail">
                    {['Overview', 'Activity', 'Messages', 'Account'].map((item, index) => (
                      <button
                        key={item}
                        type="button"
                        aria-label={item}
                        aria-pressed={index === 0}
                        onClick={() => setPanel(item === 'Overview' ? 'Dashboard' : item)}
                      >
                        <RailIcon index={index} />
                      </button>
                    ))}
                  </div>
                  <div className="home-menu">
                    <p>Workspace</p>
                    {['Dashboard', 'Customers', 'Invoices', 'Settings'].map((item) => (
                      <button key={item} type="button" aria-pressed={panel === item} onClick={() => setPanel(item)}>
                        {item}
                      </button>
                    ))}
                  </div>
                  <div className="home-panel">
                    <h2>{panel}</h2>
                    <div className="home-tabs" role="group" aria-label="Preview tabs">
                      {['Features', 'Links', 'Message'].map((item) => (
                        <button key={item} type="button" aria-pressed={tab === item} onClick={() => setTab(item)}>
                          {item}
                        </button>
                      ))}
                    </div>
                    <div className="home-tab-body">
                      {tab === 'Features' ? (
                        <>
                          <Switch label="Faster development" defaultChecked />
                          <Switch label="Cleaner HTML" defaultChecked />
                          <Switch label="Customizable" defaultChecked />
                          <Switch label="Themeable" defaultChecked />
                          <Switch label="Pure CSS" defaultChecked />
                          <div className="home-sizes" aria-label="Button sizes">
                            <Button size="sm">sm</Button>
                            <Button size="md">md</Button>
                            <Button size="lg">lg</Button>
                          </div>
                        </>
                      ) : null}
                      {tab === 'Links' ? (
                        <>
                          <p>{panel}</p>
                          {['Overview', 'Customers', 'Invoices'].map((item) => (
                            <button key={item} type="button" className="home-link" onClick={() => setPanel(item === 'Overview' ? 'Dashboard' : item)}>
                              {item}
                            </button>
                          ))}
                        </>
                      ) : null}
                      {tab === 'Message' ? (
                        <>
                          <p>A short note stays with the component, not in a second stylesheet.</p>
                          <Button size="sm">Send</Button>
                        </>
                      ) : null}
                    </div>
                    <div className="home-colors" aria-label="Semantic colors">
                      {swatches.map(([name, background]) => (
                        <div key={name}>
                          <i style={{ background }} />
                          <span>{name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="home-beats">
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
          <div className="home-beat home-beat-pin home-beat-long">
            <div className="home-pin-copy">
              <h2>
                <span>instead of writing</span>
                <br />
                <span className="home-danger">a long style</span>
                <br />
                attribute
              </h2>
              <p>For every element, every page, every project, again and again.</p>
            </div>
          </div>
          <div className="home-beat home-beat-pin">
            <div className="home-pin-copy">
              <h2>
                <span>use </span>
                <span className="home-ok">semantic</span>
                <br />
                class names
              </h2>
              <p>Shorter markup. The same names in CSS, React, Vue, Svelte, Angular, Solid, Preact, Qwik, Lit, Alpine, Marko, and Ember.</p>
            </div>
          </div>
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
        <div className="home-next" role="group" aria-label="Named components">
          <article>
            <div className="home-next-stage">
              <Button>Save</Button>
            </div>
            <code>wpl-btn wpl-btn-primary</code>
          </article>
          <article>
            <div className="home-next-stage">
              <Card title="Ledger" titleAs="h3" description="A titled surface." />
            </div>
            <code>wpl-card</code>
          </article>
          <article>
            <div className="home-next-stage">
              <Switch label="Enabled" defaultChecked />
            </div>
            <code>wpl-switch</code>
          </article>
        </div>
        <div className="home-ctas">
          <A className="home-cta home-cta-dark" href="/components" onNavigate={onNavigate}>
            See all components
          </A>
        </div>
      </section>

      <section className="home-section" aria-labelledby="scale-title">
        <h2 id="scale-title">
          Design system
          <br />
          <span>from xs to xl</span>
        </h2>
        <p>Height, radius, and space come from the same tokens. A control does not invent a second scale.</p>
        <div className="home-spec" aria-label="Token scale">
          <div className="home-spec-band">
            <h3>Size</h3>
            <div className="home-spec-track home-spec-sizes">
              {sizes.map((size) => (
                <Button key={size} size={size}>
                  {size}
                </Button>
              ))}
            </div>
          </div>
          <div className="home-spec-band">
            <h3>Radius</h3>
            <div className="home-spec-track">
              {radii.map(([name, radius]) => (
                <i key={name} className="home-spec-radius" style={{ borderRadius: radius }}>
                  {name}
                </i>
              ))}
            </div>
          </div>
          <div className="home-spec-band">
            <h3>Space</h3>
            <div className="home-spec-track">
              {spaces.map(([name, size]) => (
                <div key={name} className="home-spec-cell">
                  <i className="home-spec-space">
                    <b style={{ marginInlineEnd: `calc(${size} * 1.4)` }} />
                    <b />
                  </i>
                  <small>{name}</small>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="home-section" aria-labelledby="semantic-title">
        <h2 id="semantic-title">Semantic colors</h2>
        <p>The name sits on the color it describes. A theme change repaints the block, not the class.</p>
        <div className="home-semantic">
          <div>
            <h3>Roles</h3>
            <div className="home-semantic-roles">
              {semantic.map(([name, background, foreground]) => (
                <div key={name} className="home-semantic-swatch" style={{ background, color: foreground || 'var(--wpl-color-primary-fg)' }}>
                  {name}
                </div>
              ))}
            </div>
          </div>
          <div>
            <h3>Surfaces</h3>
            <div className="home-semantic-neutrals">
              {surfaces.map(([name, background, foreground]) => (
                <div key={name} className="home-semantic-swatch" style={{ background, color: foreground }}>
                  {name}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="home-section">
        <h2>
          No <span>more</span>
          <br />
          ugly <span>HTML</span>
        </h2>
        <p>The same form. The long version writes the color into the markup. The class version lets the theme paint it.</p>
        <div className="home-compare" aria-label="Markup comparison">
          <article className="home-compare-card">
            <header>
              <h3>Long style</h3>
              <p>The color is stuck in the markup. A theme change does not reach it.</p>
            </header>
            <div
              className="home-ugly"
              style={{ width: '20rem', maxWidth: '100%', borderRadius: 12, background: '#f6f1e8', padding: '1.3rem' }}
            >
              <input
                placeholder="Email"
                aria-label="Email"
                style={{ width: '100%', border: '1px solid #e0d5c6', borderRadius: 8, padding: '0.55rem 0.75rem' }}
              />
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.7rem' }}>
                <input type="checkbox" defaultChecked /> Submit to newsletter
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.7rem' }}>
                <input type="checkbox" /> Accept terms of use
              </label>
              <button
                type="button"
                style={{
                  marginTop: '0.7rem',
                  border: 0,
                  borderRadius: 8,
                  background: '#1c1915',
                  color: '#fff',
                  padding: '0.6rem 1rem',
                  fontWeight: 650,
                }}
              >
                Save
              </button>
            </div>
            <pre className="home-code">
              <code>{markAttr(verboseForm, 'style')}</code>
            </pre>
            <footer>
              <strong>{verboseForm.length}</strong>
              <span>characters</span>
            </footer>
          </article>
          <article className="home-compare-card">
            <header>
              <h3>White Plumeria</h3>
              <p>The class names the control. The selected theme paints it.</p>
            </header>
            <div className="home-form">
              <Input placeholder="Email" aria-label="Email" />
              <Checkbox label="Submit to newsletter" defaultChecked />
              <Checkbox label="Accept terms of use" />
              <Button>Save</Button>
            </div>
            <pre className="home-code">
              <code>{markAttr(cleanForm, 'class')}</code>
            </pre>
            <footer>
              <strong>{cleanForm.length}</strong>
              <span>{fewer}% shorter</span>
            </footer>
          </article>
        </div>
      </section>

      <section className="home-section" aria-labelledby="fewer-title">
        <h2 id="fewer-title">
          Fewer class names
          <br />
          <span>shorter markup</span>
        </h2>
        <p>These counts are this form, not a download chart.</p>
        <div className="home-charts">
          <article className="home-chart">
            <header>
              <h3>Style declarations</h3>
              <p>
                <strong>{declFewer}%</strong> fewer
              </p>
            </header>
            <div className="home-chart-cols">
              <div className="home-chart-col">
                <strong>{verboseDecls}</strong>
                <div className="home-chart-track" aria-hidden="true">
                  <i style={{ blockSize: '100%' }} />
                </div>
                <span>Long style</span>
              </div>
              <div className="home-chart-col is-short">
                <strong>{cleanTokens}</strong>
                <div className="home-chart-track" aria-hidden="true">
                  <i style={{ blockSize: `${declShare}%` }} />
                </div>
                <span>Class names</span>
              </div>
            </div>
          </article>
          <article className="home-chart" aria-label="Markup length">
            <header>
              <h3>
                HTML size <span>characters</span>
              </h3>
              <p>
                <strong>{fewer}%</strong> shorter
              </p>
            </header>
            <div className="home-chart-cols">
              <div className="home-chart-col">
                <strong>{verboseForm.length}</strong>
                <div className="home-chart-track" aria-hidden="true">
                  <i style={{ blockSize: '100%' }} />
                </div>
                <span>Long style</span>
              </div>
              <div className="home-chart-col is-short">
                <strong>{cleanForm.length}</strong>
                <div className="home-chart-track" aria-hidden="true">
                  <i style={{ blockSize: `${cleanShare}%` }} />
                </div>
                <span>Class markup</span>
              </div>
            </div>
          </article>
        </div>
      </section>

      <section className="home-section" aria-labelledby="customize-title">
        <h2 id="customize-title">
          Highly customizable
          <br />
          <span>without a second stylesheet</span>
        </h2>
        <p>Turn a class on. The same button changes, and the theme stays where it is.</p>
        <div className="home-morph">
          <div className="home-morph-stage">
            <Button variant={outline ? 'outline' : 'primary'} appearance={soft ? 'soft' : 'solid'} size={large ? 'lg' : 'md'} className={round ? 'wpl-btn-pill' : undefined}>
              Save
            </Button>
          </div>
          <pre className="home-code">
            <code>
              {'<button class="'}
              {customClass.split(' ').map((token, index) => {
                const added = token !== 'wpl-btn' && token !== 'wpl-btn-primary';
                return (
                  <span key={token}>
                    {index > 0 ? ' ' : null}
                    <span className={added ? 'is-added' : undefined}>{token}</span>
                  </span>
                );
              })}
              {'">Save</button>'}
            </code>
          </pre>
          <div className="home-morph-choices" role="group" aria-label="Button classes">
            {classChoices.map((choice) => (
              <button key={choice.key} type="button" className={choice.on ? 'home-morph-choice is-on' : 'home-morph-choice'} aria-pressed={choice.on} onClick={choice.toggle}>
                <strong>{choice.label}</strong>
                <code>{choice.token}</code>
                <span>{choice.note}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="home-section">
        <h2>
          Unlimited themes
          <br />
          <span>with zero extra classes</span>
        </h2>
        <p>Pick a theme. Each card uses the same button classes. Only the CSS variables change, and the rest of this page follows.</p>
        <ToggleGroup
          hideLabel
          label="Color scheme"
          value={preferences.appearance}
          onValueChange={(appearance) => {
            if (appearance === 'light' || appearance === 'dark' || appearance === 'system') {
              setPreferences({ appearance });
            }
          }}
          options={[
            { value: 'light', label: 'Light' },
            { value: 'dark', label: 'Dark' },
            { value: 'system', label: 'System' },
          ]}
        />
        <div className="home-theme-cards" role="group" aria-label="Themes">
          {themes.map((theme) => {
            const on = preferences.theme === theme.name;
            return (
              <button
                key={theme.name}
                type="button"
                className="home-theme-card"
                style={cssVars(theme, scheme)}
                aria-pressed={on}
                aria-label={on ? `${theme.label}, selected` : `Use ${theme.label}`}
                onClick={() => setPreferences({ theme: theme.name })}
              >
                <span className="home-theme-card-top">
                  <strong>{theme.label}</strong>
                  {on ? <em>Selected</em> : null}
                </span>
                <span className="home-theme-sample" aria-hidden="true">
                  <span className={buttonClassName({ size: 'sm' })}>Save</span>
                  <span className={buttonClassName({ size: 'sm', variant: 'outline' })}>Cancel</span>
                </span>
                <span className="home-theme-dots" aria-hidden="true">
                  <i style={{ background: 'var(--wpl-color-accent)' }} />
                  <i style={{ background: 'var(--wpl-color-success)' }} />
                  <i style={{ background: 'var(--wpl-color-warning)' }} />
                  <i style={{ background: 'var(--wpl-color-danger)' }} />
                </span>
              </button>
            );
          })}
        </div>
        <div className="home-ctas">
          <A className="home-cta" href="/themes" onNavigate={onNavigate}>
            Open theme lab
          </A>
        </div>
      </section>

      <section className="home-section" aria-labelledby="pure-title">
        <h2 id="pure-title">
          Pure CSS.
          <br />
          <span>Works everywhere.</span>
        </h2>
        <p>The stylesheet does not require a framework. These controls are native elements. Every adapter shares the class names.</p>
        <div className="home-pure">
          <form className="home-pure-form" onSubmit={(event) => event.preventDefault()}>
            <input className="wpl-input" placeholder="Email" aria-label="Email" />
            <label className="wpl-check">
              <input type="checkbox" defaultChecked /> Submit to newsletter
            </label>
            <button type="button" className="wpl-btn wpl-btn-primary">
              Save
            </button>
          </form>
          <pre className="home-code">
            <code>{markAttr(pureMarkup, 'class')}</code>
          </pre>
          <ul className="home-pure-names">
            {adapters.map(([name]) => (
              <li key={name}>{name}</li>
            ))}
          </ul>
        </div>
        <div className="home-ctas">
          <a className="home-cta" href="#frameworks">
            See the adapters
          </a>
        </div>
      </section>

      <section className="home-section" aria-labelledby="catalog-title">
        <h2 id="catalog-title">
          {catalog.length} components.
          <br />
          <span>One catalog.</span>
        </h2>
        <p>Every name below is a real component. The groups are the catalog categories, not a sample.</p>
        <div className="home-catalog">
          {catalogGroups.map((group) => (
            <div key={group.category} className="home-catalog-group">
              <h3>
                {group.label}
                <span>{group.items.length}</span>
              </h3>
              <ul>
                {group.items.map((item) => (
                  <li key={item.slug}>
                    <A href={`/components/${item.slug}`} onNavigate={onNavigate}>
                      {item.name}
                    </A>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="home-ctas">
          <A className="home-cta" href="/components" onNavigate={onNavigate}>
            Open the catalog
          </A>
        </div>
      </section>

      <section className="home-section home-adapters" id="frameworks" aria-labelledby="frameworks-title">
        <h2 id="frameworks-title">
          Use the framework
          <br />
          <span>you already have</span>
        </h2>
        <p>Twelve ways in. One catalog, one theme, one keyboard model. Pick the package that matches the app, not a second design system.</p>
        <div className="home-shared">
          <button type="button" className="wpl-btn wpl-btn-primary">
            Save
          </button>
          <code>wpl-btn wpl-btn-primary</code>
          <p>That class is the control. The packages below only change the language around it.</p>
        </div>
        <div className="home-principles">
          {principles.map(([title, body]) => (
            <div key={title}>
              <strong>{title}</strong>
              <p>{body}</p>
            </div>
          ))}
        </div>
        <ul className="home-adapter-grid">
          {adapters.map(([name, pkg, role, detail]) => (
            <li key={name} className="home-adapter">
              <small>{pkg}</small>
              <strong>{name}</strong>
              <em>{role}</em>
              <p>{detail}</p>
            </li>
          ))}
        </ul>
        <div className="home-ctas">
          <A className="home-cta home-cta-dark" href="/playground" onNavigate={onNavigate}>
            Open the playground
          </A>
          <A className="home-cta" href="/install" onNavigate={onNavigate}>
            Install notes
          </A>
        </div>
      </section>

      <HomeFooter onNavigate={onNavigate} />
    </div>
  );
}

const footGroups = [
  {
    label: 'Product',
    links: [
      { href: '/components', label: 'Components' },
      { href: '/blocks', label: 'Blocks' },
      { href: '/playground', label: 'Playground' },
      { href: '/ai', label: 'AI studio' },
      { href: '/themes', label: 'Theme lab' },
    ],
  },
  {
    label: 'Learn',
    links: [
      { href: '/start', label: 'Quick start' },
      { href: '/install', label: 'Install' },
      { href: '/servers', label: 'Server hosts' },
      { href: '/direction', label: 'Direction' },
      { href: '/accessibility', label: 'Accessibility' },
    ],
  },
  {
    label: 'Project',
    links: [
      { href: brand.repository, label: 'Repository', external: true },
      { href: brand.bugs, label: 'Issues', external: true },
      { href: '/changelog', label: 'Changelog' },
      { href: '/security', label: 'Security' },
    ],
  },
] as const;

function plainAddress(url: string) {
  return url.replace(/^https?:\/\//, '');
}

function HomeFooter({ onNavigate }: { onNavigate: (href: string) => void }) {
  const author = 'https://github.com/hoseinsedaqat';
  return (
    <footer className="home-foot">
      <div className="home-foot-inner">
        <div className="home-foot-top">
          <div className="home-foot-brand">
            <Mark />
            <div>
              <strong>{brand.productName}</strong>
              <p>
                {brand.version} ·{' '}
                <a href={`${brand.repository}/blob/${brand.defaultBranch}/LICENSE`} rel="noreferrer">
                  {brand.license}
                </a>
                . Not published to npm yet.
              </p>
            </div>
          </div>
          <div className="home-foot-nav">
            {footGroups.map((group) => (
              <nav key={group.label} aria-label={group.label}>
                <h2>{group.label}</h2>
                {group.links.map((link) =>
                  'external' in link && link.external ? (
                    <a key={link.href} href={link.href} rel="noreferrer" target="_blank">
                      {link.label}
                    </a>
                  ) : (
                    <A key={link.href} href={link.href} onNavigate={onNavigate}>
                      {link.label}
                    </A>
                  ),
                )}
              </nav>
            ))}
          </div>
        </div>
        <div className="home-foot-base">
          <p>
            <span>GitHub</span>
            <a className="home-foot-address" href={author} rel="noreferrer" target="_blank">
              {plainAddress(author)}
            </a>
          </p>
          <p>
            <span>Repository</span>
            <a className="home-foot-address" href={brand.repository} rel="noreferrer" target="_blank">
              {plainAddress(brand.repository)}
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}

function sliceByProgress(progress: number, longText: string, shortText: string) {
  if (progress < 40) {
    const t = Math.min(1, Math.max(0, (progress - 18) / 18));
    return { text: longText.slice(0, Math.max(8, Math.floor(t * longText.length))), kind: 'long' as const };
  }
  if (progress < 48) {
    const t = (progress - 40) / 8;
    return { text: longText.slice(0, Math.floor((1 - t) * longText.length)), kind: 'long' as const };
  }
  const t = Math.min(1, (progress - 48) / 6);
  return { text: shortText.slice(0, Math.max(1, Math.floor(t * shortText.length))), kind: 'short' as const };
}

function lerp(progress: number, from: number, to: number, start: number, end: number) {
  const t = Math.min(1, Math.max(0, (progress - from) / (to - from)));
  return start + (end - start) * t;
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

function RailIcon({ index }: { index: number }) {
  const paths = [
    'M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z',
    'M4 16l5-7 4 4 7-9',
    'M4 6h16v10H8l-4 3z',
    'M12 12a3.2 3.2 0 1 0 0-6.4 3.2 3.2 0 0 0 0 6.4zM6 19c1.1-2.2 3.2-3.3 6-3.3s4.9 1.1 6 3.3',
  ];
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
      <path d={paths[index] ?? ''} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}
