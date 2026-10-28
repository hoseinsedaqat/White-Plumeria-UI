import { colorKeys } from './types.ts';
import type { ColorTokens, ThemeName } from './types.ts';
import { sharedTokens, themes } from './themes.ts';

export function colorToCssName(key: string): string {
  return key.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`);
}

export function colorDeclarations(colors: ColorTokens, indent = '  '): string {
  return colorKeys
    .map((key) => `${indent}--wpl-color-${colorToCssName(key)}: ${colors[key]};`)
    .join('\n');
}

function sharedDeclarations(): string {
  const lines = [
    `--wpl-font-sans: ${sharedTokens.fontSans};`,
    `--wpl-font-display: ${sharedTokens.fontDisplay};`,
    `--wpl-font-mono: ${sharedTokens.fontMono};`,
    ...Object.entries(sharedTokens.fontSize).map(
      ([key, value]) => `--wpl-font-size-${key}: ${value};`,
    ),
    ...Object.entries(sharedTokens.lineHeight).map(
      ([key, value]) => `--wpl-line-height-${key}: ${value};`,
    ),
    ...Object.entries(sharedTokens.fontWeight).map(
      ([key, value]) => `--wpl-font-weight-${key}: ${value};`,
    ),
    ...Object.entries(sharedTokens.space).map(([key, value]) => `--wpl-space-${key}: ${value};`),
    ...Object.entries(sharedTokens.radius).map(([key, value]) => `--wpl-radius-${key}: ${value};`),
    ...Object.entries(sharedTokens.shadow).map(([key, value]) => `--wpl-shadow-${key}: ${value};`),
    ...Object.entries(sharedTokens.duration).map(
      ([key, value]) => `--wpl-duration-${key}: ${value};`,
    ),
    `--wpl-ease: ${sharedTokens.ease};`,
    ...Object.entries(sharedTokens.zIndex).map(([key, value]) => `--wpl-z-${key}: ${value};`),
    ...Object.entries(sharedTokens.content).map(
      ([key, value]) => `--wpl-content-${key}: ${value};`,
    ),
  ];
  return lines.map((line) => `  ${line}`).join('\n');
}

const defaultThemeName = 'white' satisfies ThemeName;

function themeSelector(name: ThemeName, scheme: 'light' | 'dark'): string {
  if (scheme === 'light') {
    return name === defaultThemeName
      ? `:root,\n[data-wpl-theme="${name}"]`
      : `[data-wpl-theme="${name}"]`;
  }
  return `[data-wpl-theme="${name}"][data-wpl-scheme="dark"]`;
}

export function renderTokensCss(): string {
  const fallback = themes.find((theme) => theme.name === defaultThemeName);
  if (!fallback) throw new Error(`Missing default theme: ${defaultThemeName}`);
  const chunks: string[] = [
    '/* Generated from packages/tokens. Do not edit by hand. */',
    `${themeSelector(defaultThemeName, 'light')} {\n${sharedDeclarations()}\n${colorDeclarations(fallback.light)}\n}`,
  ];

  for (const theme of themes) {
    if (theme.name !== defaultThemeName) {
      chunks.push(
        `${themeSelector(theme.name, 'light')} {\n${colorDeclarations(theme.light)}\n}`,
      );
    }
    chunks.push(`${themeSelector(theme.name, 'dark')} {\n${colorDeclarations(theme.dark)}\n}`);
  }

  const darkMedia = themes
    .map((theme) => {
      const selector =
        theme.name === defaultThemeName
          ? `:root:not([data-wpl-scheme="light"]),\n  [data-wpl-theme="${defaultThemeName}"]:not([data-wpl-scheme="light"])`
          : `[data-wpl-theme="${theme.name}"]:not([data-wpl-scheme="light"])`;
      return `  ${selector} {\n${colorDeclarations(theme.dark, '    ')}\n  }`;
    })
    .join('\n\n');

  chunks.push(`@media (prefers-color-scheme: dark) {\n${darkMedia}\n}`);
  chunks.push(
    '/* Breakpoints are documented tokens, not CSS variables: media queries cannot read custom properties portably. sm 40rem, md 48rem, lg 64rem, xl 80rem. */',
  );
  return `${chunks.join('\n\n')}\n`;
}
