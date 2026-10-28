# @white-plumeria/elements

Light-DOM custom elements for a documented subset of White Plumeria. There is no Shadow DOM, so page CSS can still reach the controls and the existing `wpl-*` classes apply.

```ts
import { defineWhitePlumeriaElements } from "@white-plumeria/elements";
import "@white-plumeria/styles";

defineWhitePlumeriaElements();
```

```html
<wpl-button variant="primary">Save changes</wpl-button>
<wpl-switch label="Reduced motion"></wpl-switch>
<wpl-tabs>
  <div data-tab="overview" data-label="Overview">Balances</div>
</wpl-tabs>
<wpl-accordion>
  <div data-title="Fees">No monthly fee.</div>
</wpl-accordion>
```

`defineWhitePlumeriaElements()` does nothing if a tag is already defined. Calling it twice is safe.

Limits:

- These elements upgrade in the browser. Server-rendered HTML is not hydrated by this package, and `showModal()` is not called during SSR.
- Do not put a second `<button>` inside `<wpl-button>`; the element moves its light-DOM children into a native button.
- Complex widgets such as DataTable, Combobox, and DatePicker are not custom elements. Use a framework adapter.
