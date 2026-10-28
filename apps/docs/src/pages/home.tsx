import { brand, catalog } from '@white-plumeria/core';
import { themes } from '@white-plumeria/tokens';
import {
  Alert,
  Badge,
  Button,
  Card,
  Input,
  Mark,
  StatCard,
  Switch,
  useWhitePlumeria,
} from '@white-plumeria/react';
import { useState } from 'react';
import { CodeBlock } from '../copy.tsx';
import { copy } from '../i18n.ts';
import { A } from '../router.tsx';

const swatch: Record<string, string> = {
  ivory: '#E4B15A',
  ink: '#1A1916',
  saffron: '#E2A01A',
  lagoon: '#0E4F4C',
  blush: '#C46B5A',
};

export function HomePage({ onNavigate }: { onNavigate: (href: string) => void }) {
  const { preferences, setPreferences, locale } = useWhitePlumeria();
  const t = copy[locale];
  const [variant, setVariant] = useState<'primary' | 'secondary' | 'outline' | 'danger'>('primary');
  const [loading, setLoading] = useState(false);
  const reactSample = `import { Button, Card } from "@white-plumeria/react";
import "@white-plumeria/styles";

export function Example() {
  return (
    <Card title="Analytics" description="Overview of recent activity">
      <Button variant="primary">Save changes</Button>
    </Card>
  );
}`;

  return (
    <>
      <section className="docs-hero">
        <div>
          <p className="docs-kicker">{t.kicker}</p>
          <h1 className="docs-display">{t.hero}</h1>
          <p className="docs-lede">{t.lede}</p>
          <div className="wpl-cluster" style={{ marginBlockStart: '1.25rem' }}>
            <Button onClick={() => onNavigate('/start')}>{t.getStarted}</Button>
            <Button variant="secondary" onClick={() => onNavigate('/playground')}>
              {t.openPlayground}
            </Button>
            <a className="wpl-link" href={brand.repository}>
              {t.github}
            </a>
          </div>
          <div className="docs-facts" aria-label={t.facts}>
            <div>
              <strong>{catalog.length}</strong>
              <span>{t.factComponents}</span>
            </div>
            <div>
              <strong>{themes.length}</strong>
              <span>{t.factThemes}</span>
            </div>
            <div>
              <strong>3</strong>
              <span>{t.factFrameworks}</span>
            </div>
          </div>
          <p className="docs-note">{t.notStars}</p>
        </div>
        <div className="docs-stage">
          <div className="docs-stage-bar">
            <span>{t.sample}</span>
            <div className="docs-swatches" role="group" aria-label={t.themes}>
              {themes.map((theme) => (
                <button
                  key={theme.name}
                  type="button"
                  className="docs-swatch"
                  style={{ background: swatch[theme.name] }}
                  aria-label={locale === 'fa' ? theme.labelFa : theme.label}
                  aria-pressed={preferences.theme === theme.name}
                  onClick={() => setPreferences({ theme: theme.name })}
                />
              ))}
            </div>
          </div>
          <Card
            title={locale === 'fa' ? 'دفتر نمونه' : 'Sample ledger'}
            description={locale === 'fa' ? 'دادهٔ نمونه — موجودی واقعی نیست' : 'Sample data — not a live balance'}
            footer={
              <Button variant={variant} loading={loading} onClick={() => setLoading(true)}>
                {locale === 'fa' ? 'ذخیره' : 'Save changes'}
              </Button>
            }
          >
            <div className="wpl-cluster">
              <Badge variant="warning">{locale === 'fa' ? 'نمونه' : 'Sample'}</Badge>
              <Badge variant="success">{locale === 'fa' ? 'پرداخت‌شده' : 'Paid'}</Badge>
            </div>
            <StatCard label={locale === 'fa' ? 'فاکتور باز' : 'Open invoices'} value={locale === 'fa' ? '۱۲' : '12'} hint={locale === 'fa' ? 'دادهٔ نمونه' : 'Sample data'} />
            <Input placeholder={locale === 'fa' ? 'یادداشت' : 'Note for the ledger'} />
            <Switch
              label={locale === 'fa' ? 'حالت بارگذاری' : 'Loading state'}
              checked={loading}
              onCheckedChange={setLoading}
            />
            <div className="wpl-cluster">
              {(['primary', 'secondary', 'outline', 'danger'] as const).map((item) => (
                <Button key={item} size="sm" variant={variant === item ? 'primary' : 'ghost'} onClick={() => setVariant(item)}>
                  {item}
                </Button>
              ))}
            </div>
          </Card>
        </div>
      </section>

      <section className="docs-section">
        <h2>{t.ways}</h2>
        <div className="docs-grid">
          <article className="wpl-card">
            <h3 className="wpl-card-title">CSS</h3>
            <p className="wpl-card-description">Class names, no framework.</p>
            <CodeBlock code={`<button class="wpl-btn wpl-btn-primary">\n  Save changes\n</button>`} />
          </article>
          <article className="wpl-card">
            <h3 className="wpl-card-title">React</h3>
            <p className="wpl-card-description">Vue and Svelte packages match the names.</p>
            <CodeBlock code={reactSample} />
          </article>
          <article className="wpl-card">
            <h3 className="wpl-card-title">Elements</h3>
            <p className="wpl-card-description">Custom elements for the documented subset.</p>
            <CodeBlock code={`import { defineWhitePlumeriaElements } from "@white-plumeria/elements";\n\ndefineWhitePlumeriaElements();`} />
          </article>
        </div>
      </section>

      <section className="docs-section">
        <h2>{t.catalog}</h2>
        <div className="docs-grid">
          {catalog.slice(0, 9).map((item) => (
            <article key={item.slug} className="docs-card-link">
              <A href={`/components/${item.slug}`} onNavigate={onNavigate}>
                <strong>{item.name}</strong>
              </A>
              <span>{locale === 'fa' ? item.summaryFa : item.summary}</span>
            </article>
          ))}
        </div>
        <p>
          <A href="/start" onNavigate={onNavigate}>
            {t.docs}
          </A>
        </p>
      </section>

      <section className="docs-section docs-grid">
        <article>
          <h2>{t.rtlTitle}</h2>
          <p className="docs-lede">{t.rtlBody}</p>
          <div dir="rtl" lang="fa" className="wpl-card">
            <h3 className="wpl-card-title">فرم نمونه</h3>
            <p className="wpl-card-description">متن فارسی با جهت راست‌به‌چپ، نه وارونه‌سازی کل صفحه.</p>
            <Input placeholder="نام دفتر" />
            <div className="wpl-cluster">
              <Button>ذخیره</Button>
              <Badge>نمونه</Badge>
            </div>
          </div>
        </article>
        <article>
          <h2>{t.aiTitle}</h2>
          <p className="docs-lede">{t.aiBody}</p>
          <Alert variant="info" title={locale === 'fa' ? 'بدون کلید' : 'No key'}>
            {locale === 'fa'
              ? 'نسخهٔ مستندات فقط برنامه‌ریز محلی را اجرا می‌کند.'
              : 'The docs site runs only the local planner. No model key is bundled.'}
          </Alert>
          <div className="wpl-cluster" style={{ marginBlockStart: '1rem' }}>
            <Button onClick={() => onNavigate('/ai')}>{t.ai}</Button>
            <Mark />
          </div>
        </article>
      </section>
    </>
  );
}
