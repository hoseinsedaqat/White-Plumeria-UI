import '@white-plumeria/styles';
import { Button, Card, WhitePlumeriaProvider } from '@white-plumeria/preact';
import { render } from 'preact';
import { useState } from 'preact/hooks';

function Pen() {
  const [saved, setSaved] = useState('Ready in this Preact document.');
  return (
    <WhitePlumeriaProvider>
      <main class="wpl-root wpl-reset">
        <Card title="Preact" description="Preact render owns this document.">
          <Button onClick={() => setSaved('Saved in this Preact document.')}>Save changes</Button>
          <p id="note">{saved}</p>
        </Card>
      </main>
    </WhitePlumeriaProvider>
  );
}

const root = document.querySelector('#app');
if (root) render(<Pen />, root);
