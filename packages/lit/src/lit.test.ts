import { html, render } from 'lit';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { catalog, getComponent } from '@white-plumeria/core';
import { describe, expect, it } from 'vitest';
import { hostCss } from './host-css';
import type { Carousel, DataTable, DateRangePicker, DropdownMenu, Slider, WhitePlumeriaProvider } from './index';
import { Button, defineTag, defineWhitePlumeria, pushToast } from './index';

describe('@white-plumeria/lit', () => {
  it('does not redefine a tag that is already registered', () => {
    class Stub extends HTMLElement {}
    customElements.define('wpl-lit-probe', Stub);
    expect(defineTag('wpl-lit-probe', class extends HTMLElement {})).toBe(false);
    expect(customElements.get('wpl-lit-probe')).toBe(Stub);
    const first = defineWhitePlumeria();
    const second = defineWhitePlumeria();
    expect(first.defined.length + first.skipped.length).toBeGreaterThan(60);
    expect(second.defined).toEqual([]);
    expect(customElements.get('wpl-button')).toBe(Button);
  });

  it('ships the host stylesheet that defineWhitePlumeria installs', () => {
    const hostPath = [resolve(process.cwd(), 'host.css'), resolve(process.cwd(), 'packages/lit/host.css')].find((path) => existsSync(path));
    expect(hostPath).toBeTruthy();
    const file = readFileSync(hostPath ?? '', 'utf8');
    expect(file.trim()).toBe(hostCss.trim());
    expect(document.getElementById('wpl-lit-host')?.textContent).toContain('wpl-button-group');
  });

  it('does not activate a loading button', async () => {
    const button = document.createElement('wpl-button') as Button;
    button.textContent = 'Save';
    button.loading = true;
    let clicks = 0;
    button.addEventListener('wpl-click', () => {
      clicks += 1;
    });
    document.body.append(button);
    await button.updateComplete;
    const inner = button.querySelector('button');
    expect(inner?.hasAttribute('disabled')).toBe(true);
    expect(inner?.textContent).toContain('Save');
    expect(inner?.textContent).toContain('Loading');
    inner?.click();
    expect(clicks).toBe(0);
  });

  it('updates a slider from the input event', async () => {
    const slider = document.createElement('wpl-slider') as Slider;
    slider.label = 'Density';
    slider.defaultValue = 10;
    document.body.append(slider);
    await slider.updateComplete;
    const input = slider.querySelector('input');
    expect(input).toBeTruthy();
    if (!input) return;
    input.value = '64';
    input.dispatchEvent(new Event('input', { bubbles: true }));
    await slider.updateComplete;
    expect(slider.textContent).toContain('64');
  });

  it('orders a date range when the later date is entered first', async () => {
    const picker = document.createElement('wpl-date-range-picker') as DateRangePicker;
    picker.label = 'Stay';
    document.body.append(picker);
    await picker.updateComplete;
    const inputs = [...picker.querySelectorAll('input')];
    const start = inputs[0];
    const end = inputs[1];
    expect(start && end).toBeTruthy();
    if (!start || !end) return;
    end.value = '2026-05-02';
    end.dispatchEvent(new Event('input', { bubbles: true }));
    await picker.updateComplete;
    start.value = '2026-05-10';
    start.dispatchEvent(new Event('input', { bubbles: true }));
    await picker.updateComplete;
    expect(start.value).toBe('2026-05-02');
    expect(end.value).toBe('2026-05-10');
    expect(picker.textContent).toContain('May 2, 2026');
    expect(picker.textContent).toContain('May 10, 2026');
  });

  it('opens a menu and reports the selected item', async () => {
    const menu = document.createElement('wpl-dropdown-menu') as DropdownMenu;
    menu.label = 'Account';
    menu.items = [
      { id: 'profile', label: 'Profile' },
      { id: 'theme', label: 'Theme', items: [{ id: 'ivory', label: 'Ivory' }] },
    ];
    let selected = '';
    menu.addEventListener('wpl-select', (event) => {
      selected = (event as CustomEvent<{ id: string }>).detail.id;
    });
    document.body.append(menu);
    await menu.updateComplete;
    menu.querySelector('button')?.click();
    await menu.updateComplete;
    const profile = [...menu.querySelectorAll('[role="menuitem"]')].find((item) => item.textContent?.includes('Profile'));
    expect(profile).toBeTruthy();
    profile?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    expect(selected).toBe('profile');
  });

  it('refuses to push a toast without the provider', () => {
    expect(() => pushToast(document.body, { title: 'Saved' })).toThrow(/WhitePlumeriaProvider/);
  });

  it('renders a toast from the provider', async () => {
    const provider = document.createElement('wpl-provider') as WhitePlumeriaProvider;
    provider.persist = false;
    document.body.append(provider);
    await provider.updateComplete;
    provider.pushToast({ title: 'Saved', variant: 'success' });
    await provider.updateComplete;
    expect(provider.textContent).toContain('Saved');
    expect(provider.querySelector('.wpl-toast')).toBeTruthy();
  });

  it('keeps carousel slides in one track', async () => {
    const carousel = document.createElement('wpl-carousel') as Carousel;
    carousel.label = 'Palettes';
    carousel.slides = [
      { id: 'white', label: 'White', content: 'Ivory paper.' },
      { id: 'ink', label: 'Ink', content: 'Charcoal ink.' },
    ];
    document.body.append(carousel);
    await carousel.updateComplete;
    const track = carousel.querySelector('.wpl-carousel-track');
    expect(track?.querySelectorAll('.wpl-carousel-slide')).toHaveLength(2);
    expect(carousel.querySelectorAll('.wpl-carousel-slide')).toHaveLength(2);
    expect(carousel.querySelector('[data-current="true"]')?.textContent).toContain('Ivory paper.');
    carousel.querySelector<HTMLButtonElement>('[aria-label="Next"]')?.click();
    await carousel.updateComplete;
    expect(carousel.querySelector('[data-current="true"]')?.textContent).toContain('Charcoal ink.');
  });

  it('sorts a data table from the column header', async () => {
    const table = document.createElement('wpl-data-table') as DataTable;
    table.caption = 'Sample invoices';
    table.filterable = false;
    table.columns = [
      { id: 'name', header: 'Name', text: (row) => String((row as { name: string }).name) },
      { id: 'amount', header: 'Amount', text: (row) => String((row as { amount: number }).amount), sortValue: (row) => (row as { amount: number }).amount },
    ];
    table.rows = [
      { name: 'North', amount: 40 },
      { name: 'South', amount: 12 },
    ];
    document.body.append(table);
    await table.updateComplete;
    const amount = [...table.querySelectorAll('button')].find((button) => button.textContent?.includes('Amount'));
    amount?.click();
    await table.updateComplete;
    const cells = [...table.querySelectorAll('tbody td')].map((cell) => cell.textContent?.trim());
    expect(cells[0]).toBe('South');
    expect(cells[1]).toBe('12');
  });

  it('keeps projected button text after the parent template re-renders', async () => {
    const host = document.createElement('div');
    document.body.append(host);
    const paint = (open: boolean) => {
      render(
        html`<wpl-dialog .open=${open} title="Void this invoice?"><wpl-button variant="danger">Confirm void</wpl-button></wpl-dialog>`,
        host,
      );
    };
    paint(true);
    const dialog = host.querySelector('wpl-dialog');
    const button = host.querySelector('wpl-button') as Button | null;
    await button?.updateComplete;
    expect(dialog?.textContent).toContain('Confirm void');
    paint(true);
    await button?.updateComplete;
    expect(host.querySelectorAll('wpl-button')).toHaveLength(1);
    expect(host.textContent?.match(/Confirm void/g)).toHaveLength(1);
  });

  it('publishes explicit-end-tag Lit catalog examples', () => {
    const button = getComponent('Button');
    const navbar = getComponent('Navbar');
    const range = getComponent('DateRangePicker');
    expect(button?.examples.lit).toContain('defineWhitePlumeria');
    expect(button?.examples.lit).toContain('<wpl-button variant="primary">Save changes</wpl-button>');
    expect(navbar?.examples.lit).toContain('</wpl-navbar>');
    expect(navbar?.examples.lit).toContain('.items=${');
    expect(range?.examples.lit).toContain('show-time');
    expect(range?.examples.lit).toContain('</wpl-date-range-picker>');
    expect(button?.examples.lit).not.toMatch(/<wpl-[^>\n]*\/>/);
    for (const component of catalog) {
      expect(component.examples.lit, component.name).toContain('defineWhitePlumeria');
      expect(component.examples.lit, component.name).not.toMatch(/<wpl-[^>\n]*\/>/);
    }
  });
});
