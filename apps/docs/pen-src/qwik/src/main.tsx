import { component$, render, useSignal } from '@qwik.dev/core';
import { Button, Card, WhitePlumeriaProvider } from '@white-plumeria/qwik';
import '@white-plumeria/styles';

export const Pen = component$(() => {
  const saved = useSignal('Ready in this Qwik document.');
  return (
    <WhitePlumeriaProvider>
      <main class="wpl-root wpl-reset">
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
      </main>
    </WhitePlumeriaProvider>
  );
});

const root = document.querySelector('#app');
if (root) void render(root, <Pen />);
