import { ChangeDetectionStrategy, Component, ViewEncapsulation, input } from '@angular/core';

@Component({
  selector: 'wpl-kbd',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  template: `
    @if (keys().length) {
      <span class="wpl-kbd-group">
        @for (key of keys(); track $index) {
          <span class="wpl-kbd-group">
            @if ($index > 0) {
              <span aria-hidden="true">+</span>
            }
            <kbd class="wpl-kbd">{{ key }}</kbd>
          </span>
        }
      </span>
    } @else {
      <kbd class="wpl-kbd"><ng-content /></kbd>
    }
  `,
})
export class Kbd {
  readonly keys = input<string[]>([]);
}
