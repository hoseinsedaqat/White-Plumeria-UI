import { describe, expect, it } from 'vitest';
import { angularHost } from './catalog/angular.ts';
import { getComponent } from './catalog/index.ts';
import { chartFigureHtml, chartLayout, chartMessage } from './chart.ts';

const week = [
  { label: 'Mon', value: 12 },
  { label: 'Tue', value: 18 },
  { label: 'Wed', value: 9 },
];

describe('chart geometry', () => {
  it('scales the highest point to the top of the plot and connects the rest', () => {
    const layout = chartLayout(
      [
        { label: 'A', value: 0 },
        { label: 'B', value: 10 },
      ],
      { type: 'line' },
    );
    expect(layout.ok).toBe(true);
    expect(layout.points[0]?.y).toBe(layout.plot.bottom);
    expect(layout.points[1]?.y).toBe(layout.plot.top);
    expect(layout.points[0]?.x).toBeLessThan(layout.points[1]?.x ?? 0);
    expect(layout.line.startsWith('M ')).toBe(true);
    expect(layout.line).toContain(' L ');
    expect(layout.area).toBe('');
    expect(layout.columns).toEqual([]);
    expect(layout.dots).toHaveLength(2);
  });

  it('closes an area on the baseline and draws columns only for bar', () => {
    const area = chartLayout(week, { type: 'area' });
    expect(area.area.endsWith('Z')).toBe(true);
    expect(area.line).not.toBe('');
    expect(area.columns).toEqual([]);

    const bars = chartLayout(week, { type: 'bar' });
    expect(bars.line).toBe('');
    expect(bars.area).toBe('');
    expect(bars.columns).toHaveLength(3);
    expect(bars.columns[0]).toContain('Z');
    expect(bars.dots).toEqual([]);
  });

  it('starts at the inline end when the direction is rtl', () => {
    const layout = chartLayout(week, { type: 'line', direction: 'rtl' });
    expect(layout.points[0]?.x).toBeGreaterThan(layout.points[1]?.x ?? 0);
    expect(layout.points[1]?.x).toBeGreaterThan(layout.points[2]?.x ?? 0);
    expect(layout.yLabels[0]?.anchor).toBe('start');
  });

  it('refuses to draw a negative or empty series', () => {
    const invalid = chartLayout([{ label: 'Mon', value: -1 }]);
    expect(invalid.ok).toBe(false);
    expect(invalid.reason).toBe('invalid');
    expect(invalid.line).toBe('');
    expect(chartMessage(invalid.reason)).toContain('finite');

    const empty = chartLayout([]);
    expect(empty.reason).toBe('empty');
    expect(chartFigureHtml({ title: 'Sample', data: [] })).toContain('No data.');
    expect(chartFigureHtml({ title: 'Sample', data: [] })).not.toContain('<svg');
  });

  it('escapes labels and keeps the same values in the table', () => {
    const html = chartFigureHtml({
      title: 'A & B',
      data: [{ label: '<Mon>', value: 12 }],
      type: 'line',
    });
    expect(html).toContain('A &amp; B');
    expect(html).toContain('&lt;Mon&gt;');
    expect(html).not.toContain('<Mon>');
    expect(html).toContain('wpl-graph-dot');
    expect(html).toContain('<table class="wpl-table wpl-chart-table">');
    expect(html).toContain('>12<');
  });

  it('adds Chart beside ChartContainer and does not reuse the chart element', () => {
    const chart = getComponent('Chart');
    const summary = getComponent('ChartContainer');
    expect(chart?.slug).toBe('chart');
    expect(summary?.slug).toBe('chart-container');
    expect(chart?.classes).toContain('wpl-graph');
    expect(chart?.examples.html).toContain('wpl-graph-line');
    expect(chart?.limitations.join(' ')).toMatch(/zoom/);
    expect(angularHost('Chart').element).toBe('wpl-chart-graph');
    expect(angularHost('ChartContainer').element).toBe('wpl-chart');
    expect(chart?.examples.angular).toContain('wpl-chart-graph');
    expect(chart?.examples.angular).not.toMatch(/ {2}\/>/);
    expect(chart?.examples.lit).toContain('wpl-chart');
    expect(chart?.examples.ember).toContain('@data');
    expect(chart?.examples.alpine).toContain('Chart(');
  });
});
