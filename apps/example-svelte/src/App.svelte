<script lang="ts">
  import { Button, Card, WhitePlumeriaProvider } from '@white-plumeria/svelte';
  function save() {
    document.title = 'Saved · White Plumeria';
  }
</script>

<WhitePlumeriaProvider>
  <main class="wpl-root wpl-reset" style:padding="2rem">
    <Card title="Svelte example" description="This card is the real component, not a mock.">
      <Button onclick={save}>Save changes</Button>
    </Card>
  </main>
</WhitePlumeriaProvider>
