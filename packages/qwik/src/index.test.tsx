import { createDOM } from '@qwik.dev/core/testing';
import { describe, expect, it } from 'vitest';
import { Button } from './button';
import { Card } from './display';
import { DateRangePicker } from './calendar';
import { Slider } from './form';
import { DropdownMenu } from './menu';
import { useToast, WhitePlumeriaProvider } from './provider';
import { component$, useSignal } from '@qwik.dev/core';

const ToastProbe = component$(() => {
  const toast = useToast();
  return (
    <button
      type="button"
      onClick$={async (_, element) => {
        try {
          await toast.push({ title: 'Saved' });
          element.textContent = 'ok';
        } catch (error) {
          element.textContent = error instanceof Error ? error.message : 'failed';
        }
      }}
    >
      Push
    </button>
  );
});

describe('Qwik adapter', () => {
  it('gives a card a footer row only when it is asked for one', async () => {
    const { render, screen } = await createDOM();
    await render(
      <WhitePlumeriaProvider>
        <Card title="Invoice" footer={<button type="button">Pay</button>}>
          Invoice 1044 is open.
        </Card>
        <Card title="Notes" footer="Due today" />
        <Card title="Plain">No actions here.</Card>
      </WhitePlumeriaProvider>,
    );
    const cards = [...screen.querySelectorAll('.wpl-card')];
    expect(cards).toHaveLength(3);
    expect(cards[0]?.querySelector('.wpl-card-footer button')?.textContent).toBe('Pay');
    expect(cards[0]?.querySelector('.wpl-card-body')?.textContent).toContain('Invoice 1044 is open.');
    expect(cards[0]?.querySelectorAll('.wpl-card-body button')).toHaveLength(0);
    expect(cards[1]?.querySelector('.wpl-card-footer')?.textContent).toBe('Due today');
    expect(cards[2]?.querySelectorAll('.wpl-card-footer')).toHaveLength(0);
  });

  it('does not activate a loading button', async () => {
    let clicks = 0;
    const { render, screen, userEvent } = await createDOM();
    await render(
      <WhitePlumeriaProvider>
        <Button loading onClick$={() => { clicks += 1; }}>Save</Button>
      </WhitePlumeriaProvider>,
    );
    const button = screen.querySelector('button');
    expect(button?.hasAttribute('disabled')).toBe(true);
    expect(button?.textContent).toContain('Save');
    expect(button?.textContent).toContain('Loading');
    await userEvent(button, 'click');
    expect(clicks).toBe(0);
  });

  it('updates a slider from the input event', async () => {
    const { render, screen, userEvent } = await createDOM();
    await render(
      <WhitePlumeriaProvider>
        <Slider label="Density" defaultValue={10} />
      </WhitePlumeriaProvider>,
    );
    const slider = screen.querySelector('input');
    expect(slider).toBeTruthy();
    if (!slider) return;
    slider.value = '64';
    await userEvent(slider, 'input');
    expect(screen.textContent).toContain('64');
  });

  it('orders a date range when the later date is entered first', async () => {
    const { render, screen, userEvent } = await createDOM();
    await render(
      <WhitePlumeriaProvider>
        <DateRangePicker label="Stay" />
      </WhitePlumeriaProvider>,
    );
    const host = screen as unknown as Element;
    const inputs = Array.from(host.querySelectorAll('input'));
    const start = inputs[0];
    const end = inputs[1];
    expect(start && end).toBeTruthy();
    if (!start || !end) return;
    end.value = '2026-05-02';
    await userEvent(end, 'input');
    start.value = '2026-05-10';
    await userEvent(start, 'input');
    expect(start.value).toBe('2026-05-02');
    expect(end.value).toBe('2026-05-10');
    expect(host.textContent).toContain('May 2, 2026');
    expect(host.textContent).toContain('May 10, 2026');
  });

  it('opens a menu and reports the selected item', async () => {
    const Probe = component$(() => {
      const selected = useSignal('');
      return (
        <>
          <DropdownMenu
            label="Account"
            items={[{ id: 'profile', label: 'Profile' }, { id: 'theme', label: 'Theme', items: [{ id: 'ivory', label: 'Ivory' }] }]}
            onSelect$={(id) => { selected.value = id; }}
          />
          <output>{selected.value}</output>
        </>
      );
    });
    const { render, screen, userEvent } = await createDOM();
    await render(
      <WhitePlumeriaProvider>
        <Probe />
      </WhitePlumeriaProvider>,
    );
    const trigger = screen.querySelector('button');
    await userEvent(trigger, 'click');
    const host = screen as unknown as Element;
    const profile = Array.from(host.querySelectorAll('[role="menuitem"]')).find((item) => item.textContent?.includes('Profile'));
    expect(profile).toBeTruthy();
    await userEvent(profile ?? null, 'click');
    expect(host.querySelector('output')?.textContent).toBe('profile');
  });

  it('refuses to push a toast without the provider', async () => {
    const { render, screen, userEvent } = await createDOM();
    await render(<ToastProbe />);
    const button = screen.querySelector('button');
    await userEvent(button, 'click');
    expect(button?.textContent ?? '').toMatch(/WhitePlumeriaProvider/);
  });
});
