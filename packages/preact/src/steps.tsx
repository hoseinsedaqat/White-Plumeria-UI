import { cx, stepIndex, stepState } from '@white-plumeria/core';
import { useState } from 'preact/hooks';
import { Icon } from './icon.tsx';
import { useWhitePlumeria } from './provider.tsx';

export interface StepItem {
  id: string;
  title: string;
  description?: string;
}

export function Steps({
  label,
  items,
  value,
  defaultValue,
  onValueChange,
  orientation = 'horizontal',
  linear = true,
  className,
}: {
  label: string;
  items: StepItem[];
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  orientation?: 'horizontal' | 'vertical';
  linear?: boolean;
  className?: string;
}) {
  const { t } = useWhitePlumeria();
  const [internal, setInternal] = useState(defaultValue ?? items[0]?.id ?? '');
  const selected = value ?? internal;
  const current = stepIndex(items, selected);
  const interactive = Boolean(onValueChange) || value === undefined;

  function select(id: string, index: number) {
    if (linear && index > current) return;
    if (value === undefined) setInternal(id);
    onValueChange?.(id);
  }

  return (
    <ol
      className={cx('wpl-steps', orientation === 'vertical' && 'wpl-steps-vertical', className)}
      aria-label={label || t('steps')}
    >
      {items.map((item, index) => {
        const state = stepState(index, current);
        const blocked = linear && index > current;
        const body = (
          <>
            <span className="wpl-step-marker" aria-hidden="true">
              {state === 'complete' ? <Icon name="check" /> : index + 1}
            </span>
            <span>
              <span className="wpl-step-title">{item.title}</span>
              {item.description ? <span className="wpl-step-desc">{item.description}</span> : null}
            </span>
          </>
        );
        return (
          <li key={item.id} className="wpl-step" data-state={state}>
            {interactive ? (
              <button
                type="button"
                className="wpl-step-trigger"
                aria-current={state === 'current' ? 'step' : undefined}
                disabled={blocked || undefined}
                onClick={() => select(item.id, index)}
              >
                {body}
              </button>
            ) : (
              <div
                className="wpl-step-trigger"
                aria-current={state === 'current' ? 'step' : undefined}
              >
                {body}
              </div>
            )}
          </li>
        );
      })}
    </ol>
  );
}
