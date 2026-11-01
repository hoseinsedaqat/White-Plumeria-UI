'use client';

import { Button, Card, WhitePlumeriaProvider } from '@white-plumeria/react';
import '@white-plumeria/styles';

export default function Page() {
  return (
    <WhitePlumeriaProvider>
      <main className="wpl-root wpl-reset" data-wpl-host="next" style={{ padding: '1.25rem' }}>
        <Card
          title="Next"
          description="Next.js exported this page. The button is the React client component."
        >
          <Button>Save changes</Button>
        </Card>
      </main>
    </WhitePlumeriaProvider>
  );
}
