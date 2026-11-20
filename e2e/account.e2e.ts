import { expect, test } from './fixtures';
import { deleteAccount, mailedLink } from './helpers';

// Getting in: a new list with a passkey, the passkey again, and the mailed
// link for someone who cannot. Each test makes an account of its own and
// deletes it the way an owner would. /admin is for one account only.

const LOGGED_OUT = { cookies: [], origins: [] };
const unique = () => Math.random().toString(36).slice(2, 9).replace(/^\d+/, '') || 'x';

test.describe('with a passkey', () => {
  test.use({ storageState: LOGGED_OUT });
  test.skip(({ browserName }) => browserName !== 'chromium', 'only Chromium has a virtual authenticator');

  test('a new list is made with a passkey, which logs in again', async ({ page }) => {
    const cdp = await page.context().newCDPSession(page);
    await cdp.send('WebAuthn.enable');
    await cdp.send('WebAuthn.addVirtualAuthenticator', {
      options: { protocol: 'ctap2', transport: 'internal', hasResidentKey: true, hasUserVerification: true, isUserVerified: true },
    });
    const username = `e2e-${unique()}`;
    await page.goto('/ny');
    await page.getByLabel('Adress', { exact: true }).fill(username);
    await page.getByRole('button', { name: 'Skapa min lista' }).click();
    await expect(page).toHaveURL(/\/lista$/);
    await expect(page.getByRole('heading', { name: 'Din lista' })).toBeVisible();

    await page.getByRole('button', { name: 'Logga ut' }).click();
    await expect(page).toHaveURL('/');
    await page.goto('/lista');
    await expect(page).not.toHaveURL(/\/lista$/);

    await page.goto('/login');
    await page.getByRole('button', { name: 'Logga in', exact: true }).click();
    await expect(page).toHaveURL(/\/lista$/);
    await deleteAccount(page, username);
  });
});

test.describe('a mailed link', () => {
  test.use({ storageState: LOGGED_OUT });

  test('logs in someone who cannot, at the address they added', async ({ page }) => {
    // A test owner of its own: the first link to an address not yet proven
    // logs out every other session of that account.
    const som = unique();
    await page.goto(`/dev/login?som=${som}`);
    const email = `${som}@example.test`;
    await page.goto('/konto');
    await page.getByLabel('E-post').fill(email);
    await page.getByRole('button', { name: 'Spara e-post' }).click();
    await expect(page.getByRole('status')).toContainText(`Vi har mejlat ${email}`);
    await page.getByRole('button', { name: 'Logga ut' }).click();
    await expect(page).toHaveURL('/');

    await page.goto('/login');
    await page.getByRole('link', { name: 'Kommer du inte in?' }).click();
    await page.getByLabel('E-post').fill(email);
    await page.getByRole('button', { name: 'Mejla mig en länk' }).click();
    await expect(page.getByText('Om adressen hör till en lista har vi mejlat en länk nu.', { exact: false })).toBeVisible();

    await page.goto(await mailedLink(page.request, email));
    await expect(page).toHaveURL(/\/konto\?aterstalld=1/);
    await expect(page.getByRole('heading', { name: 'Du är inne' })).toBeVisible();
    await deleteAccount(page, `testare-${som}`);
  });
});

test('/admin is not found for anyone but the admin', async ({ page, playwright, baseURL }) => {
  expect((await page.goto('/admin'))?.status()).toBe(404);
  const guest = await playwright.request.newContext({ baseURL });
  expect((await guest.get('/admin')).status()).toBe(404);
  await guest.dispose();
});
