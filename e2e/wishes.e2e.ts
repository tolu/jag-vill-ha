import type { Page } from '@playwright/test';
import { expect, test } from './fixtures';
import { addWish, deleteWish } from './helpers';

// The owner's own list: adding, changing, removing and ordering wishes, and
// the theme. Each browser has a test owner of its own, so nobody else moves
// the rows under a test.

const newTitle = () => `E2E ${Date.now()} ${Math.random().toString(36).slice(2, 7)}`;
const titles = (page: Page) => page.locator('.wishes .wish-text h2').allTextContents();

/** The id of a wish on the owner's list, from its "Ändra" link. */
async function idOf(page: Page, title: string) {
  const href = await page.getByRole('link', { name: `Ändra ${title}` }).getAttribute('href');
  return Number(href!.split('/').pop());
}

async function addThroughDialog(page: Page, title: string) {
  await page.goto('/lista');
  await page.getByRole('button', { name: 'Lägg till önskning' }).click();
  const dialog = page.getByRole('dialog', { name: 'Ny önskning' });
  await dialog.getByLabel('Vad vill du ha?').fill(title);
  await dialog.getByRole('button', { name: 'Lägg till' }).click();
  await expect(page).toHaveURL(/\/lista$/);
  await expect(page.getByRole('heading', { name: title })).toBeVisible();
}

async function changeOnItsPage(page: Page, id: number, title: string, note: string) {
  await page.goto('/lista');
  await page.locator(`a[href="/lista/${id}"]`).click();
  await page.getByLabel('Vad vill du ha?').fill(title);
  await page.getByLabel(/Kommentar/).fill(note);
  await page.getByRole('button', { name: 'Spara' }).click();
  await expect(page).toHaveURL(/\/lista$/);
  const row = page.locator('.wish', { has: page.getByRole('heading', { name: title }) });
  await expect(row.getByText(note)).toBeVisible();
}

async function removeThroughDialog(page: Page, title: string) {
  await page.goto('/lista');
  await page.getByRole('button', { name: `Ta bort ${title}` }).click();
  await page
    .getByRole('dialog', { name: `Ta bort ${title}?` })
    .getByRole('button', { name: 'Ta bort', exact: true })
    .click();
  await expect(page).toHaveURL(/\/lista$/);
  await expect(page.getByRole('heading', { name: title })).toHaveCount(0);
}

test('a wish is added, changed and removed', async ({ page }) => {
  const title = newTitle();
  await addThroughDialog(page, title);
  const id = await idOf(page, title);
  try {
    const changed = `${title} ändrad`;
    await changeOnItsPage(page, id, changed, 'Gärna i blått');
    await removeThroughDialog(page, changed);
  } finally {
    await deleteWish(page, id);
  }
});

test('the arrow keys move a wish, and the order is kept', async ({ page }) => {
  const first = await addWish(page);
  const second = await addWish(page);
  try {
    await page.goto('/lista');
    const sent = page.waitForResponse((response) => response.request().method() === 'POST' && new URL(response.url()).pathname === '/lista');
    await page.getByRole('button', { name: `Flytta ${second.title}` }).press('ArrowUp');
    expect((await sent).ok()).toBe(true);
    await page.reload();
    const order = await titles(page);
    expect(order.indexOf(second.title)).toBe(order.indexOf(first.title) - 1);
  } finally {
    await deleteWish(page, first.id);
    await deleteWish(page, second.id);
  }
});

test('a theme is chosen with one tap and kept', async ({ page }) => {
  await page.goto('/lista');
  const main = page.locator('main');
  try {
    await page.getByRole('button', { name: /^Tema/ }).click();
    const dialog = page.getByRole('dialog', { name: 'Välj tema' });
    const sent = page.waitForResponse((response) => response.request().method() === 'POST' && new URL(response.url()).pathname === '/lista');
    await dialog.getByText('Polkagris').click();
    await expect(dialog).toBeHidden();
    await expect(main).toHaveAttribute('data-theme', 'polkagris');
    await expect(page.getByRole('button', { name: /^Tema/ })).toHaveText(/Polkagris/);
    expect((await sent).ok()).toBe(true);
    await page.reload();
    await expect(main).toHaveAttribute('data-theme', 'polkagris');
  } finally {
    await page.request.post('/lista', { form: { intent: 'theme', theme: '' }, maxRedirects: 0 });
  }
});

test.describe('without script', () => {
  test.use({ javaScriptEnabled: false });
  test.skip(({ browserName }) => browserName === 'webkit', 'Safari before 26.2 opens dialogs only with /js/command.js');

  test('a wish is added, changed and removed', async ({ page }) => {
    const title = newTitle();
    await addThroughDialog(page, title);
    const id = await idOf(page, title);
    try {
      const changed = `${title} ändrad`;
      await changeOnItsPage(page, id, changed, 'Gärna i blått');
      await removeThroughDialog(page, changed);
    } finally {
      await deleteWish(page, id);
    }
  });
});
