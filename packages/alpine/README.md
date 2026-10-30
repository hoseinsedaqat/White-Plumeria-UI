# @white-plumeria/alpine

Alpine.js 3.17 components for White Plumeria. This is the native `Alpine.data` API, not a Vue wrapper and not a wrapper around `@white-plumeria/elements`.

```ts
import Alpine from "alpinejs";
import { whitePlumeria } from "@white-plumeria/alpine";
import "@white-plumeria/styles";

Alpine.plugin(whitePlumeria);
Alpine.start();
```

```html
<div x-data="WhitePlumeriaProvider({ persist: false })">
  <div x-data="Button({ variant: 'primary', label: 'Save changes' })"></div>
</div>
```

`whitePlumeria(Alpine)` registers one factory per catalog component. Calling it again does nothing. A factory renders into its host during `init()` and dispatches `wpl-click`, `wpl-change`, `wpl-select`, and `wpl-close` from that host. `pushToast` throws `WhitePlumeriaProvider is required to push a toast.` when the node is outside a provider.

`alpinejs` is a peer dependency. Pair the components with `@white-plumeria/styles`. Server rendering is not claimed.
