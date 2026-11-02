import { render, screen } from '@testing-library/svelte';
import { describe, expect, it } from 'vitest';
import Chart from './lib/Chart.svelte';

describe('svelte Chart', () => {
  it('draws an SVG graph from the shared geometry', () => {
    render(Chart, {
      title: 'Sample volume',
      type: 'bar',
      data: [
        { label: 'Mon', value: 12 },
        { label: 'Tue', value: 18 },
      ],
    });
    expect(document.querySelector('.wpl-graph-column')).toBeTruthy();
    expect(document.querySelector('.wpl-graph-line')).toBeNull();
    expect(screen.getByRole('rowheader', { name: 'Tue' })).toBeTruthy();
  });
});
