import { toastClassName, type ToastVariant } from '@white-plumeria/core';
import {
  Accordion,
  Badge,
  Breadcrumb,
  Button,
  Calendar,
  Card,
  Carousel,
  ChartContainer,
  Checkbox,
  Combobox,
  CommandPalette,
  Container,
  DataTable,
  Dialog,
  Divider,
  Drawer,
  EmptyState,
  FileUpload,
  Flex,
  Footer,
  FormField,
  FormMessage,
  Input,
  Label,
  Link,
  List,
  Modal,
  Navbar,
  NavigationMenu,
  NumberField,
  OtpField,
  PageHeader,
  Pagination,
  PasswordField,
  Popover,
  Progress,
  RadioGroup,
  Rating,
  ResponsiveLayout,
  SearchInput,
  Select,
  Separator,
  Sidebar,
  Skeleton,
  Slider,
  SplitPane,
  Stack,
  StatCard,
  Steps,
  Switch,
  Table,
  Tabs,
  Textarea,
  Timeline,
  ToggleGroup,
  Tooltip,
  TreeView,
  useToast,
  ValidationMessage,
} from '@white-plumeria/react';
import { useState, type ReactNode } from 'react';
import { ThemeCarousel, themeCarouselCode } from './demos.tsx';
import { Preview } from './preview.tsx';

export interface Sample {
  title: string;
  code: string;
  children: ReactNode;
}

const toastVariants = ['neutral', 'success', 'warning', 'danger'] as const;

const columns = [
  { id: 'id', header: 'ID', accessor: (row: Row) => row.id, text: (row: Row) => row.id },
  { id: 'merchant', header: 'Merchant', accessor: (row: Row) => row.merchant, text: (row: Row) => row.merchant },
  {
    id: 'amount',
    header: 'Amount',
    accessor: (row: Row) => row.amount,
    text: (row: Row) => String(row.amount),
    sortValue: (row: Row) => row.amount,
  },
  {
    id: 'status',
    header: 'Status',
    accessor: (row: Row) => <Badge variant={row.status === 'Paid' ? 'success' : row.status === 'Due' ? 'warning' : 'neutral'}>{row.status}</Badge>,
    text: (row: Row) => row.status,
  },
];

interface Row {
  id: string;
  merchant: string;
  amount: number;
  status: string;
}

const rows: Row[] = [
  { id: '1042', merchant: 'Paper Press', amount: 180, status: 'Paid' },
  { id: '1043', merchant: 'Lagoon Freight', amount: 960, status: 'Due' },
  { id: '1044', merchant: 'Saffron Ledger', amount: 40, status: 'Review' },
  { id: '1045', merchant: 'Ink Studio', amount: 220, status: 'Paid' },
  { id: '1046', merchant: 'Blush Paper', amount: 75, status: 'Due' },
];

const contentSlides = [
  { id: 'overview', label: 'Overview', content: <p>Balances for the sample workspace.</p> },
  { id: 'activity', label: 'Activity', content: <p>No live feed is connected.</p> },
  { id: 'notes', label: 'Notes', content: <p>Notes stay in this slide.</p> },
];

function ToastFace({ variant, title, description }: { variant: ToastVariant; title: string; description?: string }) {
  return (
    <div className={toastClassName(variant)} role={variant === 'danger' ? 'alert' : 'status'}>
      <div>
        <p className="wpl-toast-title">{title}</p>
        {description ? <p className="wpl-toast-description">{description}</p> : null}
      </div>
    </div>
  );
}

function ToastPushers() {
  const toast = useToast();
  return (
    <div className="wpl-cluster">
      {toastVariants.map((variant) => (
        <Button
          key={variant}
          variant={variant === 'neutral' ? 'secondary' : variant}
          onClick={() => toast.push({ title: 'Saved', description: 'Sample toast, not a server response.', variant })}
        >
          Push {variant}
        </Button>
      ))}
    </div>
  );
}

function PageSample({ page, pageCount }: { page: number; pageCount: number }) {
  const [current, setCurrent] = useState(page);
  return <Pagination page={current} pageCount={pageCount} onPageChange={setCurrent} />;
}

function OpenDialog({
  title,
  label,
  footer,
  children,
  Panel = Dialog,
}: {
  title: string;
  label: string;
  footer?: ReactNode;
  children: ReactNode;
  Panel?: typeof Dialog;
}) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button onClick={() => setOpen(true)}>{label}</Button>
      <Panel open={open} onOpenChange={setOpen} title={title} footer={footer}>
        {children}
      </Panel>
    </>
  );
}

function OpenDrawer({ side }: { side: 'start' | 'end' }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button variant="secondary" onClick={() => setOpen(true)}>
        Open {side} drawer
      </Button>
      <Drawer open={open} onOpenChange={setOpen} title="Filters" side={side}>
        <p>Filters stay in this panel. This is the drawer component.</p>
      </Drawer>
    </>
  );
}

function OpenCommands({ commands }: { commands: Array<{ id: string; label: string; group?: string; keywords?: string[] }> }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button variant="secondary" onClick={() => setOpen(true)}>
        Open commands
      </Button>
      <CommandPalette open={open} onOpenChange={setOpen} commands={commands} />
    </>
  );
}

