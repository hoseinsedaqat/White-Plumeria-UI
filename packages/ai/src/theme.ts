import { colorKeys, contrastRatio, type ColorKey } from '@white-plumeria/tokens';
import { colorToCssName } from '@white-plumeria/tokens';
import type { ContrastCheck, GeneratedTheme } from './types.ts';

interface PaletteSeed {
  name: string;
  description: string;
  bg: string;
  text: string;
  primary: string;
  accent: string;
  dark?: boolean;
}

const seeds: Array<{ words: string[]; seed: PaletteSeed }> = [
  {
    words: ['finance', 'مالی', 'saffron', 'زعفران', 'gold'],
    seed: { name: 'saffron-request', description: 'Saffron editorial surfaces', bg: '#FBF6EA', text: '#1A1408', primary: '#7A4E08', accent: '#C98A12' },
  },
  {
    words: ['teal', 'lagoon', 'sea', 'تالاب'],
    seed: { name: 'lagoon-request', description: 'Cool teal surfaces', bg: '#F3F6F4', text: '#102220', primary: '#0E4F4C', accent: '#1F7A74' },
  },
  {
    words: ['formal', 'ink', 'رسمی', 'letterpress'],
    seed: { name: 'ink-request', description: 'Letterpress ink', bg: '#F3F0E8', text: '#12110F', primary: '#1A1916', accent: '#8A5A12' },
  },
  {
    words: ['blush', 'coral', 'rose'],
    seed: { name: 'blush-request', description: 'Stone and coral', bg: '#FBF6F3', text: '#241614', primary: '#8E3D34', accent: '#C46B5A' },
  },
  {
    words: ['minimal', 'مینیمال', 'quiet'],
    seed: { name: 'minimal-request', description: 'Quiet ivory', bg: '#F7F4EE', text: '#1C1915', primary: '#3F3428', accent: '#A9782E' },
  },
];

export function generateTheme(description: string): GeneratedTheme {
  const lower = description.toLowerCase();
  const dark = /(dark|night|تاریک|شب)/i.test(description);
  const high = /(contrast|کنتراست|high-contrast)/i.test(description);
  const match = seeds.find((item) => item.words.some((word) => lower.includes(word)));
  const seed = match?.seed ?? {
    name: 'custom-request',
    description: 'Custom request mapped to ivory-compatible tokens',
    bg: '#F6F1E8',
    text: '#1C1915',
    primary: '#5C3D16',
    accent: '#A9782E',
  };
  const adjustments: string[] = [];
  let primary = seed.primary;
  let primaryFg = '#FFF9F0';
  if ((contrastRatio(primaryFg, primary) ?? 0) < 4.5) {
    primary = darken(primary, 0.2);
    adjustments.push('Primary was darkened so button text meets WCAG AA 4.5:1.');
  }
  if (high && (contrastRatio(seed.text, seed.bg) ?? 0) < 7) {
    adjustments.push('High-contrast was requested. Text already meets AA; AAA is not guaranteed for every pair.');
  }
  const light = paint(seed.bg, seed.text, primary, primaryFg, seed.accent, false);
  const darkTokens = paint(darken(seed.text, 0.05), '#F6F1E8', lighten(seed.accent, 0.15), '#1C1408', lighten(seed.accent, 0.2), true);
  const checks = checkPairs(dark ? darkTokens : light);
  const failing = checks.filter((check) => !check.pass);
  if (failing.length) {
    adjustments.push(`${failing.length} pair(s) still miss the target. They are listed in the contrast report and should not be shipped as-is.`);
  }
  return {
    name: seed.name,
    description: seed.description,
    light,
    dark: darkTokens,
    css: renderThemeCss(seed.name, dark ? darkTokens : light),
    checks,
    adjustments,
  };
}

