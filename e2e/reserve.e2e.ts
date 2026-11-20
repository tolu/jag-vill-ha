import type { Browser, Page } from '@playwright/test';
import { expect, ownerName, test } from './fixtures';
import { addWish, deleteWish } from './helpers';

// What the list is for: a guest reserves a wish, so nobody else buys it, and
// the owner never learns what is reserved. `page` is the guest, logged out;
// the owner has a browser of their own.

const LOGGED_OUT = { cookies: [], origins: [] };
test.use({ storageState: LOGGED_OUT });

let owner: Page;
let wish: { id: number; title: string };

test.beforeEach(async ({ browser, ownerState }) => {
  owner = await ownerPage(browser, ownerState);
  wish = await addWish(owner);
});

test.afterEach(async () => {
  await deleteWish(owner, wish.id);
  await owner.context().close();
});

async function ownerPage(browser: Browser, storageState: string) {
  const context = await browser.newContext({ baseURL: test.info().project.use.baseURL, storageState });
  return context.newPage();
}

const giverName = () => `Givare ${Math.random().toString(36).slice(2, 7)}`;
const row = (page: Page) => page.locator('li.wish', { has: page.getByRole('heading', { name: wish.title, exact: true }) });

/** Reserves the test's wish on the owner's public page, as `name`. */
async function reserve(page: Page, name: string) {
  await page.goto(`/${ownerName()}`);
  await row(page).getByRole('button', { name: 'Paxa' }).click();
  const dialog = page.getByRole('dialog', { name: `Paxa ${wish.title}` });
  await dialog.getByLabel('Ditt namn').fill(name);
  await dialog.getByRole('button', { name: 'Paxa', exact: true }).click();
  await expect(page.getByRole('status')).toHaveText(`Du har paxat ${wish.title}. Nu är det bara att köpa den.`);
}

test('a reserved wish is taken for other guests, and the owner sees nothing', async ({ page, browser }) => {
  const name = giverName();
  await reserve(page, name);
  await expect(row(page).getByText('Paxad av dig')).toBeVisible();
  await expect(row(page).getByRole('button', { name: 'Paxa' })).toHaveCount(0);

  const other = await browser.newContext({ baseURL: test.info().project.use.baseURL });
  const otherPage = await other.newPage();
  await otherPage.goto(`/${ownerName()}`);
  await expect(row(otherPage).getByText(`Paxad av ${name}`)).toBeVisible();
  await expect(row(otherPage).getByRole('button', { name: 'Paxa' })).toHaveCount(0);
  await other.close();

  // Every page of the owner's that shows the wish, the public one too.
  for (const path of ['/lista', `/lista/${wish.id}`, `/${ownerName()}`]) {
    await owner.goto(path);
    await expect(owner.getByText(wish.title).or(owner.getByRole('textbox', { name: 'Vad vill du ha?' }))).not.toHaveCount(0);
    const text = await owner.locator('body').innerText();
    expect(text).not.toContain(name);
    expect(text).not.toMatch(/paxad av/i);
  }
});

test('the guest can undo a reservation', async ({ page }) => {
  await reserve(page, giverName());
  await row(page).getByRole('button', { name: 'Ångra' }).click();
  await expect(page.getByRole('status')).toHaveText(`${wish.title} är ledig igen.`);
  await expect(row(page).getByRole('button', { name: 'Paxa' })).toBeVisible();
});

test('the owner can make a wish free again without learning whether it was reserved', async ({ page }) => {
  await reserve(page, giverName());
  await owner.goto(`/lista/${wish.id}`);
  await owner.getByRole('button', { name: 'Ta bort paxningen' }).click();
  await owner.getByRole('button', { name: 'Ja, gör den ledig' }).click();
  await expect(owner.getByRole('status')).toHaveText('Klart. Önskningen är ledig, oavsett hur det var innan.');
  await page.reload();
  await expect(row(page).getByRole('button', { name: 'Paxa' })).toBeVisible();
});

test('the owner cannot reserve on their own list', async ({ page }) => {
  // The owner's page shows no button for it: what the form would send.
  const response = await owner.request.post(`/${ownerName()}`, { form: { id: String(wish.id), namn: giverName(), intent: 'paxa' } });
  expect(new URL(response.url()).pathname).toBe(`/${ownerName()}`);
  await page.goto(`/${ownerName()}`);
  await expect(row(page).getByRole('button', { name: 'Paxa' })).toBeVisible();
});

test.describe('without script', () => {
  test.use({ javaScriptEnabled: false });
  test.skip(({ browserName }) => browserName === 'webkit', 'Safari before 26.2 opens dialogs only with /js/command.js');

  test('a guest can still reserve', async ({ page }) => {
    await reserve(page, giverName());
    await expect(row(page).getByText('Paxad av dig')).toBeVisible();
  });
});
