import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vite-plus/test';
import { WISH_ICONS } from './icons';

const sprite = readFileSync('public/icons/wish-icons.svg', 'utf8');
const css = readFileSync('src/styles.css', 'utf8');

describe.each(WISH_ICONS.map(([name]) => name))('icon %s', (name) => {
  it('exists in the sprite', () => {
    expect(sprite).toContain(`<symbol id="${name}"`);
  });

  // The picker box shows the checked icon through one CSS selector per icon.
  it('has its picker rule in the stylesheet', () => {
    expect(css).toContain(`.appearance:has(input[value="${name}"]:checked) .picker [data-icon="${name}"]`);
  });
});

// Regression: a dropped image used to share the box with the random icon,
// because the per-icon "show" selectors out-weighed the rule that hides icons.
// The hide rule therefore lives in a later cascade layer, which always wins.
describe('picker box with an image', () => {
  it('declares the overrides layer last', () => {
    expect(css).toMatch(/@layer base, components, themes, overrides;/);
  });

  it('hides the icons from the overrides layer', () => {
    const overrides = css.slice(css.indexOf('@layer overrides {'));
    expect(css).toContain('@layer overrides {');
    expect(overrides).toContain('.picker:has(img:not([hidden])) svg { display: none; }');
  });
});
