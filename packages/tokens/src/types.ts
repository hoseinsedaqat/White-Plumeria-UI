export const colorKeys = [
  'bg',
  'bgMuted',
  'bgSubtle',
  'surface',
  'surfaceRaised',
  'text',
  'textMuted',
  'textSubtle',
  'textInverse',
  'border',
  'borderStrong',
  'focus',
  'primary',
  'primaryHover',
  'primaryActive',
  'primaryFg',
  'primarySubtle',
  'accent',
  'accentFg',
  'success',
  'successFg',
  'successSubtle',
  'warning',
  'warningFg',
  'warningSubtle',
  'danger',
  'dangerFg',
  'dangerSubtle',
  'info',
  'infoFg',
  'infoSubtle',
  'disabledBg',
  'disabledFg',
  'overlay',
  'shadow',
  'ring',
] as const;

export type ColorKey = (typeof colorKeys)[number];
export type ColorTokens = Record<ColorKey, string>;

export interface ThemeDefinition {
  name: ThemeName;
  label: string;
  labelFa: string;
  description: string;
  descriptionFa: string;
  light: ColorTokens;
  dark: ColorTokens;
}

export const themeNames = ['white', 'ivory', 'ink', 'saffron', 'lagoon', 'blush'] as const;
export type ThemeName = (typeof themeNames)[number];

export interface SharedTokens {
  fontSans: string;
  fontDisplay: string;
  fontMono: string;
  fontSize: Record<'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl', string>;
  lineHeight: Record<'tight' | 'normal' | 'relaxed', string>;
  fontWeight: Record<'regular' | 'medium' | 'semibold' | 'bold', string>;
  space: Record<
    '0' | '1' | '2' | '3' | '4' | '5' | '6' | '8' | '10' | '12' | '16' | '20' | '24',
    string
  >;
  radius: Record<'sm' | 'md' | 'lg' | 'xl' | 'full', string>;
  shadow: Record<'sm' | 'md' | 'lg', string>;
  duration: Record<'fast' | 'normal' | 'slow', string>;
  ease: string;
  zIndex: Record<'base' | 'sticky' | 'dropdown' | 'overlay' | 'modal' | 'toast' | 'tooltip', string>;
  content: Record<'sm' | 'md' | 'lg' | 'xl', string>;
  breakpoint: Record<'sm' | 'md' | 'lg' | 'xl', string>;
}