function Rates({
  footer = false,
  action = false,
  wide = false,
  status = false,
}: {
  footer?: boolean;
  action?: boolean;
  wide?: boolean;
  status?: boolean;
}) {
  return (
    <Table caption={wide ? 'Wide sample rates' : 'Sample rates'}>
      <thead>
        <tr>
          <th>Pair</th>
          <th>Rate</th>
          {wide ? (
            <>
              <th>Open</th>
              <th>High</th>
              <th>Low</th>
              <th>Volume</th>
            </>
          ) : null}
          {status ? <th>Status</th> : null}
          {action ? <th>Action</th> : null}
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>EUR/USD</td>
          <td>1.08</td>
          {wide ? (
            <>
              <td>1.07</td>
              <td>1.09</td>
              <td>1.06</td>
              <td>12040</td>
            </>
          ) : null}
          {status ? (
            <td>
              <Badge variant="success">Paid</Badge>
            </td>
          ) : null}
          {action ? (
            <td>
              <Button size="sm" variant="ghost">
                View
              </Button>
            </td>
          ) : null}
        </tr>
        <tr>
          <td>GBP/USD</td>
          <td>1.27</td>
          {wide ? (
            <>
              <td>1.26</td>
              <td>1.28</td>
              <td>1.25</td>
              <td>8040</td>
            </>
          ) : null}
          {status ? (
            <td>
              <Badge variant="warning">Due</Badge>
            </td>
          ) : null}
          {action ? (
            <td>
              <Button size="sm" variant="ghost">
                View
              </Button>
            </td>
          ) : null}
        </tr>
      </tbody>
      {footer ? (
        <tfoot>
          <tr>
            <th scope="row">Total</th>
            <td>2.35</td>
          </tr>
        </tfoot>
      ) : null}
    </Table>
  );
}

