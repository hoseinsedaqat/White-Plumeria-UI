import { buttonAppearances, buttonSizes, buttonVariants, type ButtonAppearance, type ButtonSize, type ButtonVariant } from '@white-plumeria/core';
import {
  Alert,
  Avatar,
  Badge,
  Button,
  ButtonGroup,
  Card,
  Checkbox,
  ContextMenu,
  DatePicker,
  DateRangePicker,
  IconButton,
  Input,
  DropdownMenu,
  Kbd,
  Navbar,
  Progress,
  RangeSlider,
  Select,
  Skeleton,
  Spinner,
  Switch,
  Table,
  Tabs,
  ToggleGroup,
} from '@white-plumeria/react';
import { useState, type ReactNode } from 'react';
import { renderDemo, ThemeCarousel, themeCarouselCode } from './demos.tsx';
import { Preview } from './preview.tsx';

function ButtonLab() {
  const [variant, setVariant] = useState<ButtonVariant>('primary');
  const [size, setSize] = useState<ButtonSize>('md');
  const [appearance, setAppearance] = useState<ButtonAppearance>('solid');
  const [loading, setLoading] = useState(false);
  const code = `<Button variant="${variant}" size="${size}"${appearance === 'solid' ? '' : ` appearance="${appearance}"`}${loading ? ' loading' : ''}>\n  Save changes\n</Button>`;
  return (
    <Preview title="Interactive button" code={code} open>
      <div className="docs-lab">
        <div className="docs-lab-controls">
          <label className="wpl-field">
            <span className="wpl-label">Variant</span>
            <Select
              aria-label="Variant"
              value={variant}
              onChange={(event) => {
                const next = event.currentTarget.value;
                if ((buttonVariants as readonly string[]).includes(next)) setVariant(next as ButtonVariant);
              }}
              options={buttonVariants.map((item) => ({ value: item, label: item }))}
            />
          </label>
          <ToggleGroup
            label="Appearance"
            value={appearance}
            onValueChange={(next) => {
              if ((buttonAppearances as readonly string[]).includes(next)) setAppearance(next as ButtonAppearance);
            }}
            options={buttonAppearances.map((item) => ({ value: item, label: item }))}
          />
          <ToggleGroup
            label="Size"
            value={size}
            onValueChange={(next) => {
              if ((buttonSizes as readonly string[]).includes(next)) setSize(next as ButtonSize);
            }}
            options={buttonSizes.map((item) => ({ value: item, label: item }))}
          />
          <Switch label="Loading" checked={loading} onCheckedChange={setLoading} />
        </div>
        <div className="docs-lab-stage">
          <Button variant={variant} size={size} appearance={appearance} loading={loading}>
            Save changes
          </Button>
        </div>
      </div>
    </Preview>
  );
}

function DateRangeLab() {
  const [showTime, setShowTime] = useState(true);
  const [range, setRange] = useState({ start: '2026-10-12', end: '2026-10-18', startTime: '09:00', endTime: '18:00' });
  return (
    <Preview
      title="Start and end"
      open
      code={`<DateRangePicker label="Stay" start="${range.start}" end="${range.end}"${showTime ? ` showTime startTime="${range.startTime}" endTime="${range.endTime}"` : ''} />`}
    >
      <div className="docs-builder">
        <Switch label="Include time" checked={showTime} onCheckedChange={setShowTime} />
        <DateRangePicker
          label="Stay"
          start={range.start}
          end={range.end}
          showTime={showTime}
          startTime={range.startTime}
          endTime={range.endTime}
          onValueChange={(next) =>
            setRange({
              start: next.start,
              end: next.end,
              startTime: next.startTime ?? '',
              endTime: next.endTime ?? '',
            })
          }
        />
      </div>
    </Preview>
  );
}

function RangeLab() {
  const [range, setRange] = useState({ start: 80, end: 320 });
  return (
    <Preview
      title="Start and end"
      open
      code={`<RangeSlider label="Price" min={0} max={500} step={10} start={${range.start}} end={${range.end}} />`}
    >
      <div className="docs-builder">
        <RangeSlider
          label="Price"
          min={0}
          max={500}
          step={10}
          start={range.start}
          end={range.end}
          onValueChange={setRange}
        />
      </div>
    </Preview>
  );
}

function MenuLab() {
  const [selected, setSelected] = useState('Nothing selected');
  const items = [
    { id: 'profile', label: 'Profile' },
    {
      id: 'theme',
      label: 'Theme',
      items: [
        { id: 'ivory', label: 'Ivory' },
        { id: 'ink', label: 'Ink' },
      ],
    },
    { id: 'out', label: 'Sign out' },
  ];
  return (
    <Preview
      title="One submenu"
      open
      code={`<DropdownMenu label="Account" items={[{ id: "theme", label: "Theme", items: [{ id: "ivory", label: "Ivory" }] }]} onSelect={() => {}} />`}
    >
      <div className="docs-builder" style={{ minBlockSize: '14rem', justifyContent: 'flex-start' }}>
        <DropdownMenu label="Account" items={items} onSelect={setSelected} />
        <p className="wpl-muted">Selected: {selected}</p>
      </div>
    </Preview>
  );
}

