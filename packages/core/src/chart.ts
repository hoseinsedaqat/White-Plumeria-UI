import type { Locale } from './theme.ts';
import { formatNumber } from './i18n.ts';

export interface ChartPoint {
  label: string;
  value: number;
}

export const chartTypes = ['line', 'area', 'bar'] as const;
export type ChartType = (typeof chartTypes)[number];
export type ChartReason = 'ok' | 'empty' | 'invalid';

export interface ChartPlot {
  left: number;
  right: number;
  top: number;
  bottom: number;
}

export interface ChartLayout {
  ok: boolean;
  reason: ChartReason;
  type: ChartType;
  direction: 'ltr' | 'rtl';
  width: number;
  height: number;
  max: number;
  plot: ChartPlot;
  points: Array<{ label: string; value: number; x: number; y: number }>;
  grid: Array<{ x1: number; x2: number; y: number; value: number }>;
  axis: { x1: number; x2: number; y: number };
  yLabels: Array<{ x: number; y: number; text: string; anchor: 'start' | 'end' }>;
  xLabels: Array<{ x: number; y: number; text: string }>;
  line: string;
  area: string;
  columns: string[];
  dots: Array<{ cx: number; cy: number }>;
}

const WIDTH = 640;
const HEIGHT = 248;
const GUTTER = 64;
const EDGE = 12;
const PLOT_TOP = 18;
const PLOT_BOTTOM = 204;
const LABEL_Y = 228;

export function chartType(value: unknown): ChartType {
  return value === 'line' || value === 'bar' ? value : 'area';
}

export function chartMessage(reason: ChartReason): string {
  if (reason === 'invalid') return 'Chart accepts finite, non-negative values only.';
  if (reason === 'empty') return 'No data.';
  return '';
}

export function chartLayout(
  data: unknown,
  options: { type?: unknown; direction?: 'ltr' | 'rtl'; locale?: Locale } = {},
): ChartLayout {
  const type = chartType(options.type);
  const direction = options.direction === 'rtl' ? 'rtl' : 'ltr';
  const locale: Locale = options.locale === 'fa' ? 'fa' : 'en';
  const plot: ChartPlot = {
    left: direction === 'rtl' ? EDGE : GUTTER,
    right: direction === 'rtl' ? WIDTH - GUTTER : WIDTH - EDGE,
    top: PLOT_TOP,
    bottom: PLOT_BOTTOM,
  };
  const empty: ChartLayout = {
    ok: false,
    reason: 'empty',
    type,
    direction,
    width: WIDTH,
    height: HEIGHT,
    max: 1,
    plot,
    points: [],
    grid: [],
    axis: { x1: plot.left, x2: plot.right, y: plot.bottom },
    yLabels: [],
    xLabels: [],
    line: '',
    area: '',
    columns: [],
    dots: [],
  };
  const source = readPoints(data);
  if (source == null) return { ...empty, reason: 'invalid' };
  if (source.length === 0) return empty;
  const invalid = source.some((point) => !Number.isFinite(point.value) || point.value < 0);
  if (invalid) return { ...empty, reason: 'invalid' };

  const max = Math.max(1, ...source.map((point) => point.value));
  const points = source.map((point, index) => {
    const x = xAt(index, source.length, plot, direction, type);
    return { label: point.label, value: point.value, x, y: yAt(point.value, max, plot) };
  });
  const ticks = uniqueTicks([0, max / 2, max]);
  const grid = ticks
    .filter((value) => value !== 0)
    .map((value) => ({ x1: plot.left, x2: plot.right, y: yAt(value, max, plot), value }));
  const anchor = direction === 'rtl' ? 'start' : 'end';
  const labelX = direction === 'rtl' ? plot.right + 8 : plot.left - 8;
  const yLabels = ticks.map((value) => ({
    x: labelX,
    y: yAt(value, max, plot),
    text: formatNumber(value, locale, { maximumFractionDigits: 1 }),
    anchor: anchor as 'start' | 'end',
  }));
  const step = source.length <= 6 ? 1 : Math.ceil(source.length / 6);
  const xLabels = points.flatMap((point, index) => {
    if (index % step !== 0 && index !== points.length - 1) return [];
    return [{ x: point.x, y: LABEL_Y, text: shortLabel(point.label) }];
  });
  const line = type === 'bar' ? '' : polyline(points);
  const area = type === 'area' ? areaPath(points, plot.bottom) : '';
  const columns = type === 'bar' ? source.map((point, index) => columnPath(index, source.length, point.value, max, plot, direction)) : [];
  const dots = type === 'bar' ? [] : points.map((point) => ({ cx: point.x, cy: point.y }));
  return {
    ok: true,
    reason: 'ok',
    type,
    direction,
    width: WIDTH,
    height: HEIGHT,
    max,
    plot,
    points,
    grid,
    axis: { x1: plot.left, x2: plot.right, y: plot.bottom },
    yLabels,
    xLabels,
    line,
    area,
    columns: columns.filter(Boolean),
    dots,
  };
}

