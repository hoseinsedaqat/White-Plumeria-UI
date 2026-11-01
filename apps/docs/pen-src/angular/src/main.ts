import '@white-plumeria/styles';
import {
  ChangeDetectionStrategy,
  Component,
  provideZonelessChangeDetection,
  signal,
} from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import {
  Alert,
  Badge,
  Button,
  Card,
  Input,
  Switch,
  WhitePlumeriaProvider,
} from '@white-plumeria/angular';
import { readPenComponent } from '../../component.ts';

@Component({
  selector: 'wpl-pen',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [WhitePlumeriaProvider, Card, Button, Badge, Alert, Switch, Input],
  template: `
    <wpl-provider>
      <main class="wpl-root wpl-reset">
        @if (component === 'badge') {
          <wpl-badge variant="success">Paid</wpl-badge>
        } @else if (component === 'alert') {
          <wpl-alert variant="info" title="Info">Sample notice.</wpl-alert>
        } @else if (component === 'card') {
          <wpl-card title="Ledger" description="A titled surface." />
        } @else if (component === 'switch') {
          <wpl-switch label="Enabled" [defaultChecked]="true" />
        } @else if (component === 'input') {
          <input wplInput placeholder="ada@example.com" aria-label="Email" />
        } @else {
          <wpl-card title="Angular" description="bootstrapApplication owns this document.">
            <button wplButton (click)="save()">Save changes</button>
            <p id="note">{{ saved() }}</p>
          </wpl-card>
        }
      </main>
    </wpl-provider>
  `,
})
export class Pen {
  readonly component = readPenComponent();
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
