import { component$, render, useSignal } from '@qwik.dev/core';
import { Button, Card, DateRangePicker, Slider, WhitePlumeriaProvider } from '@white-plumeria/qwik';
import '@white-plumeria/styles';

export const App = component$(() => {
  const saved = useSignal('Not saved yet');
  return (
    <WhitePlumeriaProvider>
      <main class="wpl-root wpl-reset" style={{ padding: '2rem', display: 'grid', gap: '1rem', maxWidth: '40rem' }}>
        <Card title="Qwik example" description="These are the real Qwik components, not a mock.">
          <Button
            onClick$={() => {
              saved.value = 'Saved · White Plumeria';
              document.title = saved.value;
            }}
          >
            Save changes
          </Button>
          <p>{saved.value}</p>
        </Card>
        <Slider label="Density" defaultValue={40} />
        <DateRangePicker label="Stay" />
      </main>
    </WhitePlumeriaProvider>
  );
});

const root = document.getElementById('app');
if (root) void render(root, <App />);
