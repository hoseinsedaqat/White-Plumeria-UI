import { render } from 'solid-js/web';
import { describe, expect, it } from 'vitest';
import { Button, Carousel, DateRangePicker, WhitePlumeriaProvider } from './index.tsx';

function mount(node: () => unknown) {
  const host = document.createElement('div');
  document.body.append(host);
  const dispose = render(node as () => Element, host);
  return { host, dispose };
}

describe('solid adapter', () => {
  it('renders a real button and ignores clicks while loading', () => {
    let clicks = 0;
    const view = mount(() => (
      <WhitePlumeriaProvider>
        <Button loading onClick={() => (clicks += 1)}>
          Save
        </Button>
      </WhitePlumeriaProvider>
    ));
    const button = view.host.querySelector('button');
    expect(button?.getAttribute('aria-busy')).toBe('true');
    button?.click();
    expect(clicks).toBe(0);
    view.dispose();
  });

  it('moves a carousel one slide at a time', () => {
    const view = mount(() => (
      <WhitePlumeriaProvider>
        <Carousel
          label="Stills"
          slides={[
            { id: 'one', label: 'One' },
            { id: 'two', label: 'Two' },
          ]}
        />
      </WhitePlumeriaProvider>
    ));
    const next = [...view.host.querySelectorAll('button')].find((button) => button.textContent?.includes('Next'));
    next?.click();
    expect(view.host.querySelector('[data-current="true"]')?.getAttribute('data-slide-index')).toBe('1');
    view.dispose();
  });

  it('orders a date range when the later day is chosen first', () => {
    let value = { start: '', end: '' };
    const view = mount(() => (
      <WhitePlumeriaProvider>
        <DateRangePicker label="Stay" onValueChange={(next) => (value = { start: next.start, end: next.end })} />
      </WhitePlumeriaProvider>
    ));
    const [start, end] = view.host.querySelectorAll('input');
    start!.value = '2026-10-29';
    start!.dispatchEvent(new Event('input', { bubbles: true }));
    end!.value = '2026-10-27';
    end!.dispatchEvent(new Event('input', { bubbles: true }));
    expect(value).toEqual({ start: '2026-10-27', end: '2026-10-29' });
    view.dispose();
  });
});
