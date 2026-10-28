import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';

const root = new URL('../packages/svelte/src/lib/', import.meta.url);

const files = {
  'Link.svelte': `<script lang="ts">
  import type { Snippet } from 'svelte';
  import Icon from './Icon.svelte';
  let { href, external = false, children }: { href: string; external?: boolean; children?: Snippet } = $props();
</script>

<a class="wpl-link" {href} target={external ? '_blank' : undefined} rel={external ? 'noreferrer noopener' : undefined}>
  {@render children?.()}
  {#if external}<span class="wpl-sr-only"> (opens in a new tab)</span><Icon name="external" />{/if}
</a>
`,
  'Badge.svelte': `<script lang="ts">
  import { badgeClassName, type BadgeVariant } from '@white-plumeria/core';
  import type { Snippet } from 'svelte';
  let { variant = 'neutral', children }: { variant?: BadgeVariant; children?: Snippet } = $props();
</script>
<span class={badgeClassName(variant)}>{@render children?.()}</span>
`,
  'Avatar.svelte': `<script lang="ts">
  import { avatarClassName, type AvatarSize } from '@white-plumeria/core';
  let { name, src = '', alt = '', size = 'md', status = '', statusLabel = '' }: { name: string; src?: string; alt?: string; size?: AvatarSize; status?: '' | 'online' | 'busy' | 'offline'; statusLabel?: string } = $props();
  let failed = $state(false);
  const initials = $derived(name.split(/\\s+/).slice(0, 2).map((part) => part[0] ?? '').join('').toUpperCase());
</script>
<span class={avatarClassName(size)}>
  {#if src && !failed}
    <img {src} alt={alt || name} onerror={() => (failed = true)} />
  {:else}
    <span aria-hidden="true">{initials}</span>
    <span class="wpl-sr-only">{name}</span>
  {/if}
  {#if status && statusLabel}
    <span class="wpl-avatar-status"></span>
    <span class="wpl-sr-only">{statusLabel}</span>
  {/if}
</span>
`,
  'Card.svelte': `<script lang="ts">
  import type { Snippet } from 'svelte';
  let { title = '', description = '', children, footer }: { title?: string; description?: string; children?: Snippet; footer?: Snippet } = $props();
</script>
<section class="wpl-card">
  {#if title || description}
    <header class="wpl-card-header">
      {#if title}<h2 class="wpl-card-title">{title}</h2>{/if}
      {#if description}<p class="wpl-card-description">{description}</p>{/if}
    </header>
  {/if}
  {#if children}<div class="wpl-card-body">{@render children()}</div>{/if}
  {#if footer}<div class="wpl-card-footer">{@render footer()}</div>{/if}
</section>
`,
  'Divider.svelte': `<script lang="ts">
  let { label = '' }: { label?: string } = $props();
</script>
<div class="wpl-divider" role="separator">{#if label}<span>{label}</span>{/if}</div>
`,
  'Separator.svelte': `<script lang="ts">
  let { orientation = 'horizontal' }: { orientation?: 'horizontal' | 'vertical' } = $props();
</script>
<div class={orientation === 'vertical' ? 'wpl-separator wpl-separator-vertical' : 'wpl-separator'} role="separator" aria-orientation={orientation}></div>
`,
  'Spinner.svelte': `<script lang="ts">
  let { label = 'Loading' }: { label?: string } = $props();
</script>
<span class="wpl-spinner" role="status"><span class="wpl-sr-only">{label}</span></span>
`,
  'Skeleton.svelte': `<script lang="ts">
  let { width = '100%', height = '1rem' }: { width?: string; height?: string } = $props();
</script>
<span class="wpl-skeleton" style:inline-size={width} style:block-size={height} aria-hidden="true"></span>
`,
  'Progress.svelte': `<script lang="ts">
  let { label, value = undefined, max = 100 }: { label: string; value?: number; max?: number } = $props();
  const indeterminate = $derived(value === undefined);
  const percent = $derived(indeterminate ? undefined : Math.min(100, Math.max(0, ((value ?? 0) / (max > 0 ? max : 100)) * 100)));
</script>
<div class={indeterminate ? 'wpl-progress-track wpl-progress-indeterminate' : 'wpl-progress-track'} role="progressbar" aria-label={label} aria-valuemin={0} aria-valuemax={max} aria-valuenow={indeterminate ? undefined : value}>
  <span class="wpl-progress-bar" style:inline-size={percent === undefined ? undefined : \`\${percent}%\`}></span>
</div>
`,
  'EmptyState.svelte': `<script lang="ts">
  import type { Snippet } from 'svelte';
  let { title, description = '', children }: { title: string; description?: string; children?: Snippet } = $props();
</script>
<div class="wpl-empty">
  <h2 class="wpl-empty-title">{title}</h2>
  {#if description}<p class="wpl-empty-description">{description}</p>{/if}
  {@render children?.()}
</div>
`,
  'Alert.svelte': `<script lang="ts">
  import { alertClassName, type AlertVariant } from '@white-plumeria/core';
  import type { Snippet } from 'svelte';
  import Icon from './Icon.svelte';
  let { variant = 'neutral', title = '', children }: { variant?: AlertVariant; title?: string; children?: Snippet } = $props();
</script>
<div class={alertClassName(variant)} role={variant === 'danger' ? 'alert' : 'status'}>
  <Icon name={variant === 'success' ? 'success' : variant === 'neutral' ? 'info' : 'alert'} />
  <div>
    {#if title}<p class="wpl-alert-title">{title}</p>{/if}
    {#if children}<div class="wpl-alert-description">{@render children()}</div>{/if}
  </div>
</div>
`,
  'StatCard.svelte': `<script lang="ts">
  let { label, value, hint = '' }: { label: string; value: string; hint?: string } = $props();
</script>
<article class="wpl-card wpl-stat">
  <p class="wpl-stat-label">{label}</p>
  <p class="wpl-stat-value">{value}</p>
  {#if hint}<p class="wpl-stat-hint">{hint}</p>{/if}
</article>
`,
  'Label.svelte': `<script lang="ts">
  import type { Snippet } from 'svelte';
  import { useWhitePlumeria } from './context.svelte.ts';
  let { for: htmlFor = '', required = false, children }: { for?: string; required?: boolean; children?: Snippet } = $props();
  const wpl = useWhitePlumeria();
</script>
<label class="wpl-label" for={htmlFor || undefined}>
  {@render children?.()}
  {#if required}<span class="wpl-required" aria-hidden="true">*</span><span class="wpl-sr-only">{wpl.t('required')}</span>{/if}
</label>
`,
  'FormMessage.svelte': `<script lang="ts">
  import type { Snippet } from 'svelte';
  let { tone = 'hint', id = '', children }: { tone?: 'hint' | 'error'; id?: string; children?: Snippet } = $props();
</script>
<p {id} class={tone === 'error' ? 'wpl-field-error' : 'wpl-field-hint'} role={tone === 'error' ? 'alert' : undefined}>{@render children?.()}</p>
`,
  'ValidationMessage.svelte': `<script lang="ts">
  import type { Snippet } from 'svelte';
  import FormMessage from './FormMessage.svelte';
  let { id = '', children }: { id?: string; children?: Snippet } = $props();
</script>
<FormMessage tone="error" {id}>{@render children?.()}</FormMessage>
`,
  'Input.svelte': `<script lang="ts">
  import { inputClassName, type ControlSize } from '@white-plumeria/core';
  let { value = $bindable(''), size = 'md', invalid = false, type = 'text', name = '', placeholder = '' }: { value?: string; size?: ControlSize; invalid?: boolean; type?: string; name?: string; placeholder?: string } = $props();
</script>
<input class={inputClassName({ size })} {type} {name} {placeholder} bind:value aria-invalid={invalid || undefined} />
`,
  'Textarea.svelte': `<script lang="ts">
  let { value = $bindable(''), rows = 4, name = '', placeholder = '' }: { value?: string; rows?: number; name?: string; placeholder?: string } = $props();
</script>
<textarea class="wpl-textarea" {rows} {name} {placeholder} bind:value></textarea>
`,
  'Select.svelte': `<script lang="ts">
  let { value = $bindable(''), name = '', options = [] as Array<{ value: string; label: string; disabled?: boolean }>, placeholder = '' }: { value?: string; name?: string; options?: Array<{ value: string; label: string; disabled?: boolean }>; placeholder?: string } = $props();
</script>
<select class="wpl-select" {name} bind:value>
  {#if placeholder}<option value="">{placeholder}</option>{/if}
  {#each options as option (option.value)}
    <option value={option.value} disabled={option.disabled}>{option.label}</option>
  {/each}
</select>
`,
  'Checkbox.svelte': `<script lang="ts">
  let { label, checked = $bindable(false), name = '' }: { label: string; checked?: boolean; name?: string } = $props();
</script>
<label class="wpl-check"><input type="checkbox" {name} bind:checked /><span>{label}</span></label>
`,
  'RadioGroup.svelte': `<script lang="ts">
  let { label, name, options, value = $bindable('') }: { label: string; name: string; options: Array<{ value: string; label: string; disabled?: boolean }>; value?: string } = $props();
</script>
<fieldset class="wpl-field">
  <legend class="wpl-label">{label}</legend>
  {#each options as option (option.value)}
    <label class="wpl-radio">
      <input type="radio" {name} value={option.value} bind:group={value} disabled={option.disabled} />
      <span>{option.label}</span>
    </label>
  {/each}
</fieldset>
`,
  'Switch.svelte': `<script lang="ts">
  let { label, checked = $bindable(false), disabled = false, name = '' }: { label: string; checked?: boolean; disabled?: boolean; name?: string } = $props();
</script>
<button type="button" role="switch" class="wpl-switch" aria-checked={checked} {disabled} onclick={() => (checked = !checked)}>
  <span class="wpl-switch-control" aria-hidden="true"></span>
  <span>{label}</span>
  {#if name}<input type="checkbox" {name} {checked} hidden />{/if}
</button>
`,
  'Slider.svelte': `<script lang="ts">
  import { formatNumber } from '@white-plumeria/core';
  import { useWhitePlumeria } from './context.svelte.ts';
  let { label, min = 0, max = 100, step = 1, value = $bindable(0) }: { label: string; min?: number; max?: number; step?: number; value?: number } = $props();
  const wpl = useWhitePlumeria();
  const id = $props.id();
</script>
<div class="wpl-field">
  <div class="wpl-flex wpl-flex-between">
    <label class="wpl-label" for={id}>{label}</label>
    <output for={id}>{formatNumber(value, wpl.preferences.locale)}</output>
  </div>
  <input {id} class="wpl-slider" type="range" {min} {max} {step} bind:value aria-valuetext={formatNumber(value, wpl.preferences.locale)} />
</div>
`,
  'SearchInput.svelte': `<script lang="ts">
  let { label, value = $bindable(''), placeholder = '' }: { label: string; value?: string; placeholder?: string } = $props();
  const id = $props.id();
</script>
<div class="wpl-search">
  <label class="wpl-sr-only" for={id}>{label}</label>
  <input {id} class="wpl-input" type="search" bind:value placeholder={placeholder || label} />
</div>
`,
  'FormField.svelte': `<script lang="ts">
  import type { Snippet } from 'svelte';
  import Label from './Label.svelte';
  import FormMessage from './FormMessage.svelte';
  import ValidationMessage from './ValidationMessage.svelte';
  let { label, hint = '', error = '', required = false, children }: { label: string; hint?: string; error?: string; required?: boolean; children?: Snippet } = $props();
  const id = $props.id();
</script>
<div class={error ? 'wpl-field wpl-field-invalid' : 'wpl-field'}>
  <Label for={id} {required}>{label}</Label>
  {@render children?.()}
  {#if hint}<FormMessage id={\`\${id}-hint\`}>{hint}</FormMessage>{/if}
  {#if error}<ValidationMessage id={\`\${id}-error\`}>{error}</ValidationMessage>{/if}
</div>
`,
  'Notification.svelte': `<script lang="ts">
  let { title, description = '', variant = 'neutral' }: { title: string; description?: string; variant?: string } = $props();
</script>
<div class="wpl-notification" role={variant === 'danger' ? 'alert' : 'status'}>
  <p class="wpl-toast-title">{title}</p>
  {#if description}<p class="wpl-toast-description">{description}</p>{/if}
</div>
`,
  'Container.svelte': `<script lang="ts">
  import { containerClassName, type ContainerSize } from '@white-plumeria/core';
  import type { Snippet } from 'svelte';
  let { size = 'lg', children }: { size?: ContainerSize; children?: Snippet } = $props();
</script>
<div class={containerClassName(size)}>{@render children?.()}</div>
`,
  'Stack.svelte': `<script lang="ts">
  import { stackClassName, type StackGap } from '@white-plumeria/core';
  import type { Snippet } from 'svelte';
  let { gap = 'md', children }: { gap?: StackGap; children?: Snippet } = $props();
</script>
<div class={stackClassName(gap)}>{@render children?.()}</div>
`,
  'Flex.svelte': `<script lang="ts">
  import { cx } from '@white-plumeria/core';
  import type { Snippet } from 'svelte';
  let { justify = 'start', wrap = false, children }: { justify?: 'start' | 'between' | 'end'; wrap?: boolean; children?: Snippet } = $props();
</script>
<div class={cx('wpl-flex', wrap && 'wpl-flex-wrap', justify === 'between' && 'wpl-flex-between', justify === 'end' && 'wpl-flex-end')}>{@render children?.()}</div>
`,
  'Grid.svelte': `<script lang="ts">
  import { gridClassName, type GridColumns } from '@white-plumeria/core';
  import type { Snippet } from 'svelte';
  let { columns = 2, children }: { columns?: GridColumns; children?: Snippet } = $props();
</script>
<div class={gridClassName(columns)}>{@render children?.()}</div>
`,
  'PageHeader.svelte': `<script lang="ts">
  import type { Snippet } from 'svelte';
  let { title, description = '', actions }: { title: string; description?: string; actions?: Snippet } = $props();
</script>
<header class="wpl-page-header">
  <div>
    <h1 class="wpl-page-title">{title}</h1>
    {#if description}<p class="wpl-muted">{description}</p>{/if}
  </div>
  {#if actions}<div class="wpl-cluster">{@render actions()}</div>{/if}
</header>
`,
  'Footer.svelte': `<script lang="ts">
  import type { Snippet } from 'svelte';
  let { note = '', children }: { note?: string; children?: Snippet } = $props();
</script>
<footer class="wpl-footer">{#if note}<p>{note}</p>{/if}{@render children?.()}</footer>
`,
  'NavigationMenu.svelte': `<script lang="ts">
  let { label, items }: { label: string; items: Array<{ href: string; label: string; current?: boolean }> } = $props();
</script>
<nav class="wpl-nav" aria-label={label}>
  {#each items as item (item.href + item.label)}
    <a href={item.href} class="wpl-nav-link" aria-current={item.current ? 'page' : undefined}>{item.label}</a>
  {/each}
</nav>
`,
  'Navbar.svelte': `<script lang="ts">
  import IconButton from './IconButton.svelte';
  import NavigationMenu from './NavigationMenu.svelte';
  import { useWhitePlumeria } from './context.svelte.ts';
  let { brand, href = '#', items }: { brand: string; href?: string; items: Array<{ href: string; label: string; current?: boolean }> } = $props();
  let open = $state(false);
  const wpl = useWhitePlumeria();
</script>
<header class="wpl-navbar" data-open={open || undefined}>
  <a class="wpl-navbar-brand" {href}>{brand}</a>
  <IconButton class="wpl-navbar-toggle" label={wpl.t('openMenu')} onclick={() => (open = !open)} />
  <NavigationMenu label={brand} {items} />
</header>
`,
  'Sidebar.svelte': `<script lang="ts">
  let { label, items }: { label: string; items: Array<{ href: string; label: string; current?: boolean }> } = $props();
</script>
<nav class="wpl-sidebar" aria-label={label}>
  {#each items as item (item.href + item.label)}
    <a href={item.href} class="wpl-sidebar-link" aria-current={item.current ? 'page' : undefined}>{item.label}</a>
  {/each}
</nav>
`,
  'ResponsiveLayout.svelte': `<script lang="ts">
  import type { Snippet } from 'svelte';
  let { open = false, sidebar, children }: { open?: boolean; sidebar?: Snippet; children?: Snippet } = $props();
</script>
<div class="wpl-layout" data-open={open || undefined}>
  {@render sidebar?.()}
  <div class="wpl-layout-main">{@render children?.()}</div>
</div>
`,
  'SplitPane.svelte': `<script lang="ts">
  import type { Snippet } from 'svelte';
  let { label, size = $bindable(50), start, end }: { label: string; size?: number; start?: Snippet; end?: Snippet } = $props();
</script>
<div class="wpl-split" style:--wpl-split-size={\`\${size}%\`}>
  <div class="wpl-split-pane">{@render start?.()}</div>
  <div
    role="separator"
    aria-orientation="vertical"
    aria-label={label}
    aria-valuenow={size}
    tabindex="0"
    class="wpl-split-handle"
    onkeydown={(event) => {
      if (event.key === 'ArrowRight') size = Math.min(80, size + 5);
      if (event.key === 'ArrowLeft') size = Math.max(20, size - 5);
    }}
  ></div>
  <div class="wpl-split-pane">{@render end?.()}</div>
</div>
`,
  'Breadcrumb.svelte': `<script lang="ts">
  import Icon from './Icon.svelte';
  import { useWhitePlumeria } from './context.svelte.ts';
  let { items }: { items: Array<{ href?: string; label: string }> } = $props();
  const wpl = useWhitePlumeria();
</script>
<nav class="wpl-breadcrumb" aria-label={wpl.t('breadcrumb')}>
  <ol>
    {#each items as item, index (item.label + index)}
      <li>
        {#if index > 0}<Icon name="chevronRight" />{/if}
        {#if index === items.length - 1 || !item.href}
          <span aria-current={index === items.length - 1 ? 'page' : undefined}>{item.label}</span>
        {:else}
          <a class="wpl-link" href={item.href}>{item.label}</a>
        {/if}
      </li>
    {/each}
  </ol>
</nav>
`,
  'List.svelte': `<script lang="ts">
  let { items }: { items: Array<{ id: string; title: string; description?: string; meta?: string }> } = $props();
</script>
<ul class="wpl-list">
  {#each items as item (item.id)}
    <li class="wpl-list-item">
      <div>
        <p class="wpl-timeline-title">{item.title}</p>
        {#if item.description}<p class="wpl-timeline-body">{item.description}</p>{/if}
      </div>
      {#if item.meta}<span class="wpl-muted">{item.meta}</span>{/if}
    </li>
  {/each}
</ul>
`,
  'Timeline.svelte': `<script lang="ts">
  let { items }: { items: Array<{ id: string; title: string; time: string; dateTime?: string; meta?: string }> } = $props();
</script>
<ol class="wpl-timeline">
  {#each items as item (item.id)}
    <li class="wpl-timeline-item">
      <p class="wpl-timeline-title">{item.title}</p>
      <p class="wpl-timeline-meta"><time datetime={item.dateTime}>{item.time}</time>{item.meta ? \` · \${item.meta}\` : ''}</p>
    </li>
  {/each}
</ol>
`,
  'Pagination.svelte': `<script lang="ts">
  import Icon from './Icon.svelte';
  import { useWhitePlumeria } from './context.svelte.ts';
  let { page = $bindable(1), pageCount, label = '' }: { page?: number; pageCount: number; label?: string } = $props();
  const wpl = useWhitePlumeria();
</script>
<nav class="wpl-pagination" aria-label={label || wpl.t('pagination')}>
  <button type="button" class="wpl-page" disabled={page <= 1} onclick={() => (page -= 1)}><Icon name="chevronLeft" /><span class="wpl-sr-only">{wpl.t('previous')}</span></button>
  <span>{wpl.t('page')} {page}</span>
  <button type="button" class="wpl-page" disabled={page >= pageCount} onclick={() => (page += 1)}><Icon name="chevronRight" /><span class="wpl-sr-only">{wpl.t('next')}</span></button>
</nav>
`,
  'Table.svelte': `<script lang="ts">
  import type { Snippet } from 'svelte';
  let { caption, children }: { caption: string; children?: Snippet } = $props();
</script>
<div class="wpl-table-wrap"><table class="wpl-table"><caption>{caption}</caption>{@render children?.()}</table></div>
`,
  'ChartContainer.svelte': `<script lang="ts">
  import { formatNumber } from '@white-plumeria/core';
  import { useWhitePlumeria } from './context.svelte.ts';
  let { title, description = '', data }: { title: string; description?: string; data: Array<{ label: string; value: number }> } = $props();
  const wpl = useWhitePlumeria();
  const invalid = $derived(data.some((point) => !Number.isFinite(point.value) || point.value < 0));
  const max = $derived(Math.max(1, ...data.map((point) => point.value)));
</script>
<figure class="wpl-chart">
  <figcaption class="wpl-card-title">{title}</figcaption>
  {#if description}<p class="wpl-muted">{description}</p>{/if}
  {#if invalid}
    <p class="wpl-field-error" role="alert">ChartContainer accepts finite, non-negative values only.</p>
  {:else}
    <div aria-hidden="true">
      {#each data as point (point.label)}
        <div class="wpl-chart-bar"><span>{point.label}</span><span class="wpl-chart-fill" style:inline-size={\`\${(point.value / max) * 100}%\`}></span></div>
      {/each}
    </div>
  {/if}
  <table class="wpl-table">
    <caption>{title}</caption>
    <tbody>
      {#each data as point (point.label)}
        <tr><th scope="row">{point.label}</th><td>{formatNumber(point.value, wpl.preferences.locale)}</td></tr>
      {/each}
    </tbody>
  </table>
</figure>
`,
};

for (const [name, source] of Object.entries(files)) {
  const path = join(root.pathname, name);
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, source);
}
console.log(`wrote ${Object.keys(files).length} svelte files`);
