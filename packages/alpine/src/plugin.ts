import {
  Accordion,
  Carousel,
  Combobox,
  CommandPalette,
  ContextMenu,
  Dialog,
  Drawer,
  DropdownMenu,
  FileUpload,
  Modal,
  Notification,
  Popover,
  Steps,
  Tabs,
  Toast,
  Tooltip,
} from './widgets.ts';
import {
  Button,
  ButtonGroup,
  Checkbox,
  FormField,
  FormMessage,
  IconButton,
  Input,
  Label,
  NumberField,
  OtpField,
  PasswordField,
  RadioGroup,
  RangeSlider,
  Rating,
  SearchInput,
  Select,
  Slider,
  Switch,
  Textarea,
  ToggleGroup,
  ValidationMessage,
} from './controls.ts';
import {
  Breadcrumb,
  Calendar,
  ChartContainer,
  DataTable,
  DatePicker,
  DateRangePicker,
  List,
  Pagination,
  Table,
  Timeline,
  TreeView,
} from './data.ts';
import {
  Alert,
  Avatar,
  Badge,
  Card,
  Divider,
  EmptyState,
  Kbd,
  Link,
  Progress,
  Separator,
  Skeleton,
  Spinner,
  StatCard,
} from './display.ts';
import {
  Container,
  Flex,
  Footer,
  Grid,
  Navbar,
  NavigationMenu,
  PageHeader,
  ResponsiveLayout,
  Sidebar,
  SplitPane,
  Stack,
} from './layout.ts';
import { WhitePlumeriaProvider } from './provider.ts';
import { runDestroy, type AlpineData, type Config, type Magic } from './runtime.ts';

export interface AlpineLike {
  plugin: (plugin: (alpine: AlpineLike) => void) => void;
  data: (name: string, callback: (config?: object) => object) => void;
  start: () => void;
  initTree: (element: Node) => void;
}

type Factory = (config?: Config) => AlpineData & Record<string, unknown>;

export const components = {
  Accordion,
  Alert,
  Avatar,
  Badge,
  Breadcrumb,
  Button,
  ButtonGroup,
  Calendar,
  Card,
  Carousel,
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
  Input,
  Kbd,
  Label,
  Link,
  List,
  Modal,
  Navbar,
  NavigationMenu,
  Notification,
  NumberField,
  OtpField,
  PageHeader,
  Pagination,
  PasswordField,
  Popover,
  Progress,
  RadioGroup,
  RangeSlider,
  Rating,
  ResponsiveLayout,
  SearchInput,
  Select,
  Separator,
  Sidebar,
  Skeleton,
  Slider,
  Spinner,
  SplitPane,
  Stack,
  StatCard,
  Steps,
  Switch,
  Table,
  Tabs,
  Textarea,
  ToggleGroup,
  Timeline,
  Toast,
  Tooltip,
  TreeView,
  ValidationMessage,
  WhitePlumeriaProvider,
} satisfies Record<string, Factory>;

const registered = new WeakSet<object>();

export function whitePlumeria(Alpine: AlpineLike): void {
  if (registered.has(Alpine)) return;
  registered.add(Alpine);
  for (const [name, factory] of Object.entries(components)) {
    Alpine.data(name, (config) => {
      const data: AlpineData & Record<string, unknown> = factory((config ?? {}) as Config);
      const destroy = data.destroy;
      data.destroy = function destroyComponent(this: Magic) {
        runDestroy(this.$el);
        destroy?.call(this);
      };
      return data;
    });
  }
}
