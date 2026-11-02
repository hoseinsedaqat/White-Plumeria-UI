import { render, screen } from '@testing-library/vue';
import { defineComponent, h } from 'vue';
import { describe, expect, it } from 'vitest';
import { Chart } from './data.ts';
import { WhitePlumeriaProvider } from './provider.ts';

describe('vue Chart', () => {
  it('draws an SVG graph from the shared geometry', () => {
    render(
      defineComponent({
        setup() {
          return () =>
            h(WhitePlumeriaProvider, () =>
              h(Chart, {
                title: 'Sample volume',
                type: 'line',
                data: [
                  { label: 'Mon', value: 12 },
                  { label: 'Tue', value: 18 },
                ],
              }),
            );
        },
      }),
    );
    expect(document.querySelector('.wpl-graph-line')).toBeTruthy();
    expect(screen.getByRole('rowheader', { name: 'Mon' })).toBeTruthy();
  });
});
