<script lang="ts">
  import { Alert, Badge, Button, Card, Input, Switch, WhitePlumeriaProvider } from '@white-plumeria/svelte';
  import { readPenComponent } from '../../component.ts';

  const component = readPenComponent();
  let saved = $state('Ready in this Svelte document.');

  function save() {
    saved = 'Saved in this Svelte document.';
  }
</script>

<WhitePlumeriaProvider>
  <main class="wpl-root wpl-reset">
    {#if component === 'badge'}
      <Badge variant="success">Paid</Badge>
    {:else if component === 'alert'}
      <Alert variant="info" title="Info">Sample notice.</Alert>
    {:else if component === 'card'}
      <Card title="Ledger" description="A titled surface." />
    {:else if component === 'switch'}
      <Switch label="Enabled" checked />
    {:else if component === 'input'}
      <Input placeholder="ada@example.com" />
    {:else}
      <Card title="Svelte" description="This component is compiled by the Svelte plugin.">
        <Button onclick={save}>Save changes</Button>
        <p id="note">{saved}</p>
      </Card>
    {/if}
  </main>
</WhitePlumeriaProvider>
