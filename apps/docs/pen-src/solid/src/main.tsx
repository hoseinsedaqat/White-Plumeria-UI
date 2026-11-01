import '@white-plumeria/styles';
import { Button, Card, WhitePlumeriaProvider } from '@white-plumeria/solid';
import { createSignal } from 'solid-js';
import { render } from 'solid-js/web';

function Pen() {
  const [saved, setSaved] = createSignal('Ready in this Solid document.');
  return (
    <WhitePlumeriaProvider>
      <main class="wpl-root wpl-reset">
        <Card title="Solid" description="solid-js/web render owns this document.">
          <Button onClick={() => setSaved('Saved in this Solid document.')}>Save changes</Button>
          <p id="note">{saved()}</p>
        </Card>
      </main>
    </WhitePlumeriaProvider>
  );
}

const root = document.querySelector('#app');
if (root) render(() => <Pen />, root);
