import '@white-plumeria/styles';
import { Button, Card, WhitePlumeriaProvider } from '@white-plumeria/react';
import { useState } from 'react';
import { createRoot } from 'react-dom/client';

function Pen() {
  const [saved, setSaved] = useState('Ready in this React document.');
  return (
    <WhitePlumeriaProvider>
      <main className="wpl-root wpl-reset">
        <Card title="React" description="createRoot owns this document. This is not a stand-in.">
          <Button onClick={() => setSaved('Saved in this React document.')}>Save changes</Button>
          <p id="note">{saved}</p>
        </Card>
      </main>
    </WhitePlumeriaProvider>
  );
}

const root = document.querySelector('#app');
if (root) createRoot(root).render(<Pen />);
