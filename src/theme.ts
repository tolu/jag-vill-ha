// The themes a list can wear (issue #9). Each one is a file in src/themes/
// with the same name. The third value is the dot shown next to the name where
// the owner chooses: a CSS background that hints at the theme.

export const THEMES = [
  ['vinternatt', 'Vinternatt', 'linear-gradient(oklch(27% 0.09 275), oklch(46% 0.115 255))'],
  ['polkagris', 'Polkagris', 'repeating-linear-gradient(-45deg, oklch(57% 0.21 25) 0 0.25rem, white 0.25rem 0.5rem)'],
  ['pepparkaka', 'Pepparkaka', 'oklch(46% 0.095 52)'],
  ['adventsstjarna', 'Adventsstjärna', 'radial-gradient(oklch(84% 0.11 85) 30%, oklch(25% 0.065 350) 34%)'],
  ['ljusslinga', 'Ljusslinga', 'oklch(31% 0.06 162)'],
] as const;

export type Theme = (typeof THEMES)[number][0];

/** The theme by that name, or null: an unknown name is the plain list, never an error. */
export function parseTheme(value: unknown): Theme | null {
  return THEMES.find(([id]) => id === value)?.[0] ?? null;
}
