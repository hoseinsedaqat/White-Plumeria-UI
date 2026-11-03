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
  'wpl-link.marko': `import { iconPaths } from "@white-plumeria/core";
import { text } from "../text.ts";

export interface Input { href?: string; label?: string; external?: boolean; content?: Marko.Body; }
<a class="wpl-link" href=input.href || "#" target=(input.external ? "_blank" : null) rel=(input.external ? "noreferrer noopener" : null)>
  <if=input.label>\${input.label}</if>
  <\${input.content}/>
  <if=input.external>
    <span class="wpl-sr-only"> (\${text("newTab")})</span>
    <svg class="wpl-icon wpl-icon-dir" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d=iconPaths.external/></svg>
  </if>
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
export interface Input { name?: string; src?: string; alt?: string; size?: AvatarSize; status?: "online" | "busy" | "offline"; statusLabel?: string; }
static const sizes = ["sm", "md", "lg"] as const;
<const/name=input.name || "User">
<const/initials=name.split(" ").map((part) => part[0] || "").join("").slice(0, 2).toUpperCase()>
<const/status=input.status === "online" || input.status === "busy" || input.status === "offline" ? input.status : "">
<span class=avatarClassName(oneOf(input.size, sizes, "md"))>
  <if=input.src><img src=input.src alt=input.alt || name></if>
  <else>
    <span aria-hidden="true">\${initials}</span>
    <if=!input.alt><span class="wpl-sr-only">\${name}</span></if>
  </else>
  <if=(status && input.statusLabel)>
    <span class="wpl-avatar-status" style=(status === "busy" ? "background:var(--wpl-color-warning)" : status === "offline" ? "background:var(--wpl-color-text-subtle)" : undefined)></span>
    <span class="wpl-sr-only">\${input.statusLabel}</span>
  </if>
</span>
`,
  'wpl-card.marko': `import { cardClassName } from "@white-plumeria/core";
import { oneOf } from "../emit.ts";
export interface Input { title?: string; description?: string; titleAs?: "h1" | "h2" | "h3" | "h4"; content?: Marko.Body; }
static const headings = ["h1", "h2", "h3", "h4"] as const;
<const/heading=oneOf(input.titleAs, headings, "h2")>
<article class=cardClassName()>
  <if=(heading === "h1")><h1 class="wpl-card-title">\${input.title || "Card"}</h1></if>
  <else if=(heading === "h3")><h3 class="wpl-card-title">\${input.title || "Card"}</h3></else>
  <else if=(heading === "h4")><h4 class="wpl-card-title">\${input.title || "Card"}</h4></else>
  <else><h2 class="wpl-card-title">\${input.title || "Card"}</h2></else>
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
  'wpl-progress.marko': `export interface Input { label?: string; value?: number; max?: number; }
<const/raw=input.value>
<const/indeterminate=raw == null>
<const/max=((input.max ?? 100) > 0 ? (input.max ?? 100) : 100)>
<const/value=indeterminate ? undefined : Math.min(max, Math.max(0, Number(raw) || 0))>
<div
  class=(indeterminate ? "wpl-progress-track wpl-progress-indeterminate" : "wpl-progress-track")
  role="progressbar"
  aria-label=input.label || "Progress"
  aria-valuemin="0"
  aria-valuemax=max
  aria-valuenow=(indeterminate ? null : value)
