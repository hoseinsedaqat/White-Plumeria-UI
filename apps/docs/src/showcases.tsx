import { buttonAppearances, buttonSizes, buttonVariants, type ButtonAppearance, type ButtonSize, type ButtonVariant } from '@white-plumeria/core';
import {
  Alert,
  Badge,
  Button,
  ButtonGroup,
  Card,
  Checkbox,
  Input,
  Progress,
  Select,
  Switch,
  Tabs,
} from '@white-plumeria/react';
import { useState, type ReactNode } from 'react';
import { renderDemo, ThemeCarousel, themeCarouselCode } from './demos.tsx';
import { Preview } from './preview.tsx';

function Choice<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: readonly T[];
  onChange: (next: T) => void;
}) {
  return (
    <div className="docs-choice" role="group" aria-label={label}>
      {options.map((option) => (
        <button key={option} type="button" aria-pressed={value === option} onClick={() => onChange(option)}>
          {option}
        </button>
      ))}
    </div>
  );
}

function ButtonLab() {
  const [variant, setVariant] = useState<ButtonVariant>('primary');
  const [size, setSize] = useState<ButtonSize>('md');
  const [appearance, setAppearance] = useState<ButtonAppearance>('solid');
  const [loading, setLoading] = useState(false);
  const code = `<Button variant="${variant}" size="${size}"${appearance === 'solid' ? '' : ` appearance="${appearance}"`}${loading ? ' loading' : ''}>\n  Save changes\n</Button>`;
  return (
    <Preview title="Interactive button" code={code} open>
      <div className="docs-builder">
        <Choice label="Variant" value={variant} options={buttonVariants} onChange={setVariant} />
        <Choice label="Appearance" value={appearance} options={buttonAppearances} onChange={setAppearance} />
        <Choice label="Size" value={size} options={buttonSizes} onChange={setSize} />
        <Switch label="Loading" checked={loading} onCheckedChange={setLoading} />
        <Button variant={variant} size={size} appearance={appearance} loading={loading}>
          Save changes
        </Button>
      </div>
    </Preview>
  );
}

function buttonCode(variant: ButtonVariant, size?: ButtonSize) {
  const sizeAttr = size && size !== 'md' ? ` size="${size}"` : '';
  return `<Button variant="${variant}"${sizeAttr}>Save changes</Button>`;
}

