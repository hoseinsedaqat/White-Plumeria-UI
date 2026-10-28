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
    <button type="button" className="wpl-btn wpl-btn-ghost wpl-btn-sm" onClick={() => void copy()}>
      {label}
    </button>
  );
}

export function CodeBlock({ code }: { code: string }) {
  return (
    <div className="docs-code-wrap">
      <CopyButton text={code} />
      <pre className="docs-code">
        <code>{code}</code>
      </pre>
    </div>
  );
}
