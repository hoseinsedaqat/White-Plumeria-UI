# @white-plumeria/svelte

Svelte 5 components for White Plumeria. Import the CSS once from `@white-plumeria/styles`.

```svelte
<script lang="ts">
  import { Button, WhitePlumeriaProvider } from "@white-plumeria/svelte";
  import "@white-plumeria/styles";
</script>

<WhitePlumeriaProvider>
  <Button variant="primary">Save changes</Button>
</WhitePlumeriaProvider>
```

Values use `$bindable` (`bind:value`, `bind:checked`, `bind:open`). This package does not upload files or depend on Tailwind.
