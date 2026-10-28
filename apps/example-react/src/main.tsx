import '@white-plumeria/styles';
import { Button, Card, WhitePlumeriaProvider } from '@white-plumeria/react';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

const root = document.getElementById('root');
if (!root) throw new Error('Missing #root');

createRoot(root).render(
  <StrictMode>
    <WhitePlumeriaProvider>
      <main className="wpl-root wpl-reset" style={{ padding: '2rem' }}>
        <Card title="React example" description="This card is the real component, not a mock.">
          <Button
            onClick={() => {
              document.title = 'Saved · White Plumeria';
            }}
          >
            Save changes
          </Button>
        </Card>
      </main>
    </WhitePlumeriaProvider>
  </StrictMode>,
);
