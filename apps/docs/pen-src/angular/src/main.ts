import '@white-plumeria/styles';
import { ChangeDetectionStrategy, Component, provideZonelessChangeDetection, signal } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { Button, Card, WhitePlumeriaProvider } from '@white-plumeria/angular';

@Component({
  selector: 'wpl-pen',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [WhitePlumeriaProvider, Card, Button],
  template: `
    <wpl-provider>
      <main class="wpl-root wpl-reset">
        <wpl-card title="Angular" description="bootstrapApplication owns this document.">
          <button wplButton (click)="save()">Save changes</button>
          <p id="note">{{ saved() }}</p>
        </wpl-card>
      </main>
    </wpl-provider>
  `,
})
export class Pen {
  readonly saved = signal('Ready in this Angular document.');

  save() {
    this.saved.set('Saved in this Angular document.');
  }
}

bootstrapApplication(Pen, {
  providers: [provideZonelessChangeDetection()],
}).catch((error: unknown) => {
  console.error(error);
});
