import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { Button, Card, Dialog, Input, WhitePlumeriaProvider } from '@white-plumeria/angular';

@Component({
  selector: 'wpl-example-app',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [WhitePlumeriaProvider, Card, Button, Input, Dialog],
  template: `
    <wpl-provider>
      <main class="wpl-root wpl-reset" style="padding: 2rem; display: grid; gap: 1rem; max-width: 40rem">
        <wpl-card title="Angular example" description="These are the real components, not a mock.">
          <div style="display: grid; gap: 0.75rem">
            <label class="wpl-label" for="note">Note</label>
            <input wplInput id="note" name="note" placeholder="What changed?" (input)="onNote($event)" />
            <div style="display: flex; gap: 0.5rem">
              <button wplButton (click)="save()">Save changes</button>
              <button wplButton variant="outline" (click)="open.set(true)">Review</button>
            </div>
            <p>{{ status() }}</p>
          </div>
        </wpl-card>
        <wpl-dialog title="Review note" [open]="open()" (openChange)="open.set($event)">
          <p>{{ note() || 'No note yet.' }}</p>
        </wpl-dialog>
      </main>
    </wpl-provider>
  `,
})
export class App {
  readonly note = signal('');
  readonly status = signal('Ready');
  readonly open = signal(false);

  onNote(event: Event) {
    const target = event.target;
    if (!(target instanceof HTMLInputElement)) return;
    this.note.set(target.value);
  }

  save() {
    this.status.set(this.note() ? `Saved: ${this.note()}` : 'Saved');
    document.title = 'Saved · White Plumeria';
  }
}
