import { readdirSync, readFileSync } from 'node:fs';
import { expect, test } from 'vitest';
import { parseTheme, THEMES } from './theme';

test('a known theme is kept, anything else is the plain list', () => {
  expect(parseTheme('polkagris')).toBe('polkagris');
  expect(parseTheme('nope')).toBeNull();
  expect(parseTheme(undefined)).toBeNull();
  expect(parseTheme('"] body { display: none')).toBeNull();
});

test('every theme has its file in themes/, and themes/ has no others', () => {
  const dir = new URL('./themes/', import.meta.url);
  const files = readdirSync(dir).filter((file) => file.endsWith('.css'));
  expect(files.sort()).toEqual(THEMES.map(([id]) => `${id}.css`).sort());
  for (const [id] of THEMES) {
    const css = readFileSync(new URL(`${id}.css`, dir), 'utf8');
    expect(css).toContain(`:root:has([data-theme="${id}"])`);
    // and draws its own card for the picker
    expect(css).toContain(`.theme-card[data-card="${id}"]`);
  }
  const index = readFileSync(new URL('./themes.css', import.meta.url), 'utf8');
  for (const file of files) expect(index).toContain(`@import './themes/${file}';`);
});

// The theme files are read before the shared rules. Without the nested layer
// the shared rules came last and won: no band behind the heading.
test('the shared rules sit in a layer below the themes', () => {
  const index = readFileSync(new URL('./themes.css', import.meta.url), 'utf8');
  expect(index).toMatch(/@layer themes \{\s*@layer shared \{/);
});
