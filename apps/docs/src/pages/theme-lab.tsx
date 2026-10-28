import { generateTheme, themeAsConfig } from '@white-plumeria/ai';
import { Button, useWhitePlumeria } from '@white-plumeria/react';
import { useMemo, useState, type CSSProperties } from 'react';
import { CodeBlock } from '../copy.tsx';

export function ThemeLabPage() {
  const { locale } = useWhitePlumeria();
  const [description, setDescription] = useState('A formal high-contrast finance dashboard');
  const [draft, setDraft] = useState(description);
  const theme = useMemo(() => generateTheme(draft), [draft]);

  return (
    <article>
      <p className="docs-kicker">Theme lab</p>
      <h1 className="docs-display" style={{ fontSize: 'clamp(2.4rem, 5vw, 4rem)' }}>
        {locale === 'fa' ? 'توکن، با گزارش کنتراست' : 'Tokens, with a contrast report'}
      </h1>
      <p className="docs-lede">
        {locale === 'fa'
          ? 'خروجی متغیرهای CSS همین کتابخانه است. اگر جفتی به AA نرسد، در گزارش می‌ماند و پنهان نمی‌شود.'
          : 'Output uses this library’s CSS variables. Pairs that miss AA stay in the report.'}
      </p>
      <label className="wpl-label" htmlFor="theme-prompt">
        Description
      </label>
      <input id="theme-prompt" className="wpl-input" value={description} onChange={(event) => setDescription(event.currentTarget.value)} />
      <div className="wpl-cluster" style={{ marginBlock: '0.8rem' }}>
        <Button onClick={() => setDraft(description)}>{locale === 'fa' ? 'بساز' : 'Generate'}</Button>
      </div>
      <div className="docs-stage" style={inlineStyle(theme.css)}>
        <p className="docs-kicker">{theme.name}</p>
        <h2 className="docs-display" style={{ fontSize: '2rem' }}>
          {theme.description}
        </h2>
        <p>Sample text on the generated surface.</p>
        <button type="button" className="wpl-btn wpl-btn-primary">
          Primary action
        </button>
      </div>
      <h2>Contrast</h2>
      <table className="docs-table">
        <thead>
          <tr>
            <th>Pair</th>
            <th>Ratio</th>
            <th>AA</th>
          </tr>
        </thead>
        <tbody>
          {theme.checks.map((check) => (
            <tr key={check.pair}>
              <td>{check.pair}</td>
              <td>{check.ratio?.toFixed(2) ?? 'n/a'}</td>
              <td>{check.pass ? 'pass' : 'fail'}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {theme.adjustments.map((item) => (
        <p key={item}>{item}</p>
      ))}
      <h2>CSS variables</h2>
      <CodeBlock code={theme.css} />
      <h2>Config</h2>
      <CodeBlock code={themeAsConfig(theme)} />
    </article>
  );
}

function inlineStyle(css: string): CSSProperties {
  const style: Record<string, string> = {};
  for (const match of css.matchAll(/(--wpl-color-[\w-]+):\s*([^;]+);/g)) {
    const name = match[1];
    const value = match[2];
    if (name && value) style[name] = value.trim();
  }
  return style;
}
