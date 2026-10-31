import { useState, type ReactNode } from 'react';
import {
  Accordion,
  Alert,
  Avatar,
  Badge,
  Breadcrumb,
  Button,
  ButtonGroup,
  Calendar,
  Carousel,
  Card,
  ChartContainer,
  Checkbox,
  Combobox,
  CommandPalette,
  Container,
  ContextMenu,
  DataTable,
  DatePicker,
  DateRangePicker,
  Dialog,
  Divider,
  Drawer,
  DropdownMenu,
  EmptyState,
  FileUpload,
  Flex,
  Footer,
  FormField,
  FormMessage,
  Grid,
  IconButton,
  Kbd,
  Input,
  Label,
  Link,
  List,
  Navbar,
  NavigationMenu,
  Notification,
  NumberField,
  PageHeader,
  ResponsiveLayout,
  OtpField,
  Pagination,
  PasswordField,
  Popover,
  Progress,
  RadioGroup,
  RangeSlider,
  ToggleGroup,
  Rating,
  SearchInput,
  Select,
  Separator,
  Sidebar,
  Skeleton,
  Slider,
  Spinner,
  SplitPane,
  Steps,
  Stack,
  StatCard,
  Switch,
  Table,
  Tabs,
  Textarea,
  Timeline,
  Tooltip,
  TreeView,
  useToast,
  ValidationMessage,
} from '@white-plumeria/react';

const sampleRows = [
  { id: '1042', merchant: 'Paper Press', amount: 180, status: 'Paid' },
  { id: '1043', merchant: 'Lagoon Freight', amount: 960, status: 'Due' },
  { id: '1044', merchant: 'Saffron Ledger', amount: 40, status: 'Review' },
];

function NotificationDemo() {
  const [open, setOpen] = useState(true);
  return (
    <div className="wpl-stack" style={{ width: '100%' }}>
      <Notification variant="info" title="New statement" description="March is ready to review." />
      <Notification variant="success" title="Saved" description="The sample stayed in this tab." />
      <Notification variant="warning" title="Review" description="Two fields are incomplete." />
      {open ? (
        <Notification
          variant="danger"
          title="Blocked"
          description="This action did not run."
          onDismiss={() => setOpen(false)}
        />
      ) : (
        <Button size="sm" variant="ghost" onClick={() => setOpen(true)}>
          Show blocked notice
        </Button>
      )}
    </div>
  );
}

function ToastDemo() {
  const toast = useToast();
  return (
    <Button
      onClick={() =>
        toast.push({
          title: 'Saved',
          description: 'Sample toast, not a server response.',
          variant: 'success',
        })
      }
    >
      Push toast
    </Button>
  );
}

function DialogDemo() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button onClick={() => setOpen(true)}>Open dialog</Button>
      <Dialog
        open={open}
        onOpenChange={setOpen}
        title="Discard draft?"
        description="Unsaved notes will be lost."
      >
        <p>
          This dialog traps focus when the native dialog API is unavailable and restores it on
          close.
        </p>
      </Dialog>
    </>
  );
}

const still = (file: string) => `${import.meta.env.BASE_URL}${file}`;

export const themeSlides = [
  {
    id: 'white',
    label: 'White',
    src: still('carousel/white.jpg'),
    alt: 'White plumeria flowers with yellow centers resting on pale stone',
    caption: 'Neutral white and ink. The default palette, in light and dark.',
  },
  {
    id: 'ivory',
    label: 'Ivory',
    src: still('carousel/ivory.jpg'),
    alt: 'A cream ceramic cup of tea and dried grass on ivory linen',
    caption: 'Warm paper, brass, and ink.',
  },
  {
    id: 'ink',
    label: 'Ink',
    src: still('carousel/ink.jpg'),
    alt: 'A brass lamp glowing against deep blue linen',
    caption: 'Letterpress contrast: near-black type and strong rules.',
  },
  {
    id: 'saffron',
    label: 'Saffron',
    src: still('carousel/saffron.jpg'),
    alt: 'Saffron threads and a halved blood orange on a walnut table',
    caption: 'Editorial saffron for dense dashboards.',
  },
  {
    id: 'lagoon',
    label: 'Lagoon',
    src: still('carousel/lagoon.jpg'),
    alt: 'Clear turquoise water over pale sand and smooth stones',
    caption: 'Cool sand and deep teal.',
  },
  {
    id: 'blush',
    label: 'Blush',
    src: still('carousel/blush.jpg'),
    alt: 'A coral-pink flower and blush linen on pale stone',
    caption: 'Stone and coral, still formal.',
  },
];

