import { Component } from '@angular/core';
import { Button, Card, WhitePlumeriaProvider } from '@white-plumeria/angular';

@Component({
  selector: 'app-home',
  imports: [WhitePlumeriaProvider, Card, Button],
  template: `
    <wpl-provider>
      <main class="wpl-root wpl-reset" data-wpl-host="analog" style="padding: 1.25rem">
        <wpl-card title="Analog" description="Analog exported this page. The button is the Angular component.">
          <button wplButton>Save changes</button>
        </wpl-card>
      </main>
    </wpl-provider>
  `,
})
export default class HomePage {}