function paint(bg: string, text: string, primary: string, primaryFg: string, accent: string, dark: boolean): Record<string, string> {
  const tokens: Record<ColorKey, string> = {
    bg,
    bgMuted: dark ? lighten(bg, 0.05) : darken(bg, 0.045),
    bgSubtle: dark ? lighten(bg, 0.08) : darken(bg, 0.02),
    surface: dark ? lighten(bg, 0.12) : '#FFFCF7',
    surfaceRaised: dark ? lighten(bg, 0.18) : '#FFFFFF',
    text,
    textMuted: dark ? darken(text, 0.12) : lighten(text, 0.28),
    textSubtle: dark ? darken(text, 0.2) : lighten(text, 0.38),
    textInverse: primaryFg,
    border: dark ? lighten(bg, 0.16) : darken(bg, 0.08),
    borderStrong: dark ? lighten(bg, 0.35) : lighten(text, 0.35),
    focus: accent,
    primary,
    primaryHover: dark ? lighten(primary, 0.08) : darken(primary, 0.08),
    primaryActive: dark ? darken(primary, 0.08) : darken(primary, 0.16),
    primaryFg,
    primarySubtle: dark ? lighten(bg, 0.12) : lighten(accent, 0.55),
    accent,
    accentFg: (contrastRatio(text, accent) ?? 0) >= (contrastRatio(bg, accent) ?? 0) ? text : bg,
    success: dark ? '#8FCBB0' : '#1E5A43',
    successFg: dark ? '#04140E' : '#F3FBF7',
    successSubtle: dark ? '#17332C' : '#E5F3EC',
    warning: dark ? '#E0A23A' : '#8A5A10',
    warningFg: dark ? '#1C1408' : '#FFF8EB',
    warningSubtle: dark ? '#3A2E18' : '#F8EBD2',
    danger: dark ? '#F0A8A0' : '#8E2F2A',
    dangerFg: dark ? '#2A0E0C' : '#FFF8F6',
    dangerSubtle: dark ? '#3A201C' : '#F8E6E3',
    info: dark ? '#9EC4D8' : '#1E4E6A',
    infoFg: dark ? '#0C1C24' : '#F4FAFC',
    infoSubtle: dark ? '#1A2C36' : '#E4EEF3',
    disabledBg: dark ? lighten(bg, 0.08) : darken(bg, 0.06),
    disabledFg: '#8A8178',
    overlay: 'rgba(20, 16, 12, 0.5)',
    shadow: dark ? 'rgba(0, 0, 0, 0.45)' : 'rgba(28, 25, 21, 0.1)',
    ring: 'rgba(169, 120, 46, 0.45)',
  };
  return tokens;
}

function checkPairs(tokens: Record<string, string>): ContrastCheck[] {
  const pairs: Array<[string, string, number]> = [
    ['text', 'bg', 4.5],
    ['text', 'surface', 4.5],
    ['primaryFg', 'primary', 4.5],
    ['accentFg', 'accent', 4.5],
    ['successFg', 'success', 4.5],
    ['warningFg', 'warning', 4.5],
    ['dangerFg', 'danger', 4.5],
    ['infoFg', 'info', 4.5],
  ];
  return pairs.map(([fg, bg, minimum]) => {
    const ratio = contrastRatio(tokens[fg] ?? '', tokens[bg] ?? '');
    return {
      pair: `${fg} on ${bg}`,
      ratio,
      minimum,
      pass: ratio !== null && ratio >= minimum,
    };
  });
}

export function renderThemeCss(name: string, tokens: Record<string, string>): string {
  const body = colorKeys
    .map((key) => `  --wpl-color-${colorToCssName(key)}: ${tokens[key]};`)
    .join('\n');
  return `.wpl-theme-${name} {\n${body}\n}\n`;
}

function hexToRgb(hex: string): [number, number, number] {
  const raw = hex.replace('#', '');
  return [
    Number.parseInt(raw.slice(0, 2), 16),
    Number.parseInt(raw.slice(2, 4), 16),
    Number.parseInt(raw.slice(4, 6), 16),
  ];
}

function rgbToHex(r: number, g: number, b: number): string {
  return `#${[r, g, b].map((channel) => Math.round(Math.min(255, Math.max(0, channel))).toString(16).padStart(2, '0')).join('')}`;
}

function mix(hex: string, target: number, amount: number): string {
  const [r, g, b] = hexToRgb(hex);
  return rgbToHex(r + (target - r) * amount, g + (target - g) * amount, b + (target - b) * amount);
}

function darken(hex: string, amount: number): string {
  return mix(hex, 0, amount);
}

function lighten(hex: string, amount: number): string {
  return mix(hex, 255, amount);
}

export function themeAsConfig(theme: GeneratedTheme): string {
  return JSON.stringify({ name: theme.name, light: theme.light, dark: theme.dark }, null, 2);
}
