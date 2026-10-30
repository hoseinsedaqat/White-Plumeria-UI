import { fireEvent, render } from '@testing-library/preact';
import { describe, expect, it } from 'vitest';
import { Button, Carousel, DateRangePicker, Slider, WhitePlumeriaProvider } from './index.ts';

describe('preact adapter', () => {
  it('renders a real button and ignores clicks while loading', () => {
    let clicks = 0;
    const view = render(
      <WhitePlumeriaProvider>
        <Button loading onClick={() => (clicks += 1)}>
          Save
        </Button>
      </WhitePlumeriaProvider>,
    );
    const button = view.getByRole('button', { name: /Save/ });
    expect(button.getAttribute('aria-busy')).toBe('true');
    expect(button.hasAttribute('disabled')).toBe(true);
    fireEvent.click(button);
    expect(clicks).toBe(0);
    view.unmount();
  });

  it('moves a carousel one slide at a time', () => {
    const view = render(
      <WhitePlumeriaProvider>
        <Carousel
          label="Stills"
          slides={[
            { id: 'one', label: 'One' },
            { id: 'two', label: 'Two' },
          ]}
        />
      </WhitePlumeriaProvider>,
    );
    const next = [...view.container.querySelectorAll('button')].find((button) =>
      button.textContent?.includes('Next'),
    );
    if (!next) throw new Error('Expected a next button');
    fireEvent.click(next);
    expect(
      view.container.querySelector('[data-current="true"]')?.getAttribute('data-slide-index'),
    ).toBe('1');
    view.unmount();
  });

  it('updates a slider from the input event, not only on release', () => {
    const view = render(
      <WhitePlumeriaProvider>
        <Slider label="Density" defaultValue={10} />
      </WhitePlumeriaProvider>,
    );
    const slider = view.getByRole('slider', { name: 'Density' });
    if (!(slider instanceof HTMLInputElement)) throw new Error('Expected a range input');
    slider.value = '64';
    fireEvent.input(slider);
    expect(view.container.querySelector('output')?.textContent).toContain('64');
    view.unmount();
  });

  it('orders a date range when the later day is chosen first', () => {
    let value = { start: '', end: '' };
    const view = render(
      <WhitePlumeriaProvider>
        <DateRangePicker
          label="Stay"
          onValueChange={(next) => (value = { start: next.start, end: next.end })}
        />
      </WhitePlumeriaProvider>,
    );
    const [start, end] = view.container.querySelectorAll('input');
    if (!start || !end) throw new Error('Expected start and end inputs');
    start.value = '2026-10-29';
    fireEvent.input(start);
    end.value = '2026-10-27';
    fireEvent.input(end);
    expect(value).toEqual({ start: '2026-10-27', end: '2026-10-29' });
    view.unmount();
  });
});