>
  <span class="wpl-progress-bar" style=(value == null ? null : \`inline-size:\${(value / max) * 100}%\`)></span>
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
  <p class="wpl-alert-title">\${input.title || "Notice"}</p>
  <if=input.description><p class="wpl-alert-description">\${input.description}</p></if>
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
  <span class="wpl-switch-control" aria-hidden="true"></span>
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
  'wpl-label.marko': `import { text } from "../text.ts";
export interface Input { for?: string; required?: boolean; content?: Marko.Body; }
<label class="wpl-label" for=input.for>
  <\${input.content}/>
  <if=input.required>
    <span class="wpl-required" aria-hidden="true">*</span>
    <span class="wpl-sr-only">\${text("required")}</span>
  </if>
</label>
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
import { iconPaths } from "@white-plumeria/core";
export interface Input { label?: string; value?: string; placeholder?: string; onChange?: (value: string) => void; }
<let/value=input.value ?? "">
<id/fieldId/>
<div/host class="wpl-search">
  <label class="wpl-label" for=fieldId>\${input.label || "Search"}</label>
  <div class="wpl-search-control">
    <span class="wpl-search-icon" aria-hidden="true">
      <svg class="wpl-icon" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d=iconPaths.search/></svg>
    </span>
    <input id=fieldId class="wpl-input" type="search" placeholder=input.placeholder || "Search" value=value valueChange(next) { value = String(next); emit(host(), "wpl-change", { value }); input.onChange?.(value); }>
    <if=value>
      <button type="button" class="wpl-icon-btn wpl-icon-btn-sm wpl-btn-ghost wpl-search-clear" aria-label="Clear" onClick() { value = ""; emit(host(), "wpl-change", { value: "" }); input.onChange?.(""); }>
        <svg class="wpl-icon" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d=iconPaths.close/></svg>
      </button>
    </if>
  </div>
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
import { iconPaths } from "@white-plumeria/core";
export interface Option { value: string; label: string; disabled?: boolean; }
export interface Input { label?: string; value?: string; options?: Option[]; onChange?: (value: string) => void; }
<let/query=input.value ?? "">
<let/open=false>
<const/options=(input.options ?? []).filter((option) => option.label.toLowerCase().includes(query.trim().toLowerCase()))>
<id/fieldId/>
<id/listId/>
<div/host class="wpl-combo">
  <label class="wpl-label" for=fieldId>\${input.label || "Choose"}</label>
  <div class="wpl-combo-control">
    <span class="wpl-combo-icon" aria-hidden="true">
      <svg class="wpl-icon" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d=iconPaths.search/></svg>
    </span>
    <input id=fieldId class="wpl-input" role="combobox" aria-expanded=String(open) aria-controls=listId aria-autocomplete="list" value=query valueChange(next) { query = String(next); open = true; }>
  </div>
  <ul id=listId class="wpl-menu" role="listbox" hidden=!open>
    <for|option| of=options>
      <li><button type="button" class="wpl-menu-item" role="option" disabled=option.disabled onClick() { if (option.disabled) return; query = option.label; open = false; emit(host(), "wpl-change", { value: option.value }); input.onChange?.(option.value); }>\${option.label}</button></li>
    </for>
  </ul>
</div>
`,
  'wpl-pagination.marko': `import { iconPaths } from "@white-plumeria/core";
import { emit } from "../emit.ts";
import { text } from "../text.ts";

export interface Input {
  page?: number;
  pageCount?: number;
  label?: string;
  onChange?: (page: number) => void;
}

<let/page=Math.max(1, Number(input.page) || 1)>
<const/count=Math.max(1, Number(input.pageCount) || 1)>
<const/pages=Array.from({ length: count }, (_, index) => index + 1).filter((item) => item === 1 || item === count || Math.abs(item - page) <= 1)>

<nav/host class="wpl-pagination" aria-label=input.label || text("pagination")>
  <button type="button" class="wpl-page" disabled=page <= 1 onClick() {
    page = Math.max(1, page - 1);
    emit(host(), "wpl-change", { page });
    input.onChange?.(page);
  }>
    <svg class="wpl-icon wpl-icon-dir" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d=iconPaths.chevronLeft/></svg>
    <span class="wpl-sr-only">\${text("previous")}</span>
  </button>
  <for|item, index| of=pages>
    <if=(index > 0 && item - (pages[index - 1] ?? item) > 1)><span aria-hidden="true">…</span></if>
    <button type="button" class="wpl-page" aria-current=(item === page ? "page" : null) onClick() {
      page = item;
      emit(host(), "wpl-change", { page });
      input.onChange?.(page);
    }>\${item}</button>
  </for>
  <button type="button" class="wpl-page" disabled=page >= count onClick() {
    page = Math.min(count, page + 1);
    emit(host(), "wpl-change", { page });
    input.onChange?.(page);
  }>
    <svg class="wpl-icon wpl-icon-dir" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d=iconPaths.chevronRight/></svg>
    <span class="wpl-sr-only">\${text("next")}</span>
  </button>
</nav>
`,
  'wpl-breadcrumb.marko': `import { iconPaths } from "@white-plumeria/core";
import { text } from "../text.ts";

export interface Crumb {
  href?: string;
  label: string;
  current?: boolean;
}

export interface Input {
  items?: Crumb[];
}

<const/items=input.items ?? []>
<const/last=items.length - 1>

<nav class="wpl-breadcrumb" aria-label=text("breadcrumb")>
  <ol>
    <for|item, index| of=items>
      <li>
        <if=(index > 0)>
          <svg class="wpl-icon wpl-icon-dir" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d=iconPaths.chevronRight/></svg>
        </if>
        <if=(index === last || !item.href)>
          <span aria-current=(index === last ? "page" : null)>\${item.label}</span>
        </if>
        <else>
          <a class="wpl-link" href=item.href>\${item.label}</a>
        </else>
      </li>
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
  'wpl-tree-view.marko': `import { iconPaths, treeExpandAction } from "@white-plumeria/core";
import { emit } from "../emit.ts";

export interface Node {
  id: string;
  label: string;
  children?: { id: string; label: string }[];
}
export interface Input {
  label?: string;
  nodes?: Node[];
  onSelect?: (id: string) => void;
}

<let/open=[]>
<let/selected="">
<ul/host class="wpl-tree" role="tree" aria-label=input.label || "Tree">
  <for|node| of=(input.nodes ?? [])>
    <li class="wpl-tree-item" role="none">
      <button
        type="button"
        class="wpl-tree-row"
        role="treeitem"
        aria-expanded=(node.children?.length ? String(open.includes(node.id)) : null)
        aria-selected=String(selected === node.id)
        onClick() {
          selected = node.id;
          emit(host(), "wpl-select", { id: node.id });
          input.onSelect?.(node.id);
          if (!node.children?.length) return;
          open = open.includes(node.id) ? open.filter((id) => id !== node.id) : open.concat(node.id);
        }
        onKeyDown(event) {
          if (!node.children?.length) return;
          const expanded = open.includes(node.id);
          const action = treeExpandAction(event.key, host(), expanded);
          if (!action) return;
          event.preventDefault();
          if (action === "stay") return;
          open = action === "open" ? open.concat(node.id) : open.filter((id) => id !== node.id);
        }
      >
        <if=node.children?.length>
          <svg class=(open.includes(node.id) ? "wpl-icon" : "wpl-icon wpl-icon-dir") viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d=(open.includes(node.id) ? iconPaths.chevronDown : iconPaths.chevronRight)/></svg>
        </if>
        <else><span class="wpl-tree-spacer" aria-hidden="true"></span></else>
        \${node.label}
      </button>
      <if=node.children?.length && open.includes(node.id)>
        <ul class="wpl-tree-children" role="group">
          <for|child| of=node.children>
            <li class="wpl-tree-item" role="none">
              <button
                type="button"
                class="wpl-tree-row"
                role="treeitem"
                aria-selected=String(selected === child.id)
                onClick() {
                  selected = child.id;
                  emit(host(), "wpl-select", { id: child.id });
                  input.onSelect?.(child.id);
                }
              >
                <span class="wpl-tree-spacer" aria-hidden="true"></span>
                \${child.label}
              </button>
            </li>
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
  'wpl-timeline.marko': `export interface Item { id?: string; title: string; time?: string; dateTime?: string; meta?: string; }
export interface Input { items?: Item[]; }
<ol class="wpl-timeline">
  <for|item| of=(input.items ?? [])>
    <li class="wpl-timeline-item">
      <p class="wpl-timeline-title">\${item.title}</p>
      <if=(item.time || item.meta)>
        <p class="wpl-timeline-meta">
          <if=item.dateTime><time datetime=item.dateTime>\${item.time}</time></if>
          <else>\${item.time}</else>
          <if=item.meta>\${" · " + item.meta}</if>
        </p>
      </if>
    </li>
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
  'wpl-split-pane.marko': `import { splitSizeStep } from "@white-plumeria/core";
import { emit } from "../emit.ts";
export interface Input {
  label?: string;
  size?: number;
  start?: string;
  end?: string;
  onSizeChange?: (size: number) => void;
  content?: Marko.Body;
}
<let/size=Math.min(80, Math.max(20, Number(input.size) || 50))>
<div/host class="wpl-split" style=\`--wpl-split-size:\${size}%\`>
  <div class="wpl-split-pane" data-wpl-start>\${input.start || "Start"}</div>
  <button/separator
    type="button"
    class="wpl-split-separator"
    role="separator"
    aria-label=input.label || "Resize"
    aria-valuemin="20"
    aria-valuemax="80"
    aria-valuenow=String(size)
    aria-orientation="vertical"
    onKeyDown(event) {
      const step = splitSizeStep(event.key, separator());
      if (!step) return;
      event.preventDefault();
      size = Math.min(80, Math.max(20, size + step));
      emit(host(), "wpl-resize", { size });
      input.onSizeChange?.(size);
    }
  ></button>
  <div class="wpl-split-pane" data-wpl-end>\${input.end || "End"}</div>
</div>
`,
};

