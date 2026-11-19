import { readFileSync } from 'node:fs';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vite-plus/test';
import { AVATAR_INTENT } from './avatar-intent';
import { AvatarField } from './components/AvatarField';
import { WishFields } from './components/WishFields';

// /js/picker.js sends `data-autosubmit` along as `intent`, after the form's own
// fields, so the server reads that value and nothing else.
const autosubmit = (html: string) => /data-autosubmit="([^"]*)"/.exec(html)?.[1];

describe('the profile picture form', () => {
  const html = renderToStaticMarkup(<AvatarField avatarKey="a/1/x.jpg" />);

  // A bare `data-autosubmit` renders as "true": the server took the form for
  // the e-mail form and removed the owner's recovery address.
  it('sends the intent the server looks for', () => {
    expect(autosubmit(html)).toBe(AVATAR_INTENT);
    expect(html).toContain(`name="intent" value="${AVATAR_INTENT}"`);
  });

  // "Ta bort" ticks the field; without script it is the one way to remove the picture.
  it('can remove a stored picture, with a checkbox only shown without script', () => {
    expect(html).toContain('data-crop-clear');
    expect(html).toMatch(/<label class="remove-image"><input type="checkbox" name="tabortbild"\/>/);
    const css = readFileSync('src/styles.css', 'utf8');
    expect(css).toMatch(/@media \(scripting: enabled\) \{ & \.remove-image \{ display: none; \} \}/);
  });
});

describe('the wish picture fields', () => {
  it('save at once with intent "utseende" where they autosave', () => {
    expect(autosubmit(renderToStaticMarkup(<WishFields prefix="t" icon="gift" autosave />))).toBe('utseende');
  });

  it('wait for "Lägg till" in a new wish', () => {
    expect(autosubmit(renderToStaticMarkup(<WishFields prefix="t" icon="gift" />))).toBeUndefined();
  });

  it('open a modal dialog with a name, also without script', () => {
    const html = renderToStaticMarkup(<WishFields prefix="t" icon="gift" />);
    expect(html).toContain('commandfor="t-utseende" command="show-modal"');
    expect(html).toMatch(/<dialog id="t-utseende"[^>]*aria-labelledby="t-utseende-rubrik"/);
    expect(html).toContain('id="t-utseende-rubrik" class="sr-only"');
  });
});
