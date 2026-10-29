import '@white-plumeria/styles';
import { Button, Card, DateRangePicker, Slider, WhitePlumeriaProvider } from '@white-plumeria/solid';
import { render } from 'solid-js/web';

const root = document.getElementById('app');
if (!root) throw new Error('Missing #app');

render(
  () => (
    <WhitePlumeriaProvider>
      <main class="wpl-root wpl-reset" style={{ padding: '2rem', display: 'grid', gap: '1rem', 'max-width': '40rem' }}>
        <Card title="Solid example" description="These are the real Solid components, not a mock.">
          <Button onClick={() => (document.title = 'Saved · White Plumeria')}>Save changes</Button>
        </Card>
        <Slider label="Density" defaultValue={40} />
        <DateRangePicker label="Stay" />
      </main>
    </WhitePlumeriaProvider>
  ),
  root,
);