files['wpl-calendar.marko'] = `import { addMonths, buildMonthGrid, calendarDayClass, formatDate, iconPaths, parseIsoDate, sameDay, toIsoDate, type CalendarSystem } from "@white-plumeria/core";
import { emit, oneOf } from "../emit.ts";
import { activeLocale, text } from "../text.ts";
export interface Input { value?: string; calendar?: CalendarSystem; label?: string; onChange?: (value: string) => void; }
static const calendars = ["gregory", "persian"] as const;
<let/selected=input.value ?? "">
<let/anchor=parseIsoDate(input.value ?? "") ?? new Date()>
<const/calendar=oneOf(input.calendar, calendars, "gregory")>
<const/month=buildMonthGrid({ anchor, calendar, locale: activeLocale() })>
<const/today=new Date()>
<div/host class="wpl-calendar" aria-label=input.label || month.title>
  <div class="wpl-calendar-head">
    <button type="button" class="wpl-btn wpl-btn-ghost wpl-btn-sm" aria-label=text("previous") onClick() { anchor = addMonths(anchor, -1, calendar); }><svg class="wpl-icon wpl-icon-dir" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d=iconPaths.chevronLeft/></svg></button>
    <strong>\${month.title}</strong>
    <button type="button" class="wpl-btn wpl-btn-ghost wpl-btn-sm" aria-label=text("next") onClick() { anchor = addMonths(anchor, 1, calendar); }><svg class="wpl-icon wpl-icon-dir" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d=iconPaths.chevronRight/></svg></button>
  </div>
  <div class="wpl-calendar-grid" role="grid" aria-label=month.title>
    <for|day| of=month.weekdays><div class="wpl-calendar-weekday" role="columnheader">\${day}</div></for>
    <for|cell| of=month.cells>
      <button type="button" role="gridcell" class=calendarDayClass({ inMonth: cell.inMonth, date: cell.date }) disabled=cell.disabled aria-label=formatDate(cell.date, activeLocale(), { dateStyle: "full" }, calendar) aria-selected=(selected === toIsoDate(cell.date) ? "true" : null) aria-current=(sameDay(today, cell.date) ? "date" : null) onClick() { selected = toIsoDate(cell.date); emit(host(), "wpl-change", { value: selected }); input.onChange?.(selected); }>\${cell.label}</button>
    </for>
  </div>
</div>
`;

