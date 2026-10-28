export { colorKeys, themeNames } from './types.ts';
export type { ColorKey, ColorTokens, SharedTokens, ThemeDefinition, ThemeName } from './types.ts';
export { sharedTokens, themes } from './themes.ts';
import { themes } from './themes.ts';
export { colorDeclarations, colorToCssName, renderTokensCss } from './css.ts';
export { contrastRatio, meetsContrast, relativeLuminance } from './contrast.ts';

export function getTheme(name: string) {
  return themes.find((theme) => theme.name === name);
}