export const themeCarouselCode = `<Carousel
  label="Theme stills"
  loop
  slides={[
${themeSlides
  .map(
    (slide) => `    {
      id: "${slide.id}",
      label: "${slide.label}",
      src: "${slide.src}",
      alt: "${slide.alt}",
      caption: "${slide.caption}",
    },`,
  )
  .join('\n')}
  ]}
/>`;

export function ThemeCarousel() {
  return <Carousel label="Theme stills" loop slides={themeSlides} />;
}

export function renderDemo(slug: string): ReactNode {
  switch (slug) {
    case 'button':
      return <Button variant="primary">Save changes</Button>;
    case 'icon-button':
      return <IconButton label="Close" />;
    case 'button-group':
      return (
        <ButtonGroup label="Save options">
          <Button>Save</Button>
          <Button variant="secondary">Draft</Button>
        </ButtonGroup>
      );
    case 'link':
      return <Link href="#install">Installation</Link>;
    case 'badge':
      return <Badge variant="success">Paid</Badge>;
    case 'avatar':
      return <Avatar name="Laleh Karimi" status="online" statusLabel="Online" />;
    case 'card':
      return (
        <Card title="Analytics" description="Overview of recent activity">
          Updated today
        </Card>
      );
    case 'divider':
      return <Divider label="Or" />;
    case 'separator':
      return (
        <Flex>
          <span>Left</span>
          <Separator orientation="vertical" />
          <span>Right</span>
        </Flex>
      );
    case 'spinner':
      return <Spinner label="Saving" />;
    case 'skeleton':
      return <Skeleton width="12rem" height="1rem" />;
    case 'progress':
      return <Progress label="Upload" value={40} />;
    case 'empty-state':
      return (
        <EmptyState title="No invoices" description="Create the first invoice to see it here.">
          <Button size="sm">New invoice</Button>
        </EmptyState>
      );
    case 'alert':
      return (
        <Alert variant="warning" title="Review needed">
          Two fields are incomplete.
        </Alert>
      );
    case 'input':
      return <Input name="email" type="email" placeholder="ada@example.com" />;
    case 'textarea':
      return <Textarea name="note" rows={3} placeholder="Note" />;
    case 'select':
      return (
        <Select
          name="currency"
          options={[
            { value: 'eur', label: 'EUR' },
            { value: 'usd', label: 'USD' },
          ]}
        />
      );
    case 'checkbox':
      return <Checkbox label="Email me invoices" name="email" />;
    case 'radio-group':
      return (
        <RadioGroup
          label="Plan"
          name="plan"
          options={[
            { value: 'annual', label: 'Annual' },
            { value: 'month', label: 'Monthly' },
          ]}
        />
      );
    case 'toggle-group':
      return (
        <ToggleGroup
          label="Appearance"
          name="appearance"
          defaultValue="light"
          options={[
            { value: 'light', label: 'Light' },
            { value: 'dark', label: 'Dark' },
            { value: 'system', label: 'System', disabled: true },
          ]}
        />
      );
    case 'switch':
      return <Switch label="Reduced motion" />;
    case 'slider':
      return <Slider label="Volume" defaultValue={40} />;
    case 'range-slider':
      return (
        <RangeSlider label="Price" min={0} max={500} step={10} defaultStart={80} defaultEnd={320} />
      );
    case 'label':
      return (
        <Label htmlFor="demo-email" required>
          Email
        </Label>
      );
    case 'form-field':
      return (
        <FormField label="Email" error="Enter a valid email">
          <Input type="email" />
        </FormField>
      );
    case 'form-message':
      return <FormMessage tone="hint">Used for the next statement.</FormMessage>;
    case 'validation-message':
      return <ValidationMessage>Amount must be positive.</ValidationMessage>;
    case 'combobox':
      return (
        <Combobox
          label="City"
          options={[
            { value: 'fra', label: 'Frankfurt' },
            { value: 'ber', label: 'Berlin' },
          ]}
        />
      );
    case 'search-input':
      return <SearchInput label="Search docs" />;
    case 'file-upload':
      return <FileUpload label="Statement PDF" accept="application/pdf" maxSize={2_000_000} />;
    case 'dialog':
    case 'modal':
      return <DialogDemo />;
    case 'drawer':
      return <DrawerDemo />;
    case 'popover':
      return (
        <Popover label="Details">
          <p>Settles on the next business day.</p>
        </Popover>
      );
    case 'tooltip':
      return (
        <Tooltip content="Copy token">
          <Button variant="ghost">Copy</Button>
        </Tooltip>
      );
    case 'dropdown-menu':
      return (
        <DropdownMenu
          label="Account"
          items={[
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
          ]}
        />
      );
    case 'tabs':
      return (
        <Tabs
          tabs={[
            { id: 'overview', label: 'Overview', panel: 'Balances for the sample workspace.' },
            { id: 'activity', label: 'Activity', panel: 'No live feed is connected.' },
          ]}
        />
      );
    case 'accordion':
      return (
        <Accordion
          items={[
            { id: 'fees', title: 'Fees', content: 'No monthly fee in this sample.' },
            { id: 'fx', title: 'FX', content: 'Rates are fixtures, not a live market.' },
            {
              id: 'close',
              title: 'Closing',
              content: 'Statements close on the last business day.',
            },
          ]}
        />
      );
    case 'toast':
      return <ToastDemo />;
    case 'notification':
      return <NotificationDemo />;
    case 'command-palette':
      return <CommandDemo />;
    case 'context-menu':
      return (
        <ContextMenu
          items={[
            { id: 'copy', label: 'Copy label' },
            {
              id: 'export',
              label: 'Export',
              items: [
                { id: 'csv', label: 'CSV' },
                { id: 'pdf', label: 'PDF' },
              ],
            },
          ]}
        >
          <Card title="Right-click or Shift+F10">This row has a supplemental menu.</Card>
        </ContextMenu>
      );
    case 'table':
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
            <tr>
              <td>GBP/USD</td>
              <td>1.27</td>
            </tr>
            <tr>
              <td>USD/JPY</td>
              <td>149.2</td>
            </tr>
          </tbody>
        </Table>
      );
    case 'data-table':
      return (
        <DataTable
          caption="Sample transactions"
          rows={sampleRows}
          columns={[
            { id: 'id', header: 'ID', accessor: (row) => row.id, text: (row) => row.id },
            {
              id: 'merchant',
              header: 'Merchant',
              accessor: (row) => row.merchant,
              text: (row) => row.merchant,
            },
            {
              id: 'amount',
              header: 'Amount',
              accessor: (row) => row.amount,
              text: (row) => String(row.amount),
              sortValue: (row) => row.amount,
            },
            {
              id: 'status',
              header: 'Status',
              accessor: (row) => <Badge>{row.status}</Badge>,
              text: (row) => row.status,
            },
          ]}
        />
      );
    case 'pagination':
      return <PaginationDemo />;
    case 'breadcrumb':
      return (
        <Breadcrumb
          items={[
            { href: '/', label: 'Home' },
            { href: '/components', label: 'Components' },
            { label: 'Button' },
          ]}
        />
      );
    case 'list':
      return (
        <List
          items={[
            { id: '1', title: 'Invoice 1042', description: 'Paper Press', meta: 'Paid' },
            { id: '2', title: 'Invoice 1043', description: 'Lagoon Freight', meta: 'Due' },
            { id: '3', title: 'Invoice 1044', description: 'Saffron Ledger', meta: 'Review' },
          ]}
        />
      );
    case 'tree-view':
      return (
        <TreeView
          label="Files"
          defaultExpanded={['src']}
          nodes={[
            {
              id: 'src',
              label: 'src',
              children: [
                { id: 'button', label: 'Button.tsx' },
                { id: 'card', label: 'Card.tsx' },
              ],
            },
            { id: 'package', label: 'package.json' },
          ]}
        />
      );
    case 'stat-card':
      return <StatCard label="Open invoices" value="12" hint="Sample data" />;
    case 'timeline':
      return (
        <Timeline
          items={[
            { id: '1', title: 'Draft saved', time: '09:40', dateTime: '2026-10-27T09:40' },
            { id: '2', title: 'Sent for review', time: '11:15', dateTime: '2026-10-27T11:15' },
            { id: '3', title: 'Marked paid', time: '16:02', dateTime: '2026-10-27T16:02' },
          ]}
        />
      );
    case 'calendar':
      return <Calendar value={new Date(2026, 9, 27)} />;
    case 'date-picker':
      return <DatePicker label="From" value="2026-10-27" />;
    case 'date-range-picker':
      return <DateRangeDemo />;
    case 'chart-container':
      return (
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
      );
    case 'container':
      return (
        <Container size="sm">
          <Card title="Small measure">The column stops at the small content width.</Card>
        </Container>
      );
    case 'grid':
      return (
        <Grid columns={3}>
          <Card title="One" />
          <Card title="Two" />
          <Card title="Three" />
        </Grid>
      );
    case 'stack':
      return (
        <Stack gap="sm">
          <Button>Save</Button>
          <Button variant="ghost">Cancel</Button>
        </Stack>
      );
    case 'flex':
      return (
        <div className="wpl-flex wpl-flex-between" style={{ width: '100%' }}>
          <span>Total</span>
          <strong>EUR 120</strong>
        </div>
      );
    case 'navbar':
      return (
        <Navbar
          brand="White Plumeria"
          items={[
            { href: '#docs', label: 'Docs', current: true },
            { href: '#themes', label: 'Themes' },
            { href: '#components', label: 'Components' },
            { href: '#ai', label: 'AI' },
          ]}
        />
      );
    case 'sidebar':
      return (
        <Sidebar
          label="Docs"
          items={[
            { href: '#button', label: 'Button', current: true },
            { href: '#card', label: 'Card' },
            { href: '#input', label: 'Input' },
            { href: '#table', label: 'Table' },
          ]}
        />
      );
    case 'navigation-menu':
      return (
        <NavigationMenu
          label="Primary"
          items={[
            { href: '#start', label: 'Start', current: true },
            { href: '#install', label: 'Install' },
          ]}
        />
      );
    case 'page-header':
      return (
        <PageHeader
          title="Invoices"
          description="Sample workspace"
          actions={<Button size="sm">New invoice</Button>}
        />
      );
    case 'footer':
      return (
        <Footer note="MIT License">
          <span>Sample workspace</span>
        </Footer>
      );
    case 'responsive-layout':
      return (
        <ResponsiveLayout
          sidebar={
            <Sidebar
              label="Docs"
              items={[
                { href: '#button', label: 'Button', current: true },
                { href: '#card', label: 'Card' },
              ]}
            />
          }
        >
          Main column
        </ResponsiveLayout>
      );
    case 'split-pane':
      return <SplitPane label="Resize editor" start={<p>Notes</p>} end={<p>Preview</p>} />;
    case 'steps':
      return <StepsDemo />;
    case 'carousel':
      return <ThemeCarousel />;
    case 'password-field':
      return <PasswordField label="Password" name="password" />;
    case 'otp-field':
      return <OtpField label="Verification code" name="code" length={6} />;
    case 'rating':
      return <Rating label="Workspace quality" name="quality" defaultValue={4} />;
    case 'number-field':
      return <NumberField label="Guests" name="guests" min={1} max={8} defaultValue={2} />;
    case 'kbd':
      return <Kbd keys={['Ctrl', 'K']} />;
    default:
      return <p>No live demo is registered for this slug.</p>;
  }
}

