import { Badge, Button, Card, Checkbox, EmptyState, Input, PageHeader, Select, StatCard, Switch, Alert } from '@white-plumeria/react';
import { useState } from 'react';
import { CodeBlock } from '../copy.tsx';
import { ThemedFrame } from '../preview.tsx';

const plans = [
  { name: 'Studio', price: 'Free', detail: 'Styles, components, and the local assistant.' },
  { name: 'Team', price: 'Free', detail: 'Same library. No seat fee.' },
  { name: 'Company', price: 'Free', detail: 'Same components. No paid tier.' },
] as const;

export function BlocksPage() {
  const [plan, setPlan] = useState<(typeof plans)[number]['name']>('Team');
  const [signedIn, setSignedIn] = useState(false);
  const [saved, setSaved] = useState(false);
  const [hasRows, setHasRows] = useState(false);
  const [email, setEmail] = useState('');

  return (
    <article className="docs-article">
      <h1 className="docs-title">Blocks</h1>
      <p className="docs-lede">
        Application and marketing patterns other libraries sell as a paid add-on. These are free compositions of
        White Plumeria components. They do not call a server, and they are not a copy of another product.
      </p>

      <section className="docs-blocks">
        <section>
          <h2>Sign in</h2>
          <p>A credential form. This sample never sends the email or password.</p>
          <ThemedFrame className="docs-canvas">
            <Card title="Sign in" description="Use the account for this sample workspace." className="wpl-measure">
              <form
                className="wpl-stack"
                onSubmit={(event) => {
                  event.preventDefault();
                  setSignedIn(true);
                }}
              >
                <label className="wpl-label" htmlFor="block-email">
                  Email
                </label>
                <Input id="block-email" type="email" value={email} placeholder="ada@example.com" onChange={(event) => setEmail(event.currentTarget.value)} />
                <label className="wpl-label" htmlFor="block-password">
                  Password
                </label>
                <Input id="block-password" type="password" autoComplete="current-password" />
                <Checkbox label="Remember this browser" defaultChecked />
                <Button type="submit">Continue</Button>
                {signedIn ? <Alert variant="success" title="Sample only">Nothing was sent. Email stays in this page.</Alert> : null}
              </form>
            </Card>
          </ThemedFrame>
          <CodeBlock
            label="react"
            code={`<Card title="Sign in" description="Use the account for this sample workspace.">
  <form>
    <Input type="email" placeholder="ada@example.com" />
    <Input type="password" />
    <Checkbox label="Remember this browser" />
    <Button type="submit">Continue</Button>
  </form>
</Card>`}
          />
        </section>

        <section>
          <h2>Pricing</h2>
          <p>Three plans. Choosing one updates the selection. There is no checkout.</p>
          <ThemedFrame className="docs-canvas">
            <div className="docs-price-grid">
              {plans.map((item) => (
                <Card
                  key={item.name}
                  title={item.name}
                  description={item.detail}
                  footer={
                    <Button variant={plan === item.name ? 'primary' : 'outline'} onClick={() => setPlan(item.name)}>
                      {plan === item.name ? 'Selected' : 'Choose'}
                    </Button>
                  }
                >
                  <p className="wpl-stat-value">{item.price}</p>
                  {item.name === 'Team' ? <Badge variant="success">Included</Badge> : null}
                </Card>
              ))}
            </div>
          </ThemedFrame>
          <p className="docs-note-line">Selected plan: {plan}. Price is free in every column on purpose.</p>
        </section>

        <section>
          <h2>Dashboard</h2>
          <p>Sample workspace numbers, labeled as a sample. They are not download or star counts.</p>
          <ThemedFrame className="docs-canvas">
            <div className="wpl-stack" style={{ width: '100%' }}>
              <PageHeader
                title="Sample workspace"
                description="Open work in this preview."
                actions={<Button size="sm">New invoice</Button>}
              />
              <div className="docs-stat-grid">
                <StatCard label="Open" value="12" hint="Sample" />
                <StatCard label="Paid" value="48" hint="Sample" />
                <StatCard label="Review" value="3" hint="Sample" />
              </div>
              <Alert variant="info" title="Local data">These figures are fixed sample values.</Alert>
            </div>
          </ThemedFrame>
        </section>

        <section>
          <h2>Settings</h2>
          <p>A settings form with a real save state on this page.</p>
          <ThemedFrame className="docs-canvas">
            <form
              className="wpl-stack wpl-measure"
              onSubmit={(event) => {
                event.preventDefault();
                setSaved(true);
              }}
            >
              <Switch label="Email invoices" defaultChecked />
              <label className="wpl-label" htmlFor="block-week">
                Week start
              </label>
              <Select
                id="block-week"
                defaultValue="monday"
                options={[
                  { value: 'monday', label: 'Monday' },
                  { value: 'sunday', label: 'Sunday' },
                ]}
              />
              <Button type="submit">Save settings</Button>
              {saved ? <Alert variant="success" title="Saved on this page">No request left the browser.</Alert> : null}
            </form>
          </ThemedFrame>
        </section>

        <section>
          <h2>Empty state</h2>
          <p>The empty view can be replaced with a row. The button does that here.</p>
          <ThemedFrame className="docs-canvas">
            {hasRows ? (
              <Alert variant="success" title="One sample row">Invoice 1042 is only a preview.</Alert>
            ) : (
              <EmptyState title="No invoices yet" description="Add a sample row to see the filled state.">
                <Button onClick={() => setHasRows(true)}>Add sample row</Button>
              </EmptyState>
            )}
          </ThemedFrame>
        </section>
      </section>
    </article>
  );
}
