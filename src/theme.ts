// The themes a list can wear (issue #9). Each one is a file in src/themes/
// with the same name, which also draws the theme's card in the picker.

export const THEMES = [
  ['vinternatt', 'Vinternatt'],
  ['polkagris', 'Polkagris'],
  ['pepparkaka', 'Pepparkaka'],
  ['adventsstjarna', 'Adventsstjärna'],
  ['ljusslinga', 'Ljusslinga'],
] as const;

export type Theme = (typeof THEMES)[number][0];

/** The theme by that name, or null: an unknown name is the plain list, never an error. */
export function parseTheme(value: unknown): Theme | null {
  return THEMES.find(([id]) => id === value)?.[0] ?? null;
}
