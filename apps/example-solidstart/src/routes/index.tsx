import { Button, Card, WhitePlumeriaProvider } from '@white-plumeria/solid';
import '@white-plumeria/styles';

export default function Home() {
  return (
    <WhitePlumeriaProvider>
      <main class="wpl-root wpl-reset" data-wpl-host="solidstart" style={{ padding: '1.25rem' }}>
        <Card title="SolidStart" description="SolidStart built this page. The button is the Solid component.">
          <Button>Save changes</Button>
        </Card>
      </main>
    </WhitePlumeriaProvider>
  );
}
