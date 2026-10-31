import { defineRegistered, defineTag, type DefineResult } from './element';
import { Accordion, Tabs } from './disclosure';
import { Button, ButtonGroup, IconButton } from './button';
import { Carousel } from './carousel';
import { Calendar, DatePicker, DateRangePicker } from './calendar';
import { Combobox } from './menu';
import { CommandPalette } from './command';
import {
  Breadcrumb,
  ChartContainer,
  DataTable,
  List,
  Pagination,
  Table,
  Timeline,
  TreeView,
} from './data';
import { Dialog, Drawer, Modal } from './dialog';
import {
  Alert,
  Avatar,
  Badge,
  Card,
  Divider,
  EmptyState,
  Kbd,
  Link,
  Notification,
  Progress,
  Separator,
  Skeleton,
  Spinner,
  StatCard,
} from './display';
import { FileUpload } from './file-upload';
import {
  Checkbox,
  FormField,
  FormMessage,
  Input,
  Label,
  RadioGroup,
  RangeSlider,
  SearchInput,
  Select,
  Slider,
  Switch,
  Textarea,
  ToggleGroup,
  ValidationMessage,
} from './form';
import { NumberField, OtpField, PasswordField, Rating } from './fields';
import { Icon, Mark } from './icon';
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
} from './layout';
import { ContextMenu, DropdownMenu, Popover, Tooltip } from './menu';
import { WhitePlumeriaProvider } from './provider';
import { Steps } from './steps';

export { Accordion, Tabs } from './disclosure';
export type { AccordionItem, TabItem } from './disclosure';
export { Button, ButtonGroup, IconButton } from './button';
export { Carousel } from './carousel';
export type { CarouselSlide } from './carousel';
export { Calendar, DatePicker, DateRangePicker } from './calendar';
export type { DateRangeValue, DateTimeRangeValue } from './calendar';
export { Combobox, ContextMenu, DropdownMenu, Popover, Tooltip } from './menu';
export type { ComboOption, MenuItem } from './menu';
export { CommandPalette } from './command';
export type { CommandItem } from './command';
export {
  Breadcrumb,
  ChartContainer,
  DataTable,
  List,
  Pagination,
  Table,
  Timeline,
  TreeView,
} from './data';
export type { ChartPoint, DataColumn, TimelineItem, TreeNode } from './data';
export { Dialog, Drawer, Modal } from './dialog';
export {
  Alert,
  Avatar,
  Badge,
  Card,
  Divider,
  EmptyState,
  Kbd,
  Link,
  Notification,
  Progress,
  Separator,
  Skeleton,
  Spinner,
  StatCard,
} from './display';
export { FileUpload } from './file-upload';
export type { RejectedFile } from './file-upload';
export {
  Checkbox,
  FormField,
  FormMessage,
  Input,
  Label,
  RadioGroup,
  RangeSlider,
  SearchInput,
  Select,
  Slider,
  Switch,
  Textarea,
  ToggleGroup,
  ValidationMessage,
} from './form';
export type { SelectOption } from './form';
export { NumberField, OtpField, PasswordField, Rating } from './fields';
export { Icon, Mark } from './icon';
export {
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
} from './layout';
export type { NavItem } from './layout';
export {
  pushToast,
  requireProvider,
  useLocale,
  useToast,
  useWhitePlumeria,
  WhitePlumeriaProvider,
} from './provider';
export type { ToastInput, ToastRecord } from './provider';
export { Steps } from './steps';
export type { StepItem } from './steps';
export { defineTag } from './element';
export type { DefineResult } from './element';

const tags: Array<[string, CustomElementConstructor]> = [
  ['wpl-accordion', Accordion],
  ['wpl-alert', Alert],
  ['wpl-avatar', Avatar],
  ['wpl-badge', Badge],
  ['wpl-breadcrumb', Breadcrumb],
  ['wpl-button', Button],
  ['wpl-button-group', ButtonGroup],
  ['wpl-calendar', Calendar],
  ['wpl-card', Card],
  ['wpl-carousel', Carousel],
  ['wpl-chart-container', ChartContainer],
  ['wpl-checkbox', Checkbox],
  ['wpl-combobox', Combobox],
  ['wpl-command-palette', CommandPalette],
  ['wpl-container', Container],
  ['wpl-context-menu', ContextMenu],
  ['wpl-data-table', DataTable],
  ['wpl-date-picker', DatePicker],
  ['wpl-date-range-picker', DateRangePicker],
  ['wpl-dialog', Dialog],
  ['wpl-divider', Divider],
  ['wpl-drawer', Drawer],
  ['wpl-dropdown-menu', DropdownMenu],
  ['wpl-empty-state', EmptyState],
  ['wpl-file-upload', FileUpload],
  ['wpl-flex', Flex],
  ['wpl-footer', Footer],
  ['wpl-form-field', FormField],
  ['wpl-form-message', FormMessage],
  ['wpl-grid', Grid],
  ['wpl-icon', Icon],
  ['wpl-icon-button', IconButton],
  ['wpl-input', Input],
  ['wpl-kbd', Kbd],
  ['wpl-label', Label],
  ['wpl-link', Link],
  ['wpl-list', List],
  ['wpl-mark', Mark],
  ['wpl-modal', Modal],
  ['wpl-navbar', Navbar],
  ['wpl-navigation-menu', NavigationMenu],
  ['wpl-notification', Notification],
  ['wpl-number-field', NumberField],
  ['wpl-otp-field', OtpField],
  ['wpl-page-header', PageHeader],
  ['wpl-pagination', Pagination],
  ['wpl-password-field', PasswordField],
  ['wpl-popover', Popover],
  ['wpl-progress', Progress],
  ['wpl-provider', WhitePlumeriaProvider],
  ['wpl-radio-group', RadioGroup],
  ['wpl-toggle-group', ToggleGroup],
  ['wpl-range-slider', RangeSlider],
  ['wpl-rating', Rating],
  ['wpl-responsive-layout', ResponsiveLayout],
  ['wpl-search-input', SearchInput],
  ['wpl-select', Select],
  ['wpl-separator', Separator],
  ['wpl-sidebar', Sidebar],
  ['wpl-skeleton', Skeleton],
  ['wpl-slider', Slider],
  ['wpl-spinner', Spinner],
  ['wpl-split-pane', SplitPane],
  ['wpl-stack', Stack],
  ['wpl-stat-card', StatCard],
  ['wpl-steps', Steps],
  ['wpl-switch', Switch],
  ['wpl-table', Table],
  ['wpl-tabs', Tabs],
  ['wpl-textarea', Textarea],
  ['wpl-timeline', Timeline],
  ['wpl-tooltip', Tooltip],
  ['wpl-tree-view', TreeView],
  ['wpl-validation-message', ValidationMessage],
];

export const litTags = tags.map(([tag]) => tag);

export function defineWhitePlumeria(): DefineResult {
  for (const [tag, ctor] of tags) defineTag(tag, ctor);
  return defineRegistered();
}
