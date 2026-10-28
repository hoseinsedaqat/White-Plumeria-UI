# @white-plumeria/vue

Vue 3 components for White Plumeria. Import the CSS from `@white-plumeria/styles` once. Components are render functions, not a second design system.

```vue
<script setup lang="ts">
import { Button, WhitePlumeriaProvider } from "@white-plumeria/vue";
import "@white-plumeria/styles";
</script>

<template>
  <WhitePlumeriaProvider>
    <Button variant="primary">Save changes</Button>
  </WhitePlumeriaProvider>
</template>
```

Controlled values use `v-model`. Dialogs use `v-model:open`. This package does not upload files, call a network, or depend on Tailwind.
