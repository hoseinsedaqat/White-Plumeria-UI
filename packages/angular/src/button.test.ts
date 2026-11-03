import { createComponent, EnvironmentInjector, provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { BrowserTestingModule, platformBrowserTesting } from '@angular/platform-browser/testing';
import { beforeAll, describe, expect, it } from 'vitest';
import { Button, Tooltip } from '../dist/fesm2022/white-plumeria-angular.mjs';

describe('Angular Button', () => {
  beforeAll(() => {
    TestBed.initTestEnvironment(BrowserTestingModule, platformBrowserTesting([provideZonelessChangeDetection()]));
  });

  it('blocks activation while loading and exposes the busy state', () => {
    const host = document.createElement('button');
    document.body.append(host);
    const ref = createComponent(Button, {
      environmentInjector: TestBed.inject(EnvironmentInjector),
      hostElement: host,
    });
    let clicks = 0;
    host.addEventListener('click', () => {
      clicks += 1;
    });
    ref.setInput('loading', true);
    ref.changeDetectorRef.detectChanges();

    host.click();

    expect(host.tagName).toBe('BUTTON');
    expect(host.className).toContain('wpl-btn');
    expect(host.getAttribute('aria-busy')).toBe('true');
    expect(host.disabled).toBe(true);
    expect(clicks).toBe(0);
    ref.destroy();
    host.remove();
  });

  it('waits to show a tooltip and dismisses it with escape', async () => {
    const host = document.createElement('wpl-tooltip');
    document.body.append(host);
    const button = document.createElement('button');
    button.textContent = 'Copy';
    const ref = createComponent(Tooltip, {
      environmentInjector: TestBed.inject(EnvironmentInjector),
      hostElement: host,
      projectableNodes: [[button]],
    });
    ref.setInput('content', 'Copy token');
    ref.changeDetectorRef.detectChanges();
    button.dispatchEvent(new FocusEvent('focusin', { bubbles: true }));
    await new Promise((resolve) => setTimeout(resolve, 420));
    ref.changeDetectorRef.detectChanges();
    expect(host.querySelector('[role="tooltip"]')?.textContent).toContain('Copy token');
    button.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    ref.changeDetectorRef.detectChanges();
    expect(host.querySelector('[role="tooltip"]')).toBeNull();
    ref.destroy();
    host.remove();
  });
});
