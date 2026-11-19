import { afterEach, describe, expect, it, vi } from 'vite-plus/test';

// Loads public/js/theme.js against a stand-in for the owner's list page, with
// `value` as the card that is checked, and returns what the script touched.
async function load({ value, label, saves = true }) {
  let onChange;
  const main = { dataset: { theme: 'polkagris' } };
  const name = { textContent: 'Polkagris' };
  let onClick;
  const chosen = { value, dataset: { label }, autofocus: false };
  const other = { value: 'other', dataset: {}, autofocus: true };
  const button = { hidden: false };
  const close = { textContent: 'Avbryt' };
  const dialog = { close: vi.fn() };
  const form = {
    action: '/lista',
    closest: (selector) => (selector === 'dialog' ? dialog : main),
    querySelector: (selector) => (selector === '[data-save]' ? button : selector === '[data-close]' ? close : chosen),
    querySelectorAll: () => [other, chosen],
    addEventListener: (type, listener) => {
      if (type === 'change') onChange = listener;
      if (type === 'click') onClick = listener;
    },
  };
  main.querySelector = () => name;

  const fetch = vi.fn(() => (saves ? Promise.resolve({ ok: true }) : Promise.reject(new Error('offline'))));
  const location = { reload: vi.fn() };
  vi.stubGlobal('document', { querySelector: () => form });
  vi.stubGlobal('matchMedia', () => ({ matches: true }));
  vi.stubGlobal('FormData', class {});
  vi.stubGlobal('fetch', fetch);
  vi.stubGlobal('location', location);
  vi.resetModules();
  await import('../public/js/theme.js');
  const click = (detail, onCard = true) => onClick({ detail, target: { closest: () => (onCard ? {} : null) } });
  return { main, name, button, close, dialog, chosen, other, fetch, location, change: () => onChange(), click };
}

afterEach(() => vi.unstubAllGlobals());

describe('theme picker', () => {
  it('hides the save button: choosing saves', async () => {
    const { button, close } = await load({ value: 'vinternatt', label: 'Vinternatt' });
    expect(button.hidden).toBe(true);
    expect(close.textContent).toBe('Stäng');
  });

  it('closes the picker when a card is tapped', async () => {
    const page = await load({ value: 'vinternatt', label: 'Vinternatt' });

    page.click(1);

    expect(page.dialog.close).toHaveBeenCalledOnce();
  });

  it('stays open while the arrow keys move between cards, and for a tap beside them', async () => {
    const page = await load({ value: 'vinternatt', label: 'Vinternatt' });

    page.click(0);
    page.click(1, false);

    expect(page.dialog.close).not.toHaveBeenCalled();
  });

  it('dresses the page in the chosen theme at once, and saves it', async () => {
    const page = await load({ value: 'vinternatt', label: 'Vinternatt' });

    await page.change();

    expect(page.main.dataset.theme).toBe('vinternatt');
    expect(page.name.textContent).toBe('Vinternatt');
    // focus follows the choice, for the next time the picker opens
    expect(page.chosen.autofocus).toBe(true);
    expect(page.other.autofocus).toBe(false);
    expect(page.fetch).toHaveBeenCalledWith('/lista', expect.objectContaining({ method: 'POST' }));
    expect(page.location.reload).not.toHaveBeenCalled();
  });

  it('undresses the page when no theme is chosen', async () => {
    const page = await load({ value: '', label: 'Välj' });

    await page.change();

    expect(page.main.dataset.theme).toBeUndefined();
    expect(page.name.textContent).toBe('Välj');
  });

  it('goes back to what the server has when the save fails', async () => {
    const page = await load({ value: 'vinternatt', label: 'Vinternatt', saves: false });

    await page.change();

    expect(page.location.reload).toHaveBeenCalledOnce();
  });

  it('does nothing on a page without the picker', async () => {
    vi.stubGlobal('document', { querySelector: () => null });
    vi.resetModules();
    await expect(import('../public/js/theme.js')).resolves.toBeDefined();
  });
});