const sections: Record<string, ReactNode> = {
  button: (
    <>
      <ButtonLab />
      <Preview
        title="Variants"
        code={buttonVariants.map((variant) => buttonCode(variant)).join('\n')}
      >
        {buttonVariants.map((variant) => (
          <Button key={variant} variant={variant}>
            {variant}
          </Button>
        ))}
      </Preview>
      <Preview title="Sizes" code={buttonSizes.map((size) => buttonCode('primary', size)).join('\n')}>
        {buttonSizes.map((size) => (
          <Button key={size} size={size}>
            {size}
          </Button>
        ))}
      </Preview>
      <Preview title="Soft and dash">
        <Button appearance="soft">Soft</Button>
        <Button appearance="dash">Dash</Button>
        <Button variant="danger" appearance="soft">Soft danger</Button>
        <Button variant="success" appearance="dash">Dash success</Button>
      </Preview>
      <Preview title="States" code={`<Button disabled>Disabled</Button>\n<Button loading>Loading</Button>\n<Button block>Full width</Button>`}>
        <Button disabled>Disabled</Button>
        <Button loading>Loading</Button>
        <Button block>Full width</Button>
      </Preview>
      <Preview title="Group" code={`<ButtonGroup label="Save options">\n  <Button>Save</Button>\n  <Button variant="secondary">Draft</Button>\n</ButtonGroup>`}>
        <ButtonGroup label="Save options">
          <Button>Save</Button>
          <Button variant="secondary">Draft</Button>
          <Button variant="ghost">Cancel</Button>
        </ButtonGroup>
      </Preview>
    </>
  ),
  badge: (
    <Preview
      title="Badge colors"
      open
      code={`<Badge>Neutral</Badge>\n<Badge variant="primary">Primary</Badge>\n<Badge variant="success">Success</Badge>\n<Badge variant="warning">Warning</Badge>\n<Badge variant="danger">Danger</Badge>`}
    >
      <Badge>Neutral</Badge>
      <Badge variant="primary">Primary</Badge>
      <Badge variant="success">Success</Badge>
      <Badge variant="warning">Warning</Badge>
      <Badge variant="danger">Danger</Badge>
    </Preview>
  ),
  alert: (
    <Preview
      title="Alert tones"
      open
      code={`<Alert title="Note">Neutral message.</Alert>\n<Alert variant="info" title="Info">Something to read.</Alert>\n<Alert variant="success" title="Saved">The sample was stored locally.</Alert>\n<Alert variant="warning" title="Review">Two fields are incomplete.</Alert>\n<Alert variant="danger" title="Blocked">This action did not run.</Alert>`}
    >
      <div className="wpl-stack" style={{ width: '100%' }}>
        <Alert title="Note">Neutral message.</Alert>
        <Alert variant="info" title="Info">Something to read.</Alert>
        <Alert variant="success" title="Saved">The sample was stored locally.</Alert>
        <Alert variant="warning" title="Review">Two fields are incomplete.</Alert>
        <Alert variant="danger" title="Blocked">This action did not run.</Alert>
      </div>
    </Preview>
  ),
  input: (
    <Preview title="Text field" open code={`<Input placeholder="ada@example.com" />\n<Input disabled placeholder="Disabled" />`}>
      <Input aria-label="Email" placeholder="ada@example.com" />
      <Input aria-label="Disabled email" disabled placeholder="Disabled" />
    </Preview>
  ),
  card: (
    <Preview title="Card" open code={`<Card title="Analytics" description="Overview of recent activity">\n  Updated today\n</Card>`}>
      <Card title="Analytics" description="Overview of recent activity" footer={<Button size="sm">Open</Button>}>
        Updated today. This card is the real component.
      </Card>
    </Preview>
  ),
  switch: (
    <Preview title="Switch" open code={`<Switch label="Email invoices" />`}>
      <Switch label="Email invoices" defaultChecked />
      <Switch label="Disabled" disabled />
    </Preview>
  ),
  checkbox: (
    <Preview title="Checkbox" open code={`<Checkbox label="Email me invoices" />`}>
      <Checkbox label="Email me invoices" defaultChecked />
      <Checkbox label="Disabled" disabled />
    </Preview>
  ),
  select: (
    <Preview title="Select" open code={`<Select aria-label="Plan" options={[{ value: "annual", label: "Annual" }]} />`}>
      <Select
        aria-label="Plan"
        options={[
          { value: 'annual', label: 'Annual' },
          { value: 'month', label: 'Monthly' },
        ]}
      />
    </Preview>
  ),
  tabs: (
    <Preview title="Tabs" open code={`<Tabs tabs={[{ id: "overview", label: "Overview", panel: "Balances" }]} />`}>
      <Tabs
        tabs={[
          { id: 'overview', label: 'Overview', panel: 'Balances for the sample workspace.' },
          { id: 'activity', label: 'Activity', panel: 'No live feed is connected.' },
          { id: 'notes', label: 'Notes', panel: 'Notes stay in this panel.' },
        ]}
      />
    </Preview>
  ),
  carousel: (
    <Preview title="Image slider" open code={themeCarouselCode}>
      <ThemeCarousel />
    </Preview>
  ),
  progress: (
    <Preview title="Progress" open code={`<Progress label="Upload" value={64} />`}>
      <Progress label="Upload" value={64} />
    </Preview>
  ),
};

export function Showcase({ slug }: { slug: string }) {
  return sections[slug] ?? <Preview title="Preview">{renderDemo(slug)}</Preview>;
}

export function MiniPreview({ slug }: { slug: string }) {
  if (slug === 'button') return <Button size="sm">Save</Button>;
  if (slug === 'badge') return <Badge variant="success">Paid</Badge>;
  if (slug === 'alert') return <Alert variant="info" title="Info">Sample notice.</Alert>;
  if (slug === 'input') return <Input aria-label="Email" placeholder="ada@example.com" />;
  if (slug === 'switch') return <Switch label="Enabled" defaultChecked />;
  if (slug === 'checkbox') return <Checkbox label="Remember me" defaultChecked />;
  return renderDemo(slug);
}
