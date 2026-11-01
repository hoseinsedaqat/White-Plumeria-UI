import { component$, render, useSignal } from '@qwik.dev/core';
import {
  Alert,
  Badge,
  Button,
  Card,
  Input,
  Switch,
  WhitePlumeriaProvider,
} from '@white-plumeria/qwik';
import '@white-plumeria/styles';
import { readPenComponent } from '../../component.ts';

export const Pen = component$(() => {
  const component = readPenComponent();
  const saved = useSignal('Ready in this Qwik document.');
  return (
    <WhitePlumeriaProvider>
      <main class="wpl-root wpl-reset">
        {component === 'badge' ? (
          <Badge variant="success">Paid</Badge>
        ) : component === 'alert' ? (
          <Alert variant="info" title="Info">
            Sample notice.
          </Alert>
        ) : component === 'card' ? (
          <Card title="Ledger" description="A titled surface." />
        ) : component === 'switch' ? (
          <Switch label="Enabled" defaultChecked />
        ) : component === 'input' ? (
          <Input placeholder="ada@example.com" />
        ) : (
          <Card title="Qwik" description="Qwik render owns this document. The handler is a QRL.">
            <Button
              onClick$={() => {
                saved.value = 'Saved in this Qwik document.';
              }}
            >
              Save changes
            </Button>
            <p id="note">{saved.value}</p>
          </Card>
        )}
      </main>
    </WhitePlumeriaProvider>
  );
});

const root = document.querySelector('#app');
if (root) void render(root, <Pen />);
