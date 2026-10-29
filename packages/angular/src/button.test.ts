import { createComponent, EnvironmentInjector, provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { BrowserTestingModule, platformBrowserTesting } from '@angular/platform-browser/testing';
import { beforeAll, describe, expect, it } from 'vitest';
import { Button } from '../dist/fesm2022/white-plumeria-angular.mjs';

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
});
