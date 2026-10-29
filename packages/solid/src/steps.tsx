import { cx } from '@white-plumeria/core';

export interface StepItem {
  label: string;
  description?: string;
}

export function Steps(props: { label: string; steps: StepItem[]; current: number; orientation?: 'horizontal' | 'vertical' }) {
  const orientation = () => props.orientation ?? 'horizontal';
  return (
    <ol class={cx('wpl-steps', orientation() === 'vertical' && 'wpl-steps-vertical')} aria-label={props.label}>
      {props.steps.map((step, index) => {
        const state = index < props.current ? 'complete' : index === props.current ? 'current' : 'upcoming';
        return (
          <li class={cx('wpl-step', `wpl-step-${state}`)} aria-current={state === 'current' ? 'step' : undefined}>
            <span class="wpl-step-index" aria-hidden="true">
              {index + 1}
            </span>
            <span>
              <span class="wpl-step-label">{step.label}</span>
              {step.description ? <span class="wpl-step-description">{step.description}</span> : null}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
