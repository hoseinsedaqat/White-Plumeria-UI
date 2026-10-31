import { describe, expect, it } from 'vitest';
import { contrastRatio } from './contrast.ts';
import { themes } from './themes.ts';
import type { ColorTokens } from './types.ts';

function distinct(colors: ColorTokens, left: keyof ColorTokens, right: keyof ColorTokens) {
  expect(colors[left].toLowerCase(), `${left} should not match ${right}`).not.toBe(colors[right].toLowerCase());
}

describe('theme surfaces', () => {
  it('keeps canvas, muted, and raised fills from colliding in every theme', () => {
    for (const theme of themes) {
      for (const scheme of ['light', 'dark'] as const) {
        const colors = theme[scheme];
        distinct(colors, 'surface', 'bg');
        distinct(colors, 'surface', 'bgMuted');
        distinct(colors, 'bgMuted', 'bg');
        distinct(colors, 'warning', 'primary');
        distinct(colors, 'danger', 'primary');
        expect(contrastRatio(colors.text, colors.bg), `${theme.name} ${scheme} text on canvas`).toBeGreaterThanOrEqual(4.5);
        expect(contrastRatio(colors.text, colors.surface), `${theme.name} ${scheme} text on surface`).toBeGreaterThanOrEqual(4.5);
        expect(contrastRatio(colors.primaryFg, colors.primary), `${theme.name} ${scheme} primary text`).toBeGreaterThanOrEqual(4.5);
      }
    }
  });
});
