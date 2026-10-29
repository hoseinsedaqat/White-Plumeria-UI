# @white-plumeria/angular

Angular 22 components for White Plumeria. Same names as the React, Vue, and Svelte adapters. Templates use the Angular idiom: attribute components for native controls, element components for composites.

```ts
import { Button, Card, WhitePlumeriaProvider } from "@white-plumeria/angular";
import "@white-plumeria/styles";

@Component({
  selector: "app-example",
  imports: [WhitePlumeriaProvider, Card, Button],
  template: `
    <wpl-provider>
      <wpl-card title="Analytics" description="Overview of recent activity">
        <button wplButton variant="primary">Save changes</button>
      </wpl-card>
    </wpl-provider>
  `,
})
export class Example {}
```

`Button` is `button[wplButton]`, so the host stays a real button. That keeps form submit and the joined button-group CSS working. Import each component you use. `@white-plumeria/styles` is an optional peer.

Do not define `@white-plumeria/elements` in the same page. Those custom element tags overlap composite selectors such as `wpl-card` and `wpl-dialog`.

The package does not read `window` or `document` at import time. Dialogs call `showModal()` after render. Toasts and theme persistence need a browser and `WhitePlumeriaProvider`.

Peer dependency: `@angular/core` `^22`. Works with zoneless change detection. `zone.js` is not imported by this package.

The runnable example is `apps/example-angular`. Build this package first, then run `pnpm --filter @white-plumeria/example-angular dev`. It listens on port 5177.

Cell accessors, tab panels, and accordion content are strings, matching the Vue adapter. One submenu level. Typeahead is not implemented.