export function chartFigureHtml(input: {
  title?: string;
  description?: string;
  data?: unknown;
  type?: unknown;
  direction?: 'ltr' | 'rtl';
  locale?: Locale;
}): string {
  const title = input.title?.trim() || 'Chart';
  const description = input.description?.trim() ?? '';
  const data = readPoints(input.data) ?? [];
  const layout = chartLayout(input.data, input);
  const status = chartMessage(layout.reason);
  const parts = [`<figcaption class="wpl-card-title">${escapeHtml(title)}</figcaption>`];
  if (description) parts.push(`<p class="wpl-muted">${escapeHtml(description)}</p>`);
  if (status) {
    const alert = layout.reason === 'invalid';
    parts.push(
      `<p class="${alert ? 'wpl-field-error' : 'wpl-muted'}"${alert ? ' role="alert"' : ''}>${escapeHtml(status)}</p>`,
    );
  }
  if (layout.ok) parts.push(chartSvg(layout));
  if (data.length > 0) parts.push(chartTable(title, data, input.locale === 'fa' ? 'fa' : 'en'));
  return parts.join('');
}

function chartSvg(layout: ChartLayout): string {
  const grid = layout.grid
    .map(
      (line) =>
        `<line class="wpl-graph-grid" x1="${line.x1}" x2="${line.x2}" y1="${line.y}" y2="${line.y}" fill="none" stroke="currentColor" stroke-opacity="0.18"></line>`,
    )
    .join('');
  const columns = layout.columns
    .map((path) => `<path class="wpl-graph-column" fill="currentColor" d="${path}"></path>`)
    .join('');
  const dots = layout.dots
    .map(
      (dot) =>
        `<circle class="wpl-graph-dot" cx="${dot.cx}" cy="${dot.cy}" r="3.5" fill="currentColor" stroke="currentColor"></circle>`,
    )
    .join('');
  const yLabels = layout.yLabels
    .map(
      (label) =>
        `<text class="wpl-graph-label" x="${label.x}" y="${label.y}" text-anchor="${label.anchor}" dominant-baseline="middle">${escapeHtml(label.text)}</text>`,
    )
    .join('');
  const xLabels = layout.xLabels
    .map(
      (label) =>
        `<text class="wpl-graph-label" x="${label.x}" y="${label.y}" text-anchor="middle">${escapeHtml(label.text)}</text>`,
    )
    .join('');
  const area = layout.area
    ? `<path class="wpl-graph-area" fill="currentColor" fill-opacity="0.24" d="${layout.area}"></path>`
    : '';
  const line = layout.line
    ? `<path class="wpl-graph-line" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" d="${layout.line}"></path>`
    : '';
  return `<svg class="wpl-graph-svg" viewBox="0 0 ${layout.width} ${layout.height}" aria-hidden="true" focusable="false" direction="${layout.direction}">${grid}<line class="wpl-graph-axis" x1="${layout.axis.x1}" x2="${layout.axis.x2}" y1="${layout.axis.y}" y2="${layout.axis.y}" fill="none" stroke="currentColor" stroke-opacity="0.35"></line>${area}${columns}${line}${dots}${yLabels}${xLabels}</svg>`;
}

