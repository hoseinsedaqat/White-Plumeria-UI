import { writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const dir = join(dirname(fileURLToPath(import.meta.url)), '../src/tags');

const files = {
  'wpl-icon-button.marko': `import { iconButtonClassName, iconPaths, type IconName } from "@white-plumeria/core";
import { emit, oneOf } from "../emit.ts";

export interface Input {
  label?: string;
  icon?: string;
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
  onClick?: (event: MouseEvent) => void;
}

static const variants = ["primary", "secondary", "ghost", "danger"] as const;
static const sizes = ["sm", "md", "lg"] as const;
<const/icon=(input.icon && input.icon in iconPaths ? input.icon : "plus") as IconName>

<button/host
  type="button"
  class=iconButtonClassName({ variant: oneOf(input.variant, variants, "ghost"), size: oneOf(input.size, sizes, "md") })
  aria-label=input.label || "Action"
  disabled=input.disabled
  onClick(event) {
    if (input.disabled) return;
    emit(host(), "wpl-click", { label: input.label || "Action" });
    input.onClick?.(event);
  }
>
  <svg class="wpl-icon" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
    <path d=iconPaths[icon]/>
  </svg>
</button>
`,
  'wpl-button-group.marko': `import { buttonGroupClassName } from "@white-plumeria/core";

export interface Input {
  label?: string;
  joined?: boolean;
  content?: Marko.Body;
}

<div role="group" aria-label=input.label || "Actions" class=buttonGroupClassName(Boolean(input.joined))>
  <\${input.content}/>
</div>
`,
  'wpl-kbd.marko': `export interface Input { keys?: string | string[]; label?: string; }
<const/keys=Array.isArray(input.keys) ? input.keys : String(input.keys || input.label || "Enter").split("+").map((part) => part.trim()).filter(Boolean)>
<span class="wpl-kbd-group">
  <for|key| of=keys><kbd class="wpl-kbd">\${key}</kbd></for>
</span>
`,
  'wpl-link.marko': `export interface Input { href?: string; label?: string; external?: boolean; content?: Marko.Body; }
<a class="wpl-link" href=input.href || "#" target=(input.external ? "_blank" : null) rel=(input.external ? "noreferrer" : null)>
  <if=input.label>\${input.label}</if>
  <\${input.content}/>
</a>
`,
  'wpl-badge.marko': `import { badgeClassName, type BadgeVariant } from "@white-plumeria/core";
import { oneOf } from "../emit.ts";
export interface Input { label?: string; variant?: BadgeVariant; content?: Marko.Body; }
static const variants = ["neutral", "primary", "success", "warning", "danger"] as const;
<span class=badgeClassName(oneOf(input.variant, variants, "neutral"))>
  <if=input.label>\${input.label}</if>
  <\${input.content}/>
</span>
`,
  'wpl-avatar.marko': `import { avatarClassName, type AvatarSize } from "@white-plumeria/core";
import { oneOf } from "../emit.ts";
export interface Input { name?: string; src?: string; size?: AvatarSize; }
static const sizes = ["sm", "md", "lg"] as const;
<const/name=input.name || "User">
<const/initials=name.split(" ").map((part) => part[0] || "").join("").slice(0, 2).toUpperCase()>
<span class=avatarClassName(oneOf(input.size, sizes, "md")) role="img" aria-label=name>
  <if=input.src><img src=input.src alt=""></if>
  <else>\${initials}</else>
</span>
`,
  'wpl-card.marko': `import { cardClassName } from "@white-plumeria/core";
export interface Input { title?: string; description?: string; content?: Marko.Body; }
<article class=cardClassName()>
  <h2 class="wpl-card-title">\${input.title || "Card"}</h2>
  <if=input.description><p>\${input.description}</p></if>
  <\${input.content}/>
</article>
`,
  'wpl-divider.marko': `export interface Input { orientation?: "horizontal" | "vertical"; }
<hr class="wpl-divider" aria-orientation=(input.orientation === "vertical" ? "vertical" : null)>
`,
  'wpl-separator.marko': `import Divider from "./wpl-divider.marko";
export interface Input { orientation?: "horizontal" | "vertical"; }
<Divider orientation=input.orientation/>
`,
  'wpl-spinner.marko': `import { spinnerClassName } from "@white-plumeria/core";
export interface Input { label?: string; }
<span class=spinnerClassName() role="status" aria-label=input.label || "Loading"></span>
`,
  'wpl-skeleton.marko': `export interface Input { width?: string; }
<span class="wpl-skeleton" aria-hidden="true" style=(input.width ? \`inline-size:\${input.width}\` : null)></span>
`,
  'wpl-progress.marko': `export interface Input { label?: string; value?: number; }
<const/value=Math.min(100, Math.max(0, Number(input.value) || 0))>
<div class="wpl-progress" role="progressbar" aria-label=input.label || "Progress" aria-valuemin="0" aria-valuemax="100" aria-valuenow=value>
  <span class="wpl-progress-bar" style=\`inline-size:\${value}%\`></span>
</div>
`,
  'wpl-empty-state.marko': `export interface Input { title?: string; description?: string; content?: Marko.Body; }
<div class="wpl-empty">
  <h2>\${input.title || "Nothing here"}</h2>
  <if=input.description><p>\${input.description}</p></if>
  <\${input.content}/>
</div>
`,
  'wpl-alert.marko': `import { alertClassName, type AlertVariant } from "@white-plumeria/core";
import { oneOf } from "../emit.ts";
export interface Input { title?: string; description?: string; variant?: AlertVariant; content?: Marko.Body; }
static const variants = ["neutral", "info", "success", "warning", "danger"] as const;
<const/variant=oneOf(input.variant, variants, "neutral")>
<div class=alertClassName(variant) role=(variant === "danger" ? "alert" : "status")>
  <strong>\${input.title || "Notice"}</strong>
  <if=input.description><p>\${input.description}</p></if>
  <\${input.content}/>
</div>
`,
  'wpl-input.marko': `import { inputClassName } from "@white-plumeria/core";
import { emit } from "../emit.ts";
export interface Input { label?: string; value?: string; placeholder?: string; type?: string; disabled?: boolean; name?: string; onChange?: (value: string) => void; }
<let/value=input.value ?? "">
<id/fieldId/>
<div/host class="wpl-field">
  <if=input.label><label class="wpl-label" for=fieldId>\${input.label}</label></if>
  <input id=fieldId class=inputClassName() type=input.type || "text" name=input.name placeholder=input.placeholder disabled=input.disabled value=value valueChange(next) { value = String(next); emit(host(), "wpl-change", { value }); input.onChange?.(value); }>
</div>
`,
  'wpl-textarea.marko': `import { textareaClassName } from "@white-plumeria/core";
import { emit } from "../emit.ts";
export interface Input { label?: string; value?: string; placeholder?: string; disabled?: boolean; onChange?: (value: string) => void; }
<let/value=input.value ?? "">
<id/fieldId/>
<div/host class="wpl-field">
  <if=input.label><label class="wpl-label" for=fieldId>\${input.label}</label></if>
  <textarea id=fieldId class=textareaClassName() placeholder=input.placeholder disabled=input.disabled value=value valueChange(next) { value = String(next); emit(host(), "wpl-change", { value }); input.onChange?.(value); }/>
</div>
`,
  'wpl-select.marko': `import { selectClassName } from "@white-plumeria/core";
import { emit } from "../emit.ts";
export interface Option { value: string; label: string; disabled?: boolean; }
export interface Input { label?: string; value?: string; options?: Option[]; onChange?: (value: string) => void; }
<let/value=input.value ?? (input.options ?? [])[0]?.value ?? "">
<id/fieldId/>
<div/host class="wpl-field">
  <if=input.label><label class="wpl-label" for=fieldId>\${input.label}</label></if>
  <select id=fieldId class=selectClassName() value=value valueChange(next) { value = String(next); emit(host(), "wpl-change", { value }); input.onChange?.(value); }>
    <for|option| of=(input.options ?? [])>
      <option value=option.value disabled=option.disabled>\${option.label}</option>
    </for>
  </select>
</div>
`,
  'wpl-checkbox.marko': `import { emit } from "../emit.ts";
export interface Input { label?: string; checked?: boolean; name?: string; onChange?: (checked: boolean) => void; }
<let/checked=Boolean(input.checked)>
<id/fieldId/>
<label/host class="wpl-check" for=fieldId>
  <input id=fieldId type="checkbox" name=input.name checked=checked checkedChange(next) { checked = Boolean(next); emit(host(), "wpl-change", { checked }); input.onChange?.(checked); }>
  \${input.label || "Checkbox"}
</label>
`,
  'wpl-radio-group.marko': `import { emit } from "../emit.ts";
export interface Option { value: string; label: string; disabled?: boolean; }
export interface Input { label?: string; name?: string; value?: string; options?: Option[]; onChange?: (value: string) => void; }
<let/value=input.value ?? "">
<id/nameId/>
<div/host class="wpl-radio-group" role="radiogroup" aria-label=input.label || "Choose one">
  <for|option| of=(input.options ?? [])>
    <label class="wpl-radio">
      <input type="radio" name=input.name || nameId value=option.value disabled=option.disabled checkedValue:=value onChange() { emit(host(), "wpl-change", { value }); input.onChange?.(value); }>
      \${option.label}
    </label>
  </for>
</div>
`,
  'wpl-switch.marko': `import { emit } from "../emit.ts";
export interface Input { label?: string; checked?: boolean; onChange?: (checked: boolean) => void; }
<let/checked=Boolean(input.checked)>
<id/fieldId/>
<label/host class="wpl-switch" for=fieldId>
  <input id=fieldId type="checkbox" role="switch" aria-checked=String(checked) checked=checked checkedChange(next) { checked = Boolean(next); emit(host(), "wpl-change", { checked }); input.onChange?.(checked); }>
  \${input.label || "Switch"}
</label>
`,
  'wpl-range-slider.marko': `import { normalizeRange, rangeBounds } from "@white-plumeria/core";
import { emit } from "../emit.ts";
export interface Input { label?: string; min?: number; max?: number; step?: number; start?: number; end?: number; onChange?: (value: { start: number; end: number }) => void; }
<const/bounds=rangeBounds(Number(input.min ?? 0), Number(input.max ?? 100), Number(input.step ?? 1))>
<let/start=Number(input.start ?? bounds.min)>
<let/end=Number(input.end ?? bounds.max)>
<div/host class="wpl-field">
  <span class="wpl-label">\${input.label || "Range"}</span>
  <input class="wpl-slider" type="range" min=bounds.min max=bounds.max step=bounds.step value=start aria-label="Start" valueChange(next) { const ordered = normalizeRange(Number(next), end, bounds); start = ordered.start; end = ordered.end; emit(host(), "wpl-change", { start, end }); input.onChange?.({ start, end }); }>
  <input class="wpl-slider" type="range" min=bounds.min max=bounds.max step=bounds.step value=end aria-label="End" valueChange(next) { const ordered = normalizeRange(start, Number(next), bounds); start = ordered.start; end = ordered.end; emit(host(), "wpl-change", { start, end }); input.onChange?.({ start, end }); }>
</div>
`,
  'wpl-label.marko': `export interface Input { for?: string; content?: Marko.Body; }
<label class="wpl-label" for=input.for><\${input.content}/></label>
`,
  'wpl-form-field.marko': `import { fieldClassName } from "@white-plumeria/core";
export interface Input { label?: string; invalid?: boolean; hint?: string; content?: Marko.Body; }
<div class=fieldClassName(Boolean(input.invalid))>
  <if=input.label><span class="wpl-label">\${input.label}</span></if>
  <\${input.content}/>
  <if=input.hint><p class="wpl-field-hint">\${input.hint}</p></if>
</div>
`,
  'wpl-form-message.marko': `export interface Input { message?: string; content?: Marko.Body; }
<p class="wpl-field-hint"><if=input.message>\${input.message}</if><\${input.content}/></p>
`,
  'wpl-validation-message.marko': `export interface Input { message?: string; }
<p class="wpl-field-error" role="alert">\${input.message || "Check this field."}</p>
`,
  'wpl-search-input.marko': `import { emit } from "../emit.ts";
export interface Input { label?: string; value?: string; placeholder?: string; onChange?: (value: string) => void; }
<let/value=input.value ?? "">
<id/fieldId/>
<div/host class="wpl-field">
  <label class="wpl-label" for=fieldId>\${input.label || "Search"}</label>
  <input id=fieldId class="wpl-input" type="search" placeholder=input.placeholder || "Search" value=value valueChange(next) { value = String(next); emit(host(), "wpl-change", { value }); input.onChange?.(value); }>
</div>
`,
  'wpl-password-field.marko': `import { emit } from "../emit.ts";
export interface Input { label?: string; value?: string; onChange?: (value: string) => void; }
<let/value=input.value ?? "">
<let/shown=false>
<id/fieldId/>
<div/host class="wpl-field">
  <label class="wpl-label" for=fieldId>\${input.label || "Password"}</label>
  <input id=fieldId class="wpl-input" type=(shown ? "text" : "password") value=value valueChange(next) { value = String(next); emit(host(), "wpl-change", { value }); input.onChange?.(value); }>
  <button type="button" class="wpl-btn wpl-btn-ghost wpl-btn-sm" onClick() { shown = !shown; }>\${shown ? "Hide" : "Show"}</button>
</div>
`,
  'wpl-otp-field.marko': `import { otpCells, otpLength } from "@white-plumeria/core";
import { emit } from "../emit.ts";
export interface Input { label?: string; value?: string; length?: number; numeric?: boolean; onChange?: (value: string) => void; }
<let/value=input.value ?? "">
<const/length=otpLength(Number(input.length) || 6)>
<const/cells=otpCells(value, length, input.numeric !== false)>
<div/host class="wpl-otp" role="group" aria-label=input.label || "One-time code">
  <for|cell, index| of=cells>
    <input
      class="wpl-input"
      inputmode=(input.numeric === false ? "text" : "numeric")
      maxlength="1"
      aria-label=\`Digit \${index + 1}\`
      value=cell
      valueChange(next) {
        const chars = cells.slice();
        chars[index] = String(next).slice(-1);
        value = chars.join("");
        emit(host(), "wpl-change", { value });
        input.onChange?.(value);
      }
    >
  </for>
</div>
`,
  'wpl-rating.marko': `import { emit } from "../emit.ts";
export interface Input { label?: string; value?: number; max?: number; name?: string; onChange?: (value: number) => void; }
<let/value=Number(input.value ?? 0)>
<const/max=Math.max(1, Number(input.max) || 5)>
<div/host class="wpl-rating" role="radiogroup" aria-label=input.label || "Rating">
  <for|n| from=1 to=max>
    <button type="button" class="wpl-rating-star" aria-pressed=String(value === n) aria-label=\`\${n} of \${max}\` onClick() { value = n; emit(host(), "wpl-change", { value }); input.onChange?.(value); }>\${n}</button>
  </for>
</div>
`,
  'wpl-combobox.marko': `import { emit } from "../emit.ts";
export interface Option { value: string; label: string; disabled?: boolean; }
export interface Input { label?: string; value?: string; options?: Option[]; onChange?: (value: string) => void; }
<let/query=input.value ?? "">
<let/open=false>
<const/options=(input.options ?? []).filter((option) => option.label.toLowerCase().includes(query.trim().toLowerCase()))>
<id/listId/>
<div/host class="wpl-field">
  <label class="wpl-label">\${input.label || "Choose"}</label>
  <input class="wpl-input" role="combobox" aria-expanded=String(open) aria-controls=listId aria-autocomplete="list" value=query valueChange(next) { query = String(next); open = true; }>
  <ul id=listId class="wpl-menu" role="listbox" hidden=!open>
    <for|option| of=options>
      <li><button type="button" class="wpl-menu-item" role="option" disabled=option.disabled onClick() { if (option.disabled) return; query = option.label; open = false; emit(host(), "wpl-change", { value: option.value }); input.onChange?.(option.value); }>\${option.label}</button></li>
    </for>
  </ul>
</div>
`,
  'wpl-pagination.marko': `import { emit } from "../emit.ts";
export interface Input { page?: number; pageCount?: number; label?: string; onChange?: (page: number) => void; }
<let/page=Math.max(1, Number(input.page) || 1)>
<const/count=Math.max(1, Number(input.pageCount) || 1)>
<nav/host class="wpl-pagination" aria-label=input.label || "Pagination">
  <button type="button" class="wpl-btn wpl-btn-ghost wpl-btn-sm" aria-label="Previous" disabled=page <= 1 onClick() { page = Math.max(1, page - 1); emit(host(), "wpl-change", { page }); input.onChange?.(page); }>Previous</button>
  <span>\${page} / \${count}</span>
  <button type="button" class="wpl-btn wpl-btn-ghost wpl-btn-sm" aria-label="Next" disabled=page >= count onClick() { page = Math.min(count, page + 1); emit(host(), "wpl-change", { page }); input.onChange?.(page); }>Next</button>
</nav>
`,
  'wpl-breadcrumb.marko': `export interface Crumb { href?: string; label: string; current?: boolean; }
export interface Input { items?: Crumb[]; }
<nav aria-label="Breadcrumb">
  <ol class="wpl-breadcrumb">
    <for|item| of=(input.items ?? [])>
      <li><a href=item.href || "#" aria-current=(item.current ? "page" : null)>\${item.label}</a></li>
    </for>
  </ol>
</nav>
`,
  'wpl-list.marko': `export interface Item { id?: string; label: string; description?: string; }
export interface Input { items?: Item[]; }
<ul class="wpl-list">
  <for|item| of=(input.items ?? [])>
    <li class="wpl-list-item"><strong>\${item.label}</strong><if=item.description><span>\${item.description}</span></if></li>
  </for>
</ul>
`,
  'wpl-tree-view.marko': `export interface Node { id: string; label: string; children?: { id: string; label: string }[]; }
export interface Input { label?: string; nodes?: Node[]; }
<ul class="wpl-tree" role="tree" aria-label=input.label || "Tree">
  <for|node| of=(input.nodes ?? [])>
    <li role="treeitem" aria-expanded=(node.children?.length ? "true" : null)>
      \${node.label}
      <if=node.children?.length>
        <ul role="group">
          <for|child| of=node.children>
            <li role="treeitem">\${child.label}</li>
          </for>
        </ul>
      </if>
    </li>
  </for>
</ul>
`,
  'wpl-stat-card.marko': `export interface Input { label?: string; value?: string | number; hint?: string; }
<article class="wpl-stat">
  <p class="wpl-stat-label">\${input.label || "Stat"}</p>
  <p class="wpl-stat-value">\${input.value ?? "0"}</p>
  <if=input.hint><p class="wpl-muted">\${input.hint}</p></if>
</article>
`,
  'wpl-timeline.marko': `export interface Item { id?: string; title: string; description?: string; }
export interface Input { items?: Item[]; }
<ol class="wpl-timeline">
  <for|item| of=(input.items ?? [])>
    <li><strong>\${item.title}</strong><if=item.description><p>\${item.description}</p></if></li>
  </for>
</ol>
`,
  'wpl-chart-container.marko': `export interface Input { label?: string; content?: Marko.Body; }
<div class="wpl-chart" role="img" aria-label=input.label || "Chart">
  <\${input.content}/>
</div>
`,
  'wpl-container.marko': `import { containerClassName, type ContainerSize } from "@white-plumeria/core";
import { oneOf } from "../emit.ts";
export interface Input { size?: ContainerSize; content?: Marko.Body; }
static const sizes = ["sm", "md", "lg", "xl"] as const;
<div class=containerClassName(oneOf(input.size, sizes, "lg"))><\${input.content}/></div>
`,
  'wpl-grid.marko': `import { gridClassName, type GridColumns } from "@white-plumeria/core";
export interface Input { columns?: GridColumns; content?: Marko.Body; }
<const/count=([1, 2, 3, 4] as const).includes(Number(input.columns) as GridColumns) ? Number(input.columns) as GridColumns : 2>
<div class=gridClassName(count)><\${input.content}/></div>
`,
  'wpl-stack.marko': `import { stackClassName, type StackGap } from "@white-plumeria/core";
import { oneOf } from "../emit.ts";
export interface Input { gap?: StackGap; content?: Marko.Body; }
static const gaps = ["sm", "md", "lg"] as const;
<div class=stackClassName(oneOf(input.gap, gaps, "md"))><\${input.content}/></div>
`,
  'wpl-flex.marko': `export interface Input { wrap?: boolean; justify?: "start" | "between" | "end"; content?: Marko.Body; }
<div class=["wpl-flex", input.justify === "between" && "wpl-flex-between", input.justify === "end" && "wpl-flex-end", input.wrap && "wpl-flex-wrap"]>
  <\${input.content}/>
</div>
`,
  'wpl-navbar.marko': `export interface Item { href?: string; label: string; current?: boolean; }
export interface Input { brand?: string; href?: string; items?: Item[]; }
<let/open=false>
<id/menuId/>
<header class="wpl-navbar" data-open=open>
  <a class="wpl-navbar-brand" href=input.href || "/">\${input.brand || "White Plumeria"}</a>
  <button type="button" class="wpl-navbar-toggle" aria-expanded=String(open) aria-controls=menuId onClick() { open = !open; }>Menu</button>
  <nav id=menuId class="wpl-nav-menu">
    <for|item| of=(input.items ?? [])>
      <a class="wpl-nav-link" href=item.href || "#" aria-current=(item.current ? "page" : null)>\${item.label}</a>
    </for>
  </nav>
</header>
`,
  'wpl-sidebar.marko': `export interface Item { href?: string; label: string; current?: boolean; }
export interface Input { label?: string; items?: Item[]; }
<nav class="wpl-sidebar" aria-label=input.label || "Sidebar">
  <for|item| of=(input.items ?? [])>
    <a href=item.href || "#" aria-current=(item.current ? "page" : null)>\${item.label}</a>
  </for>
</nav>
`,
  'wpl-navigation-menu.marko': `export interface Item { href?: string; label: string; current?: boolean; }
export interface Input { label?: string; items?: Item[]; }
<nav class="wpl-nav-menu" aria-label=input.label || "Navigation">
  <for|item| of=(input.items ?? [])>
    <a class="wpl-nav-link" href=item.href || "#" aria-current=(item.current ? "page" : null)>\${item.label}</a>
  </for>
</nav>
`,
  'wpl-page-header.marko': `export interface Input { title?: string; description?: string; content?: Marko.Body; }
<header class="wpl-page-header">
  <h1 class="wpl-page-title">\${input.title || "Page"}</h1>
  <if=input.description><p class="wpl-page-description">\${input.description}</p></if>
  <\${input.content}/>
</header>
`,
  'wpl-footer.marko': `export interface Input { note?: string; content?: Marko.Body; }
<footer class="wpl-footer"><p>\${input.note || "White Plumeria"}</p><\${input.content}/></footer>
`,
  'wpl-responsive-layout.marko': `export interface Input { label?: string; open?: boolean; content?: Marko.Body; sidebar?: Marko.AttrTag<{ content?: Marko.Body }>; }
<div class="wpl-responsive" data-open=Boolean(input.open)>
  <if=input.sidebar><\${input.sidebar.content}/></if>
  <else if=input.label><nav class="wpl-sidebar" aria-label=input.label></nav></else>
  <div class="wpl-responsive-main"><\${input.content}/></div>
</div>
`,
  'wpl-split-pane.marko': `import { emit } from "../emit.ts";
export interface Input {
  label?: string;
  size?: number;
  start?: string;
  end?: string;
  onSizeChange?: (size: number) => void;
  content?: Marko.Body;
}
<let/size=Math.min(80, Math.max(20, Number(input.size) || 50))>
<div/host class="wpl-split" style={ "grid-template-columns": \`minmax(0, \${size}fr) auto minmax(0, \${100 - size}fr)\` }>
  <div class="wpl-split-pane" data-wpl-start>\${input.start || "Start"}</div>
  <button
    type="button"
    class="wpl-split-separator"
    role="separator"
    aria-label=input.label || "Resize"
    aria-valuemin="20"
    aria-valuemax="80"
    aria-valuenow=String(size)
    aria-orientation="vertical"
    onKeyDown(event) {
      const delta = event.key === "ArrowRight" || event.key === "ArrowDown" ? 5 : event.key === "ArrowLeft" || event.key === "ArrowUp" ? -5 : 0;
      if (!delta) return;
      event.preventDefault();
      size = Math.min(80, Math.max(20, size + delta));
      emit(host(), "wpl-resize", { size });
      input.onSizeChange?.(size);
    }
  ></button>
  <div class="wpl-split-pane" data-wpl-end>\${input.end || "End"}</div>
</div>
`,
};

files['wpl-calendar.marko'] = `import { addMonths, buildMonthGrid, calendarDayClass, formatDate, parseIsoDate, toIsoDate, type CalendarSystem } from "@white-plumeria/core";
import { emit, oneOf } from "../emit.ts";
export interface Input { value?: string; calendar?: CalendarSystem; label?: string; onChange?: (value: string) => void; }
static const calendars = ["gregory", "persian"] as const;
<let/selected=input.value ?? "">
<let/anchor=parseIsoDate(input.value ?? "") ?? new Date()>
<const/calendar=oneOf(input.calendar, calendars, "gregory")>
<const/month=buildMonthGrid({ anchor, calendar, locale: "en" })>
<div/host class="wpl-calendar" aria-label=input.label || month.title>
  <div class="wpl-calendar-head">
    <button type="button" class="wpl-btn wpl-btn-ghost wpl-btn-sm" aria-label="Previous" onClick() { anchor = addMonths(anchor, -1, calendar); }>‹</button>
    <strong>\${month.title}</strong>
    <button type="button" class="wpl-btn wpl-btn-ghost wpl-btn-sm" aria-label="Next" onClick() { anchor = addMonths(anchor, 1, calendar); }>›</button>
  </div>
  <div class="wpl-calendar-grid" role="grid" aria-label=month.title>
    <for|day| of=month.weekdays><div class="wpl-calendar-weekday" role="columnheader">\${day}</div></for>
    <for|cell| of=month.cells>
      <button type="button" class=calendarDayClass({ inMonth: cell.inMonth, date: cell.date }) disabled=cell.disabled aria-label=formatDate(cell.date, "en", { dateStyle: "full" }, calendar) aria-selected=String(selected === toIsoDate(cell.date)) onClick() { selected = toIsoDate(cell.date); emit(host(), "wpl-change", { value: selected }); input.onChange?.(selected); }>\${cell.label}</button>
    </for>
  </div>
</div>
`;

files['wpl-date-picker.marko'] = `import { message, parseIsoDate } from "@white-plumeria/core";
import { emit } from "../emit.ts";
export interface Input { label?: string; value?: string; onChange?: (value: string) => void; }
<let/value=input.value ?? "">
<let/error="">
<id/fieldId/>
<div/host class="wpl-date">
  <label class="wpl-label" for=fieldId>\${input.label || message("en", "chooseDate")}</label>
  <input/field id=fieldId class="wpl-input" value=value placeholder="YYYY-MM-DD" data-wpl-edge="value" aria-invalid=String(Boolean(error)) valueChange(next) {
    value = String(next);
    if (value && !parseIsoDate(value)) {
      error = message("en", "invalidDate");
      return;
    }
    error = "";
    emit(host(), "wpl-change", { value });
    input.onChange?.(value);
  }>
  <if=error><p class="wpl-field-error" role="alert">\${error}</p></if>
  <lifecycle
    onMount() {
      const forward = () => field().dispatchEvent(new Event("input", { bubbles: true }));
      field().addEventListener("change", forward);
      return { forward };
    }
    onDestroy() { field().removeEventListener("change", this.forward); }
  />
</div>
`;

for (const [name, content] of Object.entries(files)) {
  writeFileSync(join(dir, name), content);
  console.log(name);
}
