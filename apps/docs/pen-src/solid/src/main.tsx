import '@white-plumeria/styles';
import {
  Alert,
  Badge,
  Button,
  Card,
  Input,
  Switch,
  WhitePlumeriaProvider,
} from '@white-plumeria/solid';
import { createSignal, type JSX } from 'solid-js';
import { render } from 'solid-js/web';
import { readPenComponent } from '../../component.ts';

function Pen() {
  const component = readPenComponent();
  const [saved, setSaved] = createSignal('Ready in this Solid document.');
  let body: JSX.Element;
  if (component === 'badge') body = <Badge variant="success">Paid</Badge>;
  else if (component === 'alert')
    body = (
      <Alert variant="info" title="Info">
        Sample notice.
      </Alert>
    );
  else if (component === 'card') body = <Card title="Ledger" description="A titled surface." />;
  else if (component === 'switch') body = <Switch label="Enabled" checked />;
  else if (component === 'input') body = <Input aria-label="Email" placeholder="ada@example.com" />;
  else {
    body = (
      <Card title="Solid" description="solid-js/web render owns this document.">
        <Button onClick={() => setSaved('Saved in this Solid document.')}>Save changes</Button>
        <p id="note">{saved()}</p>
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
if (root) render(() => <Pen />, root);
