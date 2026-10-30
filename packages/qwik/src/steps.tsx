import { cx, stepIndex, stepState } from '@white-plumeria/core';
import { component$, useSignal, type QRL } from '@qwik.dev/core';
import { Icon } from './icon';
import { useWhitePlumeria } from './provider';

export interface StepItem {
  id: string;
  title: string;
  description?: string;
}

export const Steps = component$<{
  label: string;
  items: StepItem[];
  value?: string;
  defaultValue?: string;
  orientation?: 'horizontal' | 'vertical';
  linear?: boolean;
  class?: string;
  onValueChange$?: QRL<(value: string) => void>;
}>((props) => {
  const wpl = useWhitePlumeria();
  const internal = useSignal(props.defaultValue ?? props.items[0]?.id ?? '');
  const selected = props.value ?? internal.value;
  const current = stepIndex(props.items, selected);
  const interactive = Boolean(props.onValueChange$) || props.value === undefined;
  const linear = props.linear ?? true;
  return (
    <ol class={cx('wpl-steps', props.orientation === 'vertical' && 'wpl-steps-vertical', props.class)} aria-label={props.label || wpl.t('steps')}>
      {props.items.map((item, index) => {
        const state = stepState(index, current);
        const blocked = linear && index > current;
        const body = (
          <>
            <span class="wpl-step-marker" aria-hidden="true">
              {state === 'complete' ? <Icon name="check" /> : index + 1}
            </span>
            <span>
              <span class="wpl-step-title">{item.title}</span>
              {item.description ? <span class="wpl-step-desc">{item.description}</span> : null}
            </span>
          </>
        );
        return (
          <li key={item.id} class="wpl-step" data-state={state}>
            {interactive ? (
              <button
                type="button"
                class="wpl-step-trigger"
                aria-current={state === 'current' ? 'step' : undefined}
                disabled={blocked || undefined}
                onClick$={() => {
                  if (blocked) return;
                  if (props.value === undefined) internal.value = item.id;
                  void props.onValueChange$?.(item.id);
                }}
              >
                {body}
              </button>
            ) : (
              <div class="wpl-step-trigger" aria-current={state === 'current' ? 'step' : undefined}>{body}</div>
            )}
          </li>
        );
      })}
    </ol>
  );
});
