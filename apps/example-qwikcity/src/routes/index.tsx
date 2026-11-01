import { component$ } from '@qwik.dev/core';
import { Button, Card, WhitePlumeriaProvider } from '@white-plumeria/qwik';
import '@white-plumeria/styles';

export default component$(() => {
  return (
    <WhitePlumeriaProvider>
      <main class="wpl-root wpl-reset" data-wpl-host="qwikcity" style={{ padding: '1.25rem' }}>
        <Card title="Qwik City" description="Qwik City exported this page. The button is the Qwik component.">
          <Button>Save changes</Button>
        </Card>
      </main>
    </WhitePlumeriaProvider>
  );
});
