import '@white-plumeria/styles';
import {
  Alert,
  Badge,
  Button,
  Card,
  Input,
  Switch,
  WhitePlumeriaProvider,
} from '@white-plumeria/preact';
import { render } from 'preact';
import { useState } from 'preact/hooks';
import type { ComponentChildren } from 'preact';
import { readPenComponent } from '../../component.ts';

function Pen() {
  const component = readPenComponent();
  const [saved, setSaved] = useState('Ready in this Preact document.');
  let body: ComponentChildren;
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
      <Card title="Preact" description="Preact render owns this document.">
        <Button onClick={() => setSaved('Saved in this Preact document.')}>Save changes</Button>
        <p id="note">{saved}</p>
      </Card>
    );
  }
  return (
    <WhitePlumeriaProvider>
      <main class="wpl-root wpl-reset">{body}</main>
    </WhitePlumeriaProvider>
  );
}

const root = document.querySelector('#app');
if (root) render(<Pen />, root);
