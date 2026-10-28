import { useState } from 'react';
import { useWhitePlumeria } from '@white-plumeria/react';

export function CopyButton({ text }: { text: string }) {
  const { t } = useWhitePlumeria();
  const [state, setState] = useState<'idle' | 'copied' | 'failed'>('idle');

  async function copy() {
    try {
      if (!navigator.clipboard) throw new Error('Clipboard API unavailable');
      await navigator.clipboard.writeText(text);
      setState('copied');
    } catch {
      setState('failed');
    }
    window.setTimeout(() => setState('idle'), 1600);
  }

  const label = state === 'copied' ? t('copied') : state === 'failed' ? t('copyFailed') : t('copy');
  return (
    <button type="button" className="wpl-btn wpl-btn-secondary wpl-btn-sm" onClick={() => void copy()}>
      {label}
    </button>
  );
}

export function CodeBlock({ code, label = 'Code' }: { code: string; label?: string }) {
  return (
    <div className="docs-code-wrap">
      <div className="docs-code-bar">
        <span>{label}</span>
        <CopyButton text={code} />
      </div>
      <pre className="docs-code">
        <code>{code}</code>
      </pre>
    </div>
  );
}
