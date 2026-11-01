<script lang="ts">
  import { Button, Card, WhitePlumeriaProvider } from '@white-plumeria/svelte';
  import '@white-plumeria/styles';
</script>

<WhitePlumeriaProvider>
  <main class="wpl-root wpl-reset" data-wpl-host="sveltekit" style:padding="1.25rem">
    <Card title="SvelteKit" description="SvelteKit exported this page. The button is the Svelte component.">
      <Button>Save changes</Button>
    </Card>
  </main>
</WhitePlumeriaProvider>