function ContextLab() {
  const [selected, setSelected] = useState('Nothing selected');
  return (
    <Preview
      title="Right-click submenu"
      open
      code={`<ContextMenu items={[{ id: "export", label: "Export", items: [{ id: "csv", label: "CSV" }] }]}>Row</ContextMenu>`}
    >
      <div className="docs-builder" style={{ minBlockSize: '12rem', justifyContent: 'flex-start' }}>
        <ContextMenu
          items={[
            { id: 'copy', label: 'Copy label' },
            { id: 'export', label: 'Export', items: [{ id: 'csv', label: 'CSV' }, { id: 'pdf', label: 'PDF' }] },
          ]}
          onSelect={setSelected}
        >
          <Card title="Invoice row">Right-click this card, or focus it and press Shift+F10.</Card>
        </ContextMenu>
        <p className="wpl-muted">Selected: {selected}</p>
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
    <Preview title="Slider" open code={themeCarouselCode}>
      <ThemeCarousel />
    </Preview>
  ),
  progress: (
    <Preview title="Progress" open code={`<Progress label="Upload" value={64} />`}>
      <Progress label="Upload" value={64} />
    </Preview>
  ),
  'data-table': (
    <Preview title="Sort, filter, and page" open>
      {renderDemo('data-table')}
    </Preview>
  ),
  navbar: (
    <Preview
      title="Collapsible header"
      open
      code={`<Navbar brand="White Plumeria" items={[{ href: '#docs', label: 'Docs', current: true }]} />`}
    >
      <Navbar
        brand="White Plumeria"
        items={[
          { href: '#docs', label: 'Docs', current: true },
          { href: '#themes', label: 'Themes' },
          { href: '#components', label: 'Components' },
          { href: '#ai', label: 'AI' },
        ]}
      />
    </Preview>
  ),
  'date-picker': (
    <>
      <Preview title="ISO date" open code={`<DatePicker label="From" value="2026-10-27" />`}>
        <DatePicker label="From" value="2026-10-27" />
      </Preview>
      <Preview title="With time" code={`<DatePicker label="From" value="2026-10-27" showTime time="09:30" />`}>
        <DatePicker label="From" value="2026-10-27" showTime time="09:30" />
      </Preview>
    </>
  ),
  'date-range-picker': <DateRangeLab />,
  'range-slider': <RangeLab />,
  'dropdown-menu': <MenuLab />,
  'context-menu': <ContextLab />,
  avatar: (
    <Preview title="Sizes and status" open code={`<Avatar name="Laleh Karimi" size="lg" status="online" statusLabel="Online" />`}>
      <Avatar name="Laleh Karimi" size="sm" />
      <Avatar name="Laleh Karimi" status="online" statusLabel="Online" />
      <Avatar name="Laleh Karimi" size="lg" status="busy" statusLabel="Busy" />
    </Preview>
  ),
  spinner: (
    <Preview title="Sizes" open code={`<Spinner label="Saving" />`}>
      <Spinner label="Saving" size="sm" />
      <Spinner label="Saving" />
      <Spinner label="Saving" size="lg" />
    </Preview>
  ),
  skeleton: (
    <Preview title="Placeholder" open code={`<Skeleton width="12rem" height="1rem" />`}>
      <div className="wpl-stack" style={{ width: 'min(100%, 18rem)' }}>
        <Skeleton width="40%" height="0.8rem" />
        <Skeleton width="100%" height="0.8rem" />
        <Skeleton width="100%" height="4.5rem" />
      </div>
    </Preview>
  ),
  'icon-button': (
    <Preview title="Icon button" open code={`<IconButton label="Close" />`}>
      <IconButton label="Close" />
      <IconButton label="Close" variant="outline" />
      <IconButton label="Close" variant="danger" />
    </Preview>
  ),
  kbd: (
    <Preview title="Shortcut" open code={`<Kbd keys={["Ctrl", "K"]} />`}>
      <Kbd keys={['Ctrl', 'K']} />
      <Kbd keys={['Shift', 'F10']} />
    </Preview>
  ),
  'button-group': (
    <Preview title="Joined and separate" open>
      <ButtonGroup label="Save options">
        <Button>Save</Button>
        <Button variant="secondary">Draft</Button>
      </ButtonGroup>
      <ButtonGroup label="Joined actions" joined>
        <Button>Save</Button>
        <Button variant="secondary">Draft</Button>
      </ButtonGroup>
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
  if (slug === 'data-table') {
    return (
      <Table caption="Sample rates">
        <thead>
          <tr>
            <th>Pair</th>
            <th>Rate</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>EUR/USD</td>
            <td>1.08</td>
          </tr>
        </tbody>
      </Table>
    );
  }
  return renderDemo(slug);
}