function DateRangeDemo() {
  const [range, setRange] = useState({
    start: '2026-10-12',
    end: '2026-10-18',
    startTime: '09:00',
    endTime: '18:00',
  });
  return (
    <DateRangePicker
      label="Stay"
      showTime
      start={range.start}
      end={range.end}
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
  );
}

function DrawerDemo() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button variant="secondary" onClick={() => setOpen(true)}>
        Open drawer
      </Button>
      <Drawer open={open} onOpenChange={setOpen} title="Filters" side="end">
        <p>
          Filters would be real form fields in an application. This drawer is the component, not a
          mock image.
        </p>
      </Drawer>
    </>
  );
}

function CommandDemo() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button variant="secondary" onClick={() => setOpen(true)}>
        Open commands
      </Button>
      <CommandPalette
        open={open}
        onOpenChange={setOpen}
        commands={[
          { id: 'docs', label: 'Open docs', group: 'Navigate' },
          { id: 'theme', label: 'Switch theme', group: 'View', keywords: ['dark', 'ivory'] },
        ]}
      />
    </>
  );
}

const checkoutSteps = [
  { id: 'account', title: 'Account', description: 'Email and name' },
  { id: 'billing', title: 'Billing', description: 'Payment method' },
  { id: 'review', title: 'Review', description: 'Confirm the sample' },
];

function StepsDemo() {
  const [value, setValue] = useState('account');
  const index = checkoutSteps.findIndex((item) => item.id === value);
  const next = checkoutSteps[index + 1];
  const previous = checkoutSteps[index - 1];
  return (
    <div className="wpl-stack" style={{ width: '100%' }}>
      <Steps label="Checkout" items={checkoutSteps} value={value} onValueChange={setValue} />
      <div className="wpl-flex">
        <Button
          variant="outline"
          size="sm"
          disabled={!previous}
          onClick={() => previous && setValue(previous.id)}
        >
          Back
        </Button>
        <Button size="sm" disabled={!next} onClick={() => next && setValue(next.id)}>
          Next
        </Button>
      </div>
    </div>
  );
}

function PaginationDemo() {
  const [page, setPage] = useState(1);
  return <Pagination page={page} pageCount={4} onPageChange={setPage} />;
}
