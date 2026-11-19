import { afterEach, describe, expect, it, vi } from 'vite-plus/test';

// Loads public/js/theme.js against a stand-in for the owner's list page, with
// `value` as the card that is checked, and returns what the script touched.
async function load({ value, label, saves = true }) {
  let onChange;
  const main = { dataset: { theme: 'polkagris' } };
  const name = { textContent: 'Polkagris' };
  const verb = { textContent: 'Byt' };
  const button = { hidden: false };
  const form = {
    action: '/lista',
    closest: () => main,
    querySelector: (selector) => (selector === 'button' ? button : { value, dataset: { label } }),
    addEventListener: (type, listener) => {
      if (type === 'change') onChange = listener;
    },
  };
  main.querySelector = (selector) => (selector.includes('name') ? name : verb);

  const fetch = vi.fn(() => (saves ? Promise.resolve({ ok: true }) : Promise.reject(new Error('offline'))));
  const location = { reload: vi.fn() };
  vi.stubGlobal('document', { querySelector: () => form });
  vi.stubGlobal('matchMedia', () => ({ matches: true }));
  vi.stubGlobal('FormData', class {});
  vi.stubGlobal('fetch', fetch);
  vi.stubGlobal('location', location);
  vi.resetModules();
  await import('../public/js/theme.js');
  return { main, name, verb, button, fetch, location, change: () => onChange() };
}

afterEach(() => vi.unstubAllGlobals());

describe('theme picker', () => {
  it('hides the save button: choosing saves', async () => {
    const { button } = await load({ value: 'vinternatt', label: 'Vinternatt' });
    expect(button.hidden).toBe(true);
  });

  it('dresses the page in the chosen theme at once, and saves it', async () => {
    const page = await load({ value: 'vinternatt', label: 'Vinternatt' });

    await page.change();

    expect(page.main.dataset.theme).toBe('vinternatt');
    expect(page.name.textContent).toBe('Vinternatt');
    expect(page.verb.textContent).toBe('Byt');
    expect(page.fetch).toHaveBeenCalledWith('/lista', expect.objectContaining({ method: 'POST' }));
    expect(page.location.reload).not.toHaveBeenCalled();
  });

  it('undresses the page when no theme is chosen', async () => {
    const page = await load({ value: '', label: 'inget' });

    await page.change();

    expect(page.main.dataset.theme).toBeUndefined();
    expect(page.name.textContent).toBe('inget');
    expect(page.verb.textContent).toBe('Välj');
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