function chartTable(title: string, data: readonly ChartPoint[], locale: Locale): string {
  const rows = data
    .map((point) => {
      const value = Number.isFinite(point.value) ? formatNumber(point.value, locale) : String(point.value);
      return `<tr><th scope="row">${escapeHtml(point.label)}</th><td>${escapeHtml(value)}</td></tr>`;
    })
    .join('');
  return `<table class="wpl-table wpl-chart-table"><caption class="wpl-sr-only">${escapeHtml(title)}</caption><thead><tr><th scope="col">Label</th><th scope="col">Value</th></tr></thead><tbody>${rows}</tbody></table>`;
}

function xAt(
  index: number,
  count: number,
  plot: ChartPlot,
  direction: 'ltr' | 'rtl',
  type: ChartType,
): number {
  const width = plot.right - plot.left;
  if (type === 'bar') {
    const slot = width / count;
    const slotIndex = direction === 'rtl' ? count - 1 - index : index;
    return round(plot.left + slotIndex * slot + slot / 2);
  }
  const inset = count <= 1 ? width / 2 : Math.min(18, width / 8);
  const span = Math.max(0, width - inset * 2);
  const fromStart = count <= 1 ? inset : inset + (index / (count - 1)) * span;
  return round(direction === 'rtl' ? plot.right - fromStart : plot.left + fromStart);
}

function yAt(value: number, max: number, plot: ChartPlot): number {
  const span = plot.bottom - plot.top;
  return round(plot.bottom - (value / max) * span);
}

function columnPath(
  index: number,
  count: number,
  value: number,
  max: number,
  plot: ChartPlot,
  direction: 'ltr' | 'rtl',
): string {
  const width = plot.right - plot.left;
  const slot = width / count;
  const bar = columnWidth(slot);
  const slotIndex = direction === 'rtl' ? count - 1 - index : index;
  const x = plot.left + slotIndex * slot + (slot - bar) / 2;
  const y = yAt(value, max, plot);
  const height = plot.bottom - y;
  if (height < 1) return '';
  const radius = Math.min(6, bar / 2, height);
  const left = round(x);
  const right = round(x + bar);
  const top = round(y);
  const bottom = round(plot.bottom);
  if (radius < 1) return `M ${left} ${bottom} L ${left} ${top} L ${right} ${top} L ${right} ${bottom} Z`;
  return `M ${left} ${bottom} L ${left} ${round(top + radius)} Q ${left} ${top} ${round(left + radius)} ${top} L ${round(right - radius)} ${top} Q ${right} ${top} ${right} ${round(top + radius)} L ${right} ${bottom} Z`;
}

function columnWidth(slot: number): number {
  return Math.min(46, Math.max(6, slot * 0.62));
}

function polyline(points: Array<{ x: number; y: number }>): string {
  if (points.length < 2) return '';
  return points.map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`).join(' ');
}

function areaPath(points: Array<{ x: number; y: number }>, baseline: number): string {
  if (points.length < 2) return '';
  const first = points[0];
  const last = points[points.length - 1];
  if (!first || !last) return '';
  return `${polyline(points)} L ${last.x} ${baseline} L ${first.x} ${baseline} Z`;
}

function readPoints(data: unknown): ChartPoint[] | null {
  if (data == null) return [];
  if (!Array.isArray(data)) return null;
  return data.map((item) => {
    if (!item || typeof item !== 'object') return { label: '', value: Number.NaN };
    const record = item as { label?: unknown; value?: unknown };
    const label = typeof record.label === 'string' ? record.label : String(record.label ?? '');
    const value = typeof record.value === 'number' ? record.value : Number(record.value);
    return { label, value };
  });
}

function uniqueTicks(values: number[]): number[] {
  const seen = new Set<number>();
  const ticks: number[] = [];
  for (const value of values) {
    const next = round(value);
    if (seen.has(next)) continue;
    seen.add(next);
    ticks.push(next);
  }
  return ticks;
}

function shortLabel(label: string): string {
  const text = label.trim();
  return text.length > 14 ? `${text.slice(0, 13)}…` : text;
}

function round(value: number): number {
  return Math.round(value * 100) / 100;
}

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}
