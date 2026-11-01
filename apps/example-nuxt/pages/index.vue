<script setup lang="ts">
import { Button, Card, WhitePlumeriaProvider } from '@white-plumeria/vue';
import '@white-plumeria/styles';
</script>

<template>
  <ClientOnly>
    <WhitePlumeriaProvider>
      <main class="wpl-root wpl-reset" data-wpl-host="nuxt" style="padding: 1.25rem">
        <Card
          title="Nuxt"
          description="Nuxt generated this page. The button is the Vue client component."
        >
          <Button>Save changes</Button>
        </Card>
      </main>
    </WhitePlumeriaProvider>
  </ClientOnly>
</template>
