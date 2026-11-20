import { readFileSync } from 'node:fs';
import { expect, type APIRequestContext, type Locator, type Page } from '@playwright/test';

/** A small real picture, for uploads and for what /api/bild answers. */
export const PICTURE = 'public/icons/icon-192.png';
const pictureBytes = readFileSync(PICTURE);

/** An address on a shop, as Chrome hands it over in a drop. Never fetched: /api/bild is answered here. */
export const SHOP_PICTURE = 'https://butik.example/sak.jpg';

/** Adds a wish with a unique title, with or without a picture, and gives its id. */
export async function addWish(page: Page, { picture = false } = {}) {
  const title = `E2E ${Date.now()} ${Math.random().toString(36).slice(2, 7)}`;
  const multipart: Record<string, string | { name: string; mimeType: string; buffer: Buffer }> = { intent: 'add', titel: title, ikon: 'gift' };
  if (picture) multipart['bild'] = { name: 'bild.png', mimeType: 'image/png', buffer: pictureBytes };
  const response = await page.request.post('/lista', { multipart, maxRedirects: 0 });
  expect(response.status()).toBe(303);
  await page.goto('/lista');
  const href = await page.getByRole('link', { name: `Ändra ${title}` }).getAttribute('href');
  return { id: Number(href!.split('/').pop()), title };
}

export async function deleteWish(page: Page, id: number) {
  await page.request.post('/lista', { form: { intent: 'delete', id: String(id) }, maxRedirects: 0 });
}

/** Answers /api/bild with the test picture, or with a 404 when `found` is false. */
export async function answerPictures(page: Page, found = true) {
  await page.route('**/api/bild', (route) =>
    found ? route.fulfill({ status: 200, contentType: 'image/png', body: pictureBytes }) : route.fulfill({ status: 404, body: '' }),
  );
}

/**
 * Drops on `target` what Chrome drops for a picture dragged from another tab:
 * its HTML and its address, no file. Says whether the page took the drop.
 */
export function dropFromChrome(target: Locator, html = `<img src="${SHOP_PICTURE}">`, uriList = SHOP_PICTURE) {
  return target.evaluate(
    (element, { html, uriList }) => {
      const data = new DataTransfer();
      data.setData('text/uri-list', uriList);
      data.setData('text/html', html);
      const drop = new DragEvent('drop', { dataTransfer: data, bubbles: true, cancelable: true });
      element.dispatchEvent(drop);
      return drop.defaultPrevented;
    },
    { html, uriList },
  );
}

/**
 * Waits until a form on the wish's own page has been sent and saved. Saving
 * there answers with the same address, so the address cannot be waited for.
 */
export function saved(page: Page, id: number) {
  return page.waitForResponse((response) => response.request().method() === 'POST' && new URL(response.url()).pathname === `/lista/${id}`);
}

/** Deletes the logged-in account on /konto, as its owner would. */
export async function deleteAccount(page: Page, username: string) {
  await page.goto('/konto');
  await page.getByRole('button', { name: 'Ta bort kontot', exact: true }).click();
  const dialog = page.getByRole('dialog', { name: 'Ta bort kontot?' });
  await dialog.getByLabel(/för att bekräfta/).fill(username);
  await dialog.getByRole('button', { name: 'Ta bort kontot och listan' }).click();
  await expect(page).toHaveURL('/?borttaget=1');
  expect((await page.request.get(`/${username}`)).status()).toBe(404);
}

/**
 * The login link mailed to `to`, from the dev server's inbox. The inbox
 * wants the token the server keeps in .void, and gives each mail as raw
 * quoted-printable.
 */
export async function mailedLink(request: APIRequestContext, to: string) {
  const token = readFileSync('.void/dev-trigger-token', 'utf8').trim();
  const list = await (await request.get(`/__void/inbox?token=${token}`)).text();
  const ids = [...list.matchAll(/<tr>[\s\S]*?href="\/__void\/inbox\/([^"?]+)\?[\s\S]*?<\/tr>/g)]
    .filter((row) => row[0].includes(to))
    .map((row) => row[1]);
  for (const id of ids) {
    const raw = await (await request.get(`/__void/inbox/${id}/raw?token=${token}`)).text();
    const decoded = raw.replace(/=\r?\n/g, '').replace(/=([0-9A-F]{2})/g, (_, hex: string) => String.fromCharCode(parseInt(hex, 16)));
    const link = /href="([^"]*magic-link[^"]*)"/.exec(decoded)?.[1];
    if (link) return link.replaceAll('&amp;', '&');
  }
  throw new Error(`No login link mailed to ${to}`);
}
