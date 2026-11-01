<script lang="ts">
  import { Button, Card, WhitePlumeriaProvider } from '@white-plumeria/svelte';

  let saved = $state('Ready in this Svelte document.');

  function save() {
    saved = 'Saved in this Svelte document.';
  }
</script>

<WhitePlumeriaProvider>
  <main class="wpl-root wpl-reset">
    <Card title="Svelte" description="This component is compiled by the Svelte plugin.">
      <Button onclick={save}>Save changes</Button>
      <p id="note">{saved}</p>
    </Card>
  </main>
</WhitePlumeriaProvider>
