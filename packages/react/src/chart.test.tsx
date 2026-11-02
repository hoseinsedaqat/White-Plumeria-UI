import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Chart } from './data.tsx';

const week = [
  { label: 'Mon', value: 12 },
  { label: 'Tue', value: 18 },
  { label: 'Wed', value: 9 },
];

describe('Chart', () => {
  it('draws an SVG graph and a table for the same values', () => {
    render(<Chart title="Sample volume" data={week} />);
    expect(document.querySelector('.wpl-graph-line')).toBeTruthy();
    expect(document.querySelector('.wpl-graph-area')).toBeTruthy();
    expect(screen.getByRole('table', { name: 'Sample volume' })).toBeTruthy();
    expect(screen.getByRole('rowheader', { name: 'Mon' })).toBeTruthy();
    expect(screen.getByRole('cell', { name: '18' })).toBeTruthy();
  });

  it('draws columns without a line', () => {
    render(<Chart title="Sample volume" type="bar" data={week} />);
    expect(document.querySelector('.wpl-graph-column')).toBeTruthy();
    expect(document.querySelector('.wpl-graph-line')).toBeNull();
  });

  it('does not draw a line for a negative value', () => {
    render(<Chart title="Bad" data={[{ label: 'Mon', value: -1 }]} />);
    expect(document.querySelector('.wpl-graph-line')).toBeNull();
    expect(screen.getByRole('alert')).toHaveTextContent('finite');
    expect(screen.getByRole('rowheader', { name: 'Mon' })).toBeTruthy();
  });
});