export const samples: Record<string, Sample[]> = {
  table: [
    {
      title: 'Caption and columns',
      code: '<Table caption="Sample rates"><thead><tr><th>Pair</th><th>Rate</th></tr></thead><tbody><tr><td>EUR/USD</td><td>1.08</td></tr><tr><td>GBP/USD</td><td>1.27</td></tr></tbody></Table>',
      children: <Rates />,
    },
    {
      title: 'Footer total',
      code: '<Table caption="Sample rates"><thead><tr><th>Pair</th><th>Rate</th></tr></thead><tbody><tr><td>EUR/USD</td><td>1.08</td></tr><tr><td>GBP/USD</td><td>1.27</td></tr></tbody><tfoot><tr><th scope="row">Total</th><td>2.35</td></tr></tfoot></Table>',
      children: <Rates footer />,
    },
    {
      title: 'Status in a cell',
      code: '<Table caption="Sample rates"><thead><tr><th>Pair</th><th>Rate</th><th>Status</th></tr></thead><tbody><tr><td>EUR/USD</td><td>1.08</td><td><Badge variant="success">Paid</Badge></td></tr><tr><td>GBP/USD</td><td>1.27</td><td><Badge variant="warning">Due</Badge></td></tr></tbody></Table>',
      children: <Rates status />,
    },
    {
      title: 'Row action',
      code: '<Table caption="Sample rates"><thead><tr><th>Pair</th><th>Rate</th><th>Status</th><th>Action</th></tr></thead><tbody><tr><td>EUR/USD</td><td>1.08</td><td><Badge variant="success">Paid</Badge></td><td><Button size="sm" variant="ghost">View</Button></td></tr><tr><td>GBP/USD</td><td>1.27</td><td><Badge variant="warning">Due</Badge></td><td><Button size="sm" variant="ghost">View</Button></td></tr></tbody></Table>',
      children: <Rates action status />,
    },
    {
      title: 'Empty body',
      code: '<Table caption="No rows"><thead><tr><th>Pair</th><th>Rate</th></tr></thead><tbody /></Table>',
      children: (
        <Table caption="No rows">
          <thead>
            <tr>
              <th>Pair</th>
              <th>Rate</th>
            </tr>
          </thead>
          <tbody />
        </Table>
      ),
    },
    {
      title: 'Wide table scrolls',
      code: '<div style="max-width:16rem"><Table caption="Wide sample rates"><thead><tr><th>Pair</th><th>Rate</th><th>Open</th><th>High</th><th>Low</th><th>Volume</th></tr></thead><tbody><tr><td>EUR/USD</td><td>1.08</td><td>1.07</td><td>1.09</td><td>1.06</td><td>12040</td></tr><tr><td>GBP/USD</td><td>1.27</td><td>1.26</td><td>1.28</td><td>1.25</td><td>8040</td></tr></tbody></Table></div>',
      children: (
        <div style={{ maxWidth: '16rem' }}>
          <Rates wide />
        </div>
      ),
    },
  ],
  'data-table': [
    {
      title: 'Sort, filter, and page',
      code: '<DataTable caption="Sample transactions" rows={rows} columns={columns} pageSize={2} />',
      children: <DataTable caption="Sample transactions" rows={rows} columns={columns} pageSize={2} defaultSortId="amount" />,
    },
    {
      title: 'No filter',
      code: '<DataTable caption="Sample transactions" rows={rows} columns={columns} filterable={false} />',
      children: <DataTable caption="Sample transactions" rows={rows} columns={columns} filterable={false} />,
    },
    {
      title: 'Descending amount',
      code: '<DataTable caption="Highest first" rows={rows} columns={columns} filterable={false} pageSize={5} defaultSortId="amount" defaultSortDirection="desc" />',
      children: (
        <DataTable
          caption="Highest first"
          rows={rows}
          columns={columns}
          filterable={false}
          pageSize={5}
          defaultSortId="amount"
          defaultSortDirection="desc"
        />
      ),
    },
    {
      title: 'Empty rows',
      code: '<DataTable caption="No matches" rows={[]} columns={columns} />',
      children: <DataTable caption="No matches" rows={[]} columns={columns} />,
    },
  ],
  carousel: [
    {
      title: 'Image slides, looping',
      code: themeCarouselCode,
      children: <ThemeCarousel />,
    },
    {
      title: 'Content slides',
      code: '<Carousel label="Notes" slides={[{ id: "overview", label: "Overview", content: <p>Balances</p> }]} />',
      children: <Carousel label="Notes" slides={contentSlides} />,
    },
    {
      title: 'Stops at the ends',
      code: '<Carousel label="Notes" loop={false} slides={contentSlides} />',
      children: <Carousel label="Notes" loop={false} slides={contentSlides} />,
    },
    {
      title: 'Two slides',
      code: '<Carousel label="Pair" slides={contentSlides.slice(0, 2)} />',
      children: <Carousel label="Pair" slides={contentSlides.slice(0, 2)} />,
    },
  ],
  toast: [
    ...toastVariants.map((variant) => ({
      title: { neutral: 'Neutral', success: 'Success', warning: 'Warning', danger: 'Danger' }[variant],
      code: `toast.push({ title: "Saved", description: "Sample toast, not a server response.", variant: "${variant}" })`,
      children: (
        <ToastFace variant={variant} title="Saved" description="Sample toast, not a server response." />
      ),
    })),
    {
      title: 'Title only',
      code: 'toast.push({ title: "Saved", variant: "success" })',
      children: <ToastFace variant="success" title="Saved" />,
    },
    {
      title: 'Push each tone',
      code: 'toast.push({ title: "Saved", variant: "warning", description: "Sample toast, not a server response." })',
      children: <ToastPushers />,
    },
  ],
  progress: [
    { title: 'Partial', code: '<Progress label="Upload" value={64} />', children: <Progress label="Upload" value={64} /> },
    { title: 'Empty', code: '<Progress label="Upload" value={0} />', children: <Progress label="Upload" value={0} /> },
    { title: 'Complete', code: '<Progress label="Upload" value={100} />', children: <Progress label="Upload" value={100} /> },
    { title: 'Indeterminate', code: '<Progress label="Saving" />', children: <Progress label="Saving" /> },
  ],
  card: [
    {
      title: 'Title and description',
      code: '<Card title="Analytics" description="Overview of recent activity" />',
      children: <Card title="Analytics" description="Overview of recent activity" />,
    },
    {
      title: 'Body and footer',
      code: '<Card title="Analytics" footer={<Button size="sm">Open</Button>}>Updated today</Card>',
      children: (
        <Card title="Analytics" description="Overview of recent activity" footer={<Button size="sm">Open</Button>}>
          Updated today. This card is the real component.
        </Card>
      ),
    },
    {
      title: 'Body only',
      code: '<Card>Notes stay in the body.</Card>',
      children: <Card>Notes stay in the body.</Card>,
    },
  ],
  input: [
    { title: 'Placeholder', code: '<Input placeholder="ada@example.com" />', children: <Input aria-label="Email" placeholder="ada@example.com" /> },
    { title: 'Disabled', code: '<Input disabled placeholder="Disabled" />', children: <Input aria-label="Disabled email" disabled placeholder="Disabled" /> },
    { title: 'Invalid', code: '<Input invalid defaultValue="ada" />', children: <Input aria-label="Invalid email" invalid defaultValue="ada" /> },
    {
      title: 'Sizes',
      code: '<Input size="sm" /><Input /><Input size="lg" />',
      children: (
        <div className="wpl-stack">
          <Input aria-label="Small" size="sm" placeholder="Small" />
          <Input aria-label="Medium" placeholder="Medium" />
          <Input aria-label="Large" size="lg" placeholder="Large" />
        </div>
      ),
    },
  ],
  textarea: [
    { title: 'Four rows', code: '<Textarea rows={4} placeholder="Notes" />', children: <Textarea aria-label="Notes" placeholder="Notes" /> },
    { title: 'Invalid', code: '<Textarea invalid defaultValue="Too short" />', children: <Textarea aria-label="Invalid notes" invalid defaultValue="Too short" /> },
    { title: 'Disabled', code: '<Textarea disabled placeholder="Disabled" />', children: <Textarea aria-label="Disabled notes" disabled placeholder="Disabled" /> },
  ],
  select: [
    {
      title: 'Options',
      code: '<Select aria-label="Plan" options={[{ value: "annual", label: "Annual" }]} />',
      children: (
        <Select aria-label="Plan" options={[{ value: 'annual', label: 'Annual' }, { value: 'month', label: 'Monthly' }]} />
      ),
    },
    {
      title: 'Placeholder',
      code: '<Select placeholder="Choose a plan" options={options} />',
      children: <Select aria-label="Plan" placeholder="Choose a plan" options={[{ value: 'annual', label: 'Annual' }]} />,
    },
    {
      title: 'Disabled option',
      code: '<Select options={[{ value: "soon", label: "Coming later", disabled: true }]} />',
      children: (
        <Select
          aria-label="Plan"
          options={[
            { value: 'annual', label: 'Annual' },
            { value: 'soon', label: 'Coming later', disabled: true },
          ]}
        />
      ),
    },
    { title: 'Disabled field', code: '<Select disabled />', children: <Select aria-label="Disabled plan" disabled options={[{ value: 'annual', label: 'Annual' }]} /> },
  ],
  checkbox: [
    { title: 'Checked', code: '<Checkbox label="Email me invoices" defaultChecked />', children: <Checkbox label="Email me invoices" defaultChecked /> },
    { title: 'Unchecked', code: '<Checkbox label="Email me invoices" />', children: <Checkbox label="Email me invoices" /> },
    { title: 'Disabled', code: '<Checkbox label="Disabled" disabled />', children: <Checkbox label="Disabled" disabled /> },
  ],
  switch: [
    { title: 'On', code: '<Switch label="Email invoices" defaultChecked />', children: <Switch label="Email invoices" defaultChecked /> },
    { title: 'Off', code: '<Switch label="Email invoices" />', children: <Switch label="Email invoices" /> },
    { title: 'Disabled', code: '<Switch label="Disabled" disabled />', children: <Switch label="Disabled" disabled /> },
  ],
  tabs: [
    {
      title: 'Horizontal',
      code: '<Tabs tabs={[{ id: "overview", label: "Overview", panel: "Balances" }]} />',
      children: (
        <Tabs
          tabs={[
            { id: 'overview', label: 'Overview', panel: 'Balances for the sample workspace.' },
            { id: 'activity', label: 'Activity', panel: 'No live feed is connected.' },
            { id: 'notes', label: 'Notes', panel: 'Notes stay in this panel.' },
          ]}
        />
      ),
    },
    {
      title: 'Vertical',
      code: '<Tabs orientation="vertical" tabs={tabs} />',
      children: (
        <Tabs
          orientation="vertical"
          tabs={[
            { id: 'overview', label: 'Overview', panel: 'Balances for the sample workspace.' },
            { id: 'activity', label: 'Activity', panel: 'No live feed is connected.' },
          ]}
        />
      ),
    },
  ],
  accordion: [
    {
      title: 'One open',
      code: '<Accordion items={[{ id: "fees", title: "Fees", content: "No monthly fee." }]} />',
      children: (
        <Accordion
          items={[
            { id: 'fees', title: 'Fees', content: 'No monthly fee.' },
            { id: 'tax', title: 'Tax', content: 'Tax is not calculated here.' },
          ]}
        />
      ),
    },
    {
      title: 'Several open',
      code: '<Accordion multiple items={items} />',
      children: (
        <Accordion
          multiple
          items={[
            { id: 'fees', title: 'Fees', content: 'No monthly fee.' },
            { id: 'tax', title: 'Tax', content: 'Tax is not calculated here.' },
          ]}
        />
      ),
    },
  ],
  steps: [
    {
      title: 'Horizontal',
      code: '<Steps label="Checkout" items={items} defaultValue="billing" />',
      children: (
        <Steps
          label="Checkout"
          defaultValue="billing"
          items={[
            { id: 'account', title: 'Account', description: 'Email and name' },
            { id: 'billing', title: 'Billing', description: 'Payment method' },
            { id: 'review', title: 'Review', description: 'Confirm the sample' },
          ]}
        />
      ),
    },
    {
      title: 'Vertical',
      code: '<Steps label="Checkout" orientation="vertical" items={items} />',
      children: (
        <Steps
          label="Checkout"
          orientation="vertical"
          defaultValue="account"
          items={[
            { id: 'account', title: 'Account', description: 'Email and name' },
            { id: 'billing', title: 'Billing', description: 'Payment method' },
            { id: 'review', title: 'Review', description: 'Confirm the sample' },
          ]}
        />
      ),
    },
    {
      title: 'Any step',
      code: '<Steps label="Checkout" linear={false} items={items} />',
      children: (
        <Steps
          label="Checkout"
          linear={false}
          defaultValue="account"
          items={[
            { id: 'account', title: 'Account' },
            { id: 'billing', title: 'Billing' },
            { id: 'review', title: 'Review' },
          ]}
        />
      ),
    },
  ],
  pagination: [
    { title: 'First page', code: '<Pagination page={1} pageCount={8} />', children: <PageSample page={1} pageCount={8} /> },
    { title: 'Middle page', code: '<Pagination page={4} pageCount={8} />', children: <PageSample page={4} pageCount={8} /> },
    { title: 'Last page', code: '<Pagination page={8} pageCount={8} />', children: <PageSample page={8} pageCount={8} /> },
  ],
  calendar: [
    { title: 'Selected day', code: '<Calendar value={new Date(2026, 9, 27)} />', children: <Calendar value={new Date(2026, 9, 27)} /> },
    { title: 'Persian calendar', code: '<Calendar calendar="persian" locale="fa" value={new Date(2026, 9, 27)} />', children: <Calendar calendar="persian" locale="fa" value={new Date(2026, 9, 27)} /> },
    {
      title: 'Marked range',
      code: '<Calendar rangeStart={start} rangeEnd={end} />',
      children: <Calendar value={new Date(2026, 9, 14)} rangeStart={new Date(2026, 9, 12)} rangeEnd={new Date(2026, 9, 18)} />,
    },
  ],
  'chart-container': [
    {
      title: 'Five days',
      code: '<ChartContainer title="Sample volume" data={[{ label: "Mon", value: 12 }]} />',
      children: (
        <ChartContainer
          title="Sample volume"
          description="Fixture values for the docs preview."
          data={[
            { label: 'Mon', value: 12 },
            { label: 'Tue', value: 18 },
            { label: 'Wed', value: 9 },
            { label: 'Thu', value: 15 },
            { label: 'Fri', value: 21 },
          ]}
        />
      ),
    },
    {
      title: 'One bar',
      code: '<ChartContainer title="Today" data={[{ label: "Today", value: 8 }]} />',
      children: <ChartContainer title="Today" data={[{ label: 'Today', value: 8 }]} />,
    },
    {
      title: 'Uneven values',
      code: '<ChartContainer title="Sample volume" data={[{ label: "Low", value: 1 }, { label: "High", value: 40 }]} />',
      children: (
        <ChartContainer
          title="Sample volume"
          data={[
            { label: 'Low', value: 1 },
            { label: 'Mid', value: 9 },
            { label: 'High', value: 40 },
          ]}
        />
      ),
    },
  ],
  'empty-state': [
    { title: 'Title only', code: '<EmptyState title="No invoices" />', children: <EmptyState title="No invoices" /> },
    {
      title: 'With description',
      code: '<EmptyState title="No invoices" description="Create the first invoice to see it here." />',
      children: <EmptyState title="No invoices" description="Create the first invoice to see it here." />,
    },
    {
      title: 'With action',
      code: '<EmptyState title="No invoices"><Button>New invoice</Button></EmptyState>',
      children: (
        <EmptyState title="No invoices" description="Create the first invoice to see it here.">
          <Button>New invoice</Button>
        </EmptyState>
      ),
    },
  ],
  navbar: [
    {
      title: 'Current item',
      code: '<Navbar brand="White Plumeria" items={[{ href: "#docs", label: "Docs", current: true }]} />',
      children: (
        <Navbar
          brand="White Plumeria"
          items={[
            { href: '#docs', label: 'Docs', current: true },
            { href: '#themes', label: 'Themes' },
            { href: '#components', label: 'Components' },
          ]}
        />
      ),
    },
    {
      title: 'Many items',
      code: '<Navbar brand="White Plumeria" items={items} />',
      children: (
        <Navbar
          brand="White Plumeria"
          items={[
            { href: '#docs', label: 'Docs', current: true },
            { href: '#themes', label: 'Themes' },
            { href: '#components', label: 'Components' },
            { href: '#ai', label: 'AI' },
            { href: '#install', label: 'Install' },
          ]}
        />
      ),
    },
  ],
  sidebar: [
    {
      title: 'Current link',
      code: '<Sidebar label="Docs" items={[{ href: "#button", label: "Button", current: true }]} />',
      children: (
        <Sidebar
          label="Docs"
          items={[
            { href: '#button', label: 'Button', current: true },
            { href: '#card', label: 'Card' },
            { href: '#table', label: 'Table' },
          ]}
        />
      ),
    },
    {
      title: 'Long list',
      code: '<Sidebar label="Docs" items={items} />',
      children: (
        <Sidebar
          label="Docs"
          items={['Button', 'Card', 'Input', 'Table', 'Toast', 'Carousel'].map((label, index) => ({
            href: `#${label.toLowerCase()}`,
            label,
            current: index === 0,
          }))}
        />
      ),
    },
  ],
  'navigation-menu': [
    {
      title: 'Current link',
      code: '<NavigationMenu label="Primary" items={[{ href: "#start", label: "Start", current: true }]} />',
      children: (
        <NavigationMenu
          label="Primary"
          items={[
            { href: '#start', label: 'Start', current: true },
            { href: '#install', label: 'Install' },
            { href: '#themes', label: 'Themes' },
          ]}
        />
      ),
    },
    {
      title: 'Two links',
      code: '<NavigationMenu label="Primary" items={[{ href: "#start", label: "Start" }, { href: "#install", label: "Install", current: true }]} />',
      children: (
        <NavigationMenu
          label="Primary"
          items={[
            { href: '#start', label: 'Start' },
            { href: '#install', label: 'Install', current: true },
          ]}
        />
      ),
    },
  ],
  breadcrumb: [
    {
      title: 'Three crumbs',
      code: '<Breadcrumb items={[{ href: "/", label: "Home" }, { href: "/components", label: "Components" }, { label: "Button" }]} />',
      children: (
        <Breadcrumb
          items={[
            { href: '/', label: 'Home' },
            { href: '/components', label: 'Components' },
            { label: 'Button' },
          ]}
        />
      ),
    },
    {
      title: 'Two crumbs',
      code: '<Breadcrumb items={[{ href: "/", label: "Home" }, { label: "Button" }]} />',
      children: (
        <Breadcrumb
          items={[
            { href: '/', label: 'Home' },
            { label: 'Button' },
          ]}
        />
      ),
    },
  ],
  list: [
    {
      title: 'Title, description, meta',
      code: '<List items={[{ id: "1", title: "Invoice 1042", description: "Paper Press", meta: "Paid" }]} />',
      children: (
        <List
          items={[
            { id: '1', title: 'Invoice 1042', description: 'Paper Press', meta: 'Paid' },
            { id: '2', title: 'Invoice 1043', description: 'Lagoon Freight', meta: 'Due' },
          ]}
        />
      ),
    },
    {
      title: 'Title only',
      code: '<List items={[{ id: "1", title: "Invoice 1042" }]} />',
      children: <List items={[{ id: '1', title: 'Invoice 1042' }, { id: '2', title: 'Invoice 1043' }]} />,
    },
  ],
  'tree-view': [
    {
      title: 'Expanded folder',
      code: '<TreeView label="Files" defaultExpanded={["src"]} nodes={nodes} />',
      children: (
        <TreeView
          label="Files"
          defaultExpanded={['src']}
          nodes={[
            { id: 'src', label: 'src', children: [{ id: 'button', label: 'Button.tsx' }, { id: 'card', label: 'Card.tsx' }] },
            { id: 'package', label: 'package.json' },
          ]}
        />
      ),
    },
    {
      title: 'Collapsed',
      code: '<TreeView label="Files" nodes={nodes} />',
      children: (
        <TreeView
          label="Files"
          nodes={[
            { id: 'src', label: 'src', children: [{ id: 'button', label: 'Button.tsx' }] },
            { id: 'package', label: 'package.json' },
          ]}
        />
      ),
    },
  ],
  'stat-card': [
    { title: 'With hint', code: '<StatCard label="Open invoices" value="12" hint="Sample data" />', children: <StatCard label="Open invoices" value="12" hint="Sample data" /> },
    { title: 'Value only', code: '<StatCard label="Open invoices" value="12" />', children: <StatCard label="Open invoices" value="12" /> },
    { title: 'Currency value', code: '<StatCard label="Due this week" value="EUR 4,280" hint="Sample data" />', children: <StatCard label="Due this week" value="EUR 4,280" hint="Sample data" /> },
  ],
  timeline: [
    {
      title: 'Three events',
      code: '<Timeline items={[{ id: "1", title: "Draft saved", time: "09:40" }]} />',
      children: (
        <Timeline
          items={[
            { id: '1', title: 'Draft saved', time: '09:40', dateTime: '2026-10-27T09:40' },
            { id: '2', title: 'Sent for review', time: '11:15', dateTime: '2026-10-27T11:15' },
            { id: '3', title: 'Marked paid', time: '16:02', dateTime: '2026-10-27T16:02' },
          ]}
        />
      ),
    },
    {
      title: 'One event',
      code: '<Timeline items={[{ id: "1", title: "Draft saved", time: "09:40" }]} />',
      children: <Timeline items={[{ id: '1', title: 'Draft saved', time: '09:40', dateTime: '2026-10-27T09:40' }]} />,
    },
  ],
  container: [
    { title: 'Small', code: '<Container size="sm">Content</Container>', children: <Container size="sm"><Card title="Small measure">The column stops at the small content width.</Card></Container> },
    { title: 'Medium', code: '<Container size="md">Content</Container>', children: <Container size="md"><Card title="Medium measure">A wider reading column.</Card></Container> },
    { title: 'Large', code: '<Container size="lg">Content</Container>', children: <Container size="lg"><Card title="Large measure">The default content width.</Card></Container> },
  ],
  stack: [
    { title: 'Small gap', code: '<Stack gap="sm"><Button>Save</Button><Button variant="ghost">Cancel</Button></Stack>', children: <Stack gap="sm"><Button>Save</Button><Button variant="ghost">Cancel</Button></Stack> },
    { title: 'Large gap', code: '<Stack gap="lg"><Button>Save</Button><Button variant="ghost">Cancel</Button></Stack>', children: <Stack gap="lg"><Button>Save</Button><Button variant="ghost">Cancel</Button></Stack> },
  ],
  flex: [
    { title: 'Start', code: '<Flex><span>Total</span><strong>EUR 120</strong></Flex>', children: <Flex><span>Total</span><strong>EUR 120</strong></Flex> },
    { title: 'Between', code: '<Flex justify="between"><span>Total</span><strong>EUR 120</strong></Flex>', children: <Flex justify="between"><span>Total</span><strong>EUR 120</strong></Flex> },
    { title: 'End', code: '<Flex justify="end"><Button size="sm">Save</Button></Flex>', children: <Flex justify="end"><Button size="sm">Save</Button></Flex> },
    { title: 'Wrap', code: '<Flex wrap><Badge>Paid</Badge><Badge>Due</Badge></Flex>', children: <Flex wrap><Badge variant="success">Paid</Badge><Badge variant="warning">Due</Badge><Badge>Review</Badge></Flex> },
  ],
  'page-header': [
    {
      title: 'Title, description, action',
      code: '<PageHeader title="Invoices" description="Sample workspace" actions={<Button size="sm">New invoice</Button>} />',
      children: <PageHeader title="Invoices" description="Sample workspace" actions={<Button size="sm">New invoice</Button>} />,
    },
    { title: 'Title only', code: '<PageHeader title="Invoices" />', children: <PageHeader title="Invoices" /> },
  ],
  footer: [
    { title: 'Note', code: '<Footer note="MIT License" />', children: <Footer note="MIT License" /> },
    { title: 'Note and extra', code: '<Footer note="MIT License"><span>Sample workspace</span></Footer>', children: <Footer note="MIT License"><span>Sample workspace</span></Footer> },
  ],
  'responsive-layout': [
    {
      title: 'Sidebar and main',
      code: '<ResponsiveLayout sidebar={<Sidebar label="Docs" items={items} />}>Main column</ResponsiveLayout>',
      children: (
        <ResponsiveLayout sidebar={<Sidebar label="Docs" items={[{ href: '#button', label: 'Button', current: true }, { href: '#card', label: 'Card' }]} />}>
          Main column
        </ResponsiveLayout>
      ),
    },
    {
      title: 'Longer navigation',
      code: '<ResponsiveLayout sidebar={<Sidebar label="Docs" items={items} />}>Main column</ResponsiveLayout>',
      children: (
        <ResponsiveLayout
          sidebar={
            <Sidebar
              label="Docs"
              items={['Button', 'Table', 'Toast', 'Carousel'].map((label, index) => ({
                href: `#${label.toLowerCase()}`,
                label,
                current: index === 1,
              }))}
            />
          }
        >
          <Card title="Main">The sidebar is the real Sidebar component.</Card>
        </ResponsiveLayout>
      ),
    },
  ],
  'split-pane': [
    { title: 'Notes and preview', code: '<SplitPane label="Resize editor" start={<p>Notes</p>} end={<p>Preview</p>} />', children: <SplitPane label="Resize editor" start={<p>Notes</p>} end={<p>Preview</p>} /> },
    { title: 'Narrow start', code: '<SplitPane label="Resize editor" size={28} start={<p>Notes</p>} end={<p>Preview</p>} />', children: <SplitPane label="Resize editor" size={28} start={<p>Notes</p>} end={<p>Preview</p>} /> },
  ],
  slider: [
    { title: 'Middle', code: '<Slider label="Volume" defaultValue={40} />', children: <Slider label="Volume" defaultValue={40} /> },
    { title: 'Minimum', code: '<Slider label="Volume" defaultValue={0} />', children: <Slider label="Volume" min={0} max={100} defaultValue={0} /> },
    { title: 'Maximum', code: '<Slider label="Volume" defaultValue={100} />', children: <Slider label="Volume" defaultValue={100} /> },
  ],
  'radio-group': [
    {
      title: 'Selected',
      code: '<RadioGroup label="Plan" name="plan" defaultValue="annual" options={options} />',
      children: <RadioGroup label="Plan" name="plan-a" defaultValue="annual" options={[{ value: 'annual', label: 'Annual' }, { value: 'month', label: 'Monthly' }]} />,
    },
    {
      title: 'Disabled option',
      code: '<RadioGroup options={[{ value: "soon", label: "Coming later", disabled: true }]} />',
      children: (
        <RadioGroup
          label="Plan"
          name="plan-b"
          defaultValue="annual"
          options={[
            { value: 'annual', label: 'Annual' },
            { value: 'soon', label: 'Coming later', disabled: true },
          ]}
        />
      ),
    },
  ],
  'toggle-group': [
    {
      title: 'Three choices',
      code: '<ToggleGroup label="Density" defaultValue="cozy" options={options} />',
      children: (
        <ToggleGroup
          label="Density"
          defaultValue="cozy"
          options={[
            { value: 'compact', label: 'Compact' },
            { value: 'cozy', label: 'Cozy' },
            { value: 'wide', label: 'Wide' },
          ]}
        />
      ),
    },
    {
      title: 'Two choices',
      code: '<ToggleGroup label="Scheme" defaultValue="light" options={[{ value: "light", label: "Light" }, { value: "dark", label: "Dark" }]} />',
      children: (
        <ToggleGroup
          label="Scheme"
          defaultValue="light"
          options={[
            { value: 'light', label: 'Light' },
            { value: 'dark', label: 'Dark' },
          ]}
        />
      ),
    },
  ],
  label: [
    { title: 'Plain', code: '<Label htmlFor="email">Email</Label>', children: <Label htmlFor="sample-email">Email</Label> },
    { title: 'Required', code: '<Label htmlFor="email" required>Email</Label>', children: <Label htmlFor="sample-email-required" required>Email</Label> },
  ],
  'form-field': [
    {
      title: 'Hint',
      code: '<FormField label="Work email" hint="Use the company address."><Input /></FormField>',
      children: (
        <FormField label="Work email" hint="Use the company address.">
          <Input placeholder="ada@example.com" />
        </FormField>
      ),
    },
    {
      title: 'Required',
      code: '<FormField label="Work email" required><Input /></FormField>',
      children: (
        <FormField label="Work email" required>
          <Input placeholder="ada@example.com" />
        </FormField>
      ),
    },
    {
      title: 'Error',
      code: '<FormField label="Work email" error="Enter a valid email."><Input /></FormField>',
      children: (
        <FormField label="Work email" error="Enter a valid email.">
          <Input defaultValue="ada" />
        </FormField>
      ),
    },
  ],
  'form-message': [
    { title: 'Hint', code: '<FormMessage>Use the company address.</FormMessage>', children: <FormMessage>Use the company address.</FormMessage> },
    { title: 'Error', code: '<FormMessage tone="error">Enter a valid email.</FormMessage>', children: <FormMessage tone="error">Enter a valid email.</FormMessage> },
  ],
  'validation-message': [
    { title: 'Short', code: '<ValidationMessage>Enter a valid email.</ValidationMessage>', children: <ValidationMessage>Enter a valid email.</ValidationMessage> },
    { title: 'Longer', code: '<ValidationMessage>Enter a work email that includes a domain.</ValidationMessage>', children: <ValidationMessage>Enter a work email that includes a domain.</ValidationMessage> },
  ],
  combobox: [
    {
      title: 'Closed',
      code: '<Combobox label="City" options={[{ value: "fra", label: "Frankfurt" }]} />',
      children: <Combobox label="City" options={[{ value: 'fra', label: 'Frankfurt' }, { value: 'ber', label: 'Berlin' }]} />,
    },
    {
      title: 'Open',
      code: '<Combobox label="City" defaultOpen options={options} />',
      children: (
        <Combobox
          label="City"
          defaultOpen
          options={[
            { value: 'fra', label: 'Frankfurt' },
            { value: 'ber', label: 'Berlin' },
            { value: 'ham', label: 'Hamburg' },
          ]}
        />
      ),
    },
  ],
  'search-input': [
    { title: 'Empty', code: '<SearchInput label="Search docs" />', children: <SearchInput label="Search docs" /> },
    { title: 'With a value', code: '<SearchInput label="Search docs" defaultValue="Button" />', children: <SearchInput label="Search docs" defaultValue="Button" /> },
  ],
  'file-upload': [
    { title: 'One file', code: '<FileUpload label="Statement PDF" accept="application/pdf" />', children: <FileUpload label="Statement PDF" accept="application/pdf" maxSize={2_000_000} /> },
    { title: 'Several files', code: '<FileUpload label="Attachments" multiple />', children: <FileUpload label="Attachments" multiple /> },
  ],
  'password-field': [
    { title: 'Hidden', code: '<PasswordField label="Password" name="password" />', children: <PasswordField label="Password" name="password" /> },
    { title: 'Invalid', code: '<PasswordField label="Password" invalid />', children: <PasswordField label="Password" name="password-invalid" invalid /> },
    { title: 'Disabled', code: '<PasswordField label="Password" disabled />', children: <PasswordField label="Password" name="password-disabled" disabled /> },
  ],
  'otp-field': [
    { title: 'Six cells', code: '<OtpField label="Verification code" length={6} />', children: <OtpField label="Verification code" name="code" length={6} /> },
    { title: 'Four cells', code: '<OtpField label="PIN" length={4} />', children: <OtpField label="PIN" name="pin" length={4} /> },
  ],
  rating: [
    { title: 'Interactive', code: '<Rating label="Workspace quality" defaultValue={4} />', children: <Rating label="Workspace quality" name="quality" defaultValue={4} /> },
    { title: 'Read only', code: '<Rating label="Workspace quality" defaultValue={3} readOnly />', children: <Rating label="Workspace quality" name="quality-read" defaultValue={3} readOnly /> },
    { title: 'Empty', code: '<Rating label="Workspace quality" />', children: <Rating label="Workspace quality" name="quality-empty" /> },
  ],
  'number-field': [
    { title: 'Default', code: '<NumberField label="Guests" min={1} max={8} defaultValue={2} />', children: <NumberField label="Guests" name="guests" min={1} max={8} defaultValue={2} /> },
    { title: 'At the minimum', code: '<NumberField label="Guests" min={1} max={8} defaultValue={1} />', children: <NumberField label="Guests" name="guests-min" min={1} max={8} defaultValue={1} /> },
    { title: 'Disabled', code: '<NumberField label="Guests" disabled defaultValue={2} />', children: <NumberField label="Guests" name="guests-disabled" min={1} max={8} defaultValue={2} disabled /> },
  ],
  dialog: [
    {
      title: 'Confirm',
      code: '<Dialog title="Discard draft?"><p>Unsaved notes will be lost.</p></Dialog>',
      children: (
        <OpenDialog title="Discard draft?" label="Open dialog">
          <p>Unsaved notes will be lost.</p>
        </OpenDialog>
      ),
    },
    {
      title: 'With footer actions',
      code: '<Dialog title="Discard draft?" footer={<Button>Discard</Button>}><p>Unsaved notes will be lost.</p></Dialog>',
      children: (
        <OpenDialog title="Discard draft?" label="Open dialog with actions" footer={<Button size="sm">Discard</Button>}>
          <p>Unsaved notes will be lost. The footer is part of the dialog.</p>
        </OpenDialog>
      ),
    },
  ],
  modal: [
    {
      title: 'Same panel as Dialog',
      code: '<Modal title="Discard draft?"><p>Unsaved notes will be lost.</p></Modal>',
      children: (
        <OpenDialog title="Review changes?" label="Open modal" Panel={Modal}>
          <p>Modal uses the dialog component. It is not a separate package.</p>
        </OpenDialog>
      ),
    },
    {
      title: 'With footer',
      code: '<Modal title="Review changes?" footer={<Button>Keep</Button>} />',
      children: (
        <OpenDialog title="Review changes?" label="Open modal with actions" Panel={Modal} footer={<Button size="sm">Keep</Button>}>
          <p>The footer action stays inside the panel.</p>
        </OpenDialog>
      ),
    },
  ],
  drawer: [
    { title: 'End side', code: '<Drawer side="end" title="Filters" />', children: <OpenDrawer side="end" /> },
    { title: 'Start side', code: '<Drawer side="start" title="Filters" />', children: <OpenDrawer side="start" /> },
  ],
  popover: [
    {
      title: 'Closed',
      code: '<Popover label="Details"><p>Settles on the next business day.</p></Popover>',
      children: (
        <Popover label="Details">
          <p>Settles on the next business day.</p>
        </Popover>
      ),
    },
    {
      title: 'Open',
      code: '<Popover label="Details" defaultOpen><p>Settles on the next business day.</p></Popover>',
      children: (
        <Popover label="Fees" defaultOpen>
          <p>No monthly fee in this sample.</p>
        </Popover>
      ),
    },
  ],
  tooltip: [
    {
      title: 'On a button',
      code: '<Tooltip content="Copy token"><Button variant="ghost">Copy</Button></Tooltip>',
      children: (
        <Tooltip content="Copy token">
          <Button variant="ghost">Copy</Button>
        </Tooltip>
      ),
    },
    {
      title: 'On text',
      code: '<Tooltip content="Sample only"><span>Hover</span></Tooltip>',
      children: (
        <Tooltip content="Sample only">
          <Button variant="outline" size="sm">
            Hover or focus
          </Button>
        </Tooltip>
      ),
    },
  ],
  'command-palette': [
    {
      title: 'Two groups',
      code: '<CommandPalette commands={[{ id: "docs", label: "Open docs", group: "Navigate" }]} />',
      children: (
        <OpenCommands
          commands={[
            { id: 'docs', label: 'Open docs', group: 'Navigate' },
            { id: 'theme', label: 'Switch theme', group: 'View', keywords: ['dark', 'ivory'] },
          ]}
        />
      ),
    },
    {
      title: 'One command',
      code: '<CommandPalette commands={[{ id: "docs", label: "Open docs" }]} />',
      children: <OpenCommands commands={[{ id: 'docs', label: 'Open docs' }]} />,
    },
  ],
  link: [
    { title: 'Text link', code: '<Link href="#button">Button</Link>', children: <Link href="#button">Button</Link> },
    { title: 'In a sentence', code: '<p>Read the <Link href="#table">table</Link> samples.</p>', children: <p>Read the <Link href="#table">table</Link> samples.</p> },
  ],
  divider: [
    { title: 'Plain rule', code: '<Divider />', children: <Divider /> },
    { title: 'Labeled', code: '<Divider label="Or" />', children: <Divider label="Or" /> },
  ],
  separator: [
    { title: 'Horizontal', code: '<Separator />', children: <Separator /> },
    {
      title: 'Vertical',
      code: '<Separator orientation="vertical" />',
      children: (
        <div className="wpl-flex" style={{ minHeight: '2.5rem' }}>
          <span>Left</span>
          <Separator orientation="vertical" />
          <span>Right</span>
        </div>
      ),
    },
  ],
  skeleton: [
    { title: 'Text lines', code: '<Skeleton width="12rem" height="1rem" />', children: <div className="wpl-stack" style={{ width: 'min(100%, 18rem)' }}><Skeleton width="40%" height="0.8rem" /><Skeleton width="100%" height="0.8rem" /></div> },
    { title: 'Block', code: '<Skeleton width="100%" height="4.5rem" />', children: <Skeleton width="100%" height="4.5rem" /> },
    { title: 'Short line', code: '<Skeleton width="6rem" height="0.8rem" />', children: <Skeleton width="6rem" height="0.8rem" /> },
  ],
};

export function sampleTitles(slug: string): string[] {
  return (samples[slug] ?? []).map((sample) => sample.title);
}

export function SampleGallery({ slug }: { slug: string }) {
  const list = samples[slug];
  if (!list?.length) return null;
  return (
    <>
      {list.map((sample, index) => (
        <Preview key={sample.title} title={sample.title} code={sample.code} open={index === 0}>
          {sample.children}
        </Preview>
      ))}
    </>
  );
}
