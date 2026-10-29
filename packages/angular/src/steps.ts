import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  booleanAttribute,
  computed,
  input,
  output,
  signal,
} from '@angular/core';
import { cx, stepIndex, stepState } from '@white-plumeria/core';
import { Icon } from './icon';
import { injectWhitePlumeria } from './provider';

export interface StepItem {
  id: string;
  title: string;
  description?: string;
}

@Component({
  selector: 'wpl-steps',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  imports: [Icon],
  template: `
    <ol [class]="classes()" [attr.aria-label]="accessibleLabel()">
      @for (item of items(); track item.id; let index = $index) {
        <li class="wpl-step" [attr.data-state]="state(index)">
          <button
            type="button"
            class="wpl-step-trigger"
            [attr.aria-current]="state(index) === 'current' ? 'step' : null"
            [disabled]="blocked(index) ? true : null"
            (click)="select(item.id, index)"
          >
            <span class="wpl-step-marker" aria-hidden="true">
              @if (state(index) === 'complete') {
                <wpl-icon name="check" />
              } @else {
                {{ index + 1 }}
              }
            </span>
            <span>
              <span class="wpl-step-title">{{ item.title }}</span>
              @if (item.description) {
                <span class="wpl-step-desc">{{ item.description }}</span>
              }
            </span>
          </button>
        </li>
      }
    </ol>
  `,
})
export class Steps {
  readonly label = input.required<string>();
  readonly items = input.required<StepItem[]>();
  readonly value = input<string>();
  readonly defaultValue = input<string>();
  readonly orientation = input<'horizontal' | 'vertical'>('horizontal');
  readonly linear = input(true, { transform: booleanAttribute });
  readonly className = input('', { alias: 'class' });
  readonly valueChange = output<string>();
  private readonly wpl = injectWhitePlumeria();
  private readonly internal = signal<string | null>(null);
  readonly classes = computed(() => cx('wpl-steps', this.orientation() === 'vertical' && 'wpl-steps-vertical', this.className()));
  readonly accessibleLabel = computed(() => this.label() || this.wpl.t('steps'));

  selected(): string {
    return this.value() ?? this.internal() ?? this.defaultValue() ?? this.items()[0]?.id ?? '';
  }

  currentIndex(): number {
    return stepIndex(this.items(), this.selected());
  }

  state(index: number) {
    return stepState(index, this.currentIndex());
  }

  blocked(index: number): boolean {
    return this.linear() && index > this.currentIndex();
  }

  select(id: string, index: number) {
    if (this.blocked(index)) return;
    if (this.value() === undefined) this.internal.set(id);
    this.valueChange.emit(id);
  }
}
