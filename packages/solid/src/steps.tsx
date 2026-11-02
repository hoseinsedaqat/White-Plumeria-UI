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
          <li class="wpl-step" data-state={state}>
            <div class="wpl-step-trigger" aria-current={state === 'current' ? 'step' : undefined}>
              <span class="wpl-step-marker" aria-hidden="true">
                {index + 1}
              </span>
              <span>
                <span class="wpl-step-title">{step.label}</span>
                {step.description ? <span class="wpl-step-desc">{step.description}</span> : null}
              </span>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
