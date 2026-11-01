import '@white-plumeria/styles';
import {
  Alert,
  Badge,
  Button,
  Card,
  Input,
  Switch,
  WhitePlumeriaProvider,
} from '@white-plumeria/react';
import { useState, type ReactNode } from 'react';
import { createRoot } from 'react-dom/client';
import { readPenComponent } from '../../component.ts';

function Pen() {
  const component = readPenComponent();
  const [saved, setSaved] = useState('Ready in this React document.');
  let body: ReactNode;
  if (component === 'badge') body = <Badge variant="success">Paid</Badge>;
  else if (component === 'alert')
    body = (
      <Alert variant="info" title="Info">
        Sample notice.
      </Alert>
    );
  else if (component === 'card') body = <Card title="Ledger" description="A titled surface." />;
  else if (component === 'switch') body = <Switch label="Enabled" defaultChecked />;
  else if (component === 'input') body = <Input aria-label="Email" placeholder="ada@example.com" />;
  else {
    body = (
      <Card title="React" description="createRoot owns this document. This is not a stand-in.">
        <Button onClick={() => setSaved('Saved in this React document.')}>Save changes</Button>
        <p id="note">{saved}</p>
      </Card>
    );
  }
  return (
    <WhitePlumeriaProvider>
      <main className="wpl-root wpl-reset">{body}</main>
    </WhitePlumeriaProvider>
  );
}

const root = document.querySelector('#app');
if (root) createRoot(root).render(<Pen />);