files['wpl-date-picker.marko'] = `import { iconPaths, parseIsoDate, type CalendarSystem } from "@white-plumeria/core";
import { emit } from "../emit.ts";
import { text, textAt } from "../text.ts";
import Calendar from "./wpl-calendar.marko";

export interface Input {
  label?: string;
  value?: string;
  calendar?: CalendarSystem;
  onChange?: (value: string) => void;
}
<let/value=input.value ?? "">
<let/error="">
<let/open=false>
<id/fieldId/>
<div/host class="wpl-date">
  <label class="wpl-label" for=fieldId>\${input.label || text("chooseDate")}</label>
  <div class="wpl-flex">
    <input/field id=fieldId class="wpl-input" value=value placeholder="YYYY-MM-DD" data-wpl-edge="value" aria-invalid=String(Boolean(error)) aria-describedby=(error ? fieldId + "-error" : undefined) valueChange(next) {
      value = String(next);
      if (value && !parseIsoDate(value)) {
        error = textAt(host(), "invalidDate");
        return;
      }
      error = "";
      emit(host(), "wpl-change", { value });
      input.onChange?.(value);
    }>
    <button type="button" class="wpl-icon-btn wpl-btn-ghost" aria-label=text("chooseDate") aria-expanded=String(open) onClick() { open = !open }>
      <svg class="wpl-icon" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d=iconPaths.calendar/></svg>
    </button>
  </div>
  <if=error><p id=(fieldId + "-error") class="wpl-field-error" role="alert">\${error}</p></if>
  <if=open>
    <Calendar value=value calendar=input.calendar onChange(next) {
      value = next;
      open = false;
      error = "";
      emit(host(), "wpl-change", { value });
      input.onChange?.(value);
    }/>
  </if>
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
