import { afterEach, describe, expect, it, vi } from 'vite-plus/test';

// Loads public/js/command.js against a stand-in for the browser and returns
// the click listener it registered, if any.
async function load(buttonPrototype) {
  let onClick;
  vi.stubGlobal('HTMLButtonElement', { prototype: buttonPrototype });
  vi.stubGlobal('addEventListener', (type, listener) => {
    if (type === 'click') onClick = listener;
  });
  vi.resetModules();
  await import('../public/js/command.js');
  return onClick;
}

const clickOn = (button) => ({ target: { closest: (selector) => (selector.includes('show-modal') ? button : null) } });

afterEach(() => vi.unstubAllGlobals());

describe('command fallback', () => {
  it('opens the dialog a button points at when the browser has no invoker commands', async () => {
    const dialog = { showModal: vi.fn() };
    vi.stubGlobal('document', { getElementById: (id) => (id === 'paxa-1' ? dialog : null) });
    const onClick = await load({});

    onClick(clickOn({ getAttribute: () => 'paxa-1' }));

    expect(dialog.showModal).toHaveBeenCalledOnce();
  });

  it('ignores clicks that are not on such a button', async () => {
    const dialog = { showModal: vi.fn() };
    vi.stubGlobal('document', { getElementById: () => dialog });
    const onClick = await load({});

    onClick(clickOn(null));

    expect(dialog.showModal).not.toHaveBeenCalled();
  });

  it('stays out of the way when the browser opens dialogs itself', async () => {
    expect(await load({ command: '' })).toBeUndefined();
  });
});
