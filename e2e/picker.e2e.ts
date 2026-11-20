import type { Page } from '@playwright/test';
import { expect, test } from './fixtures';
import { addWish, answerPictures, deleteWish, dropFromChrome, PICTURE, saved } from './helpers';

// The picture picker: the box beside "Vad vill du ha?" and the modal dialog it
// opens. Most of what is tested here lives in /js/picker.js.

const box = (page: Page) => page.locator('.appearance .picker').first();
const savedPicture = (page: Page) => box(page).locator('img');

test.describe('an existing wish', () => {
  let wish: { id: number; title: string };

  test.afterEach(async ({ page }) => {
    if (wish) await deleteWish(page, wish.id);
  });

  async function open(page: Page, { picture = false } = {}) {
    wish = await addWish(page, { picture });
    await page.goto(`/lista/${wish.id}`);
    return page.locator('#andra-utseende');
  }

  test('a picture dragged from another page is saved at once', async ({ page }) => {
    await open(page);
    await answerPictures(page);
    const sent = saved(page, wish.id);
    expect(await dropFromChrome(box(page))).toBe(true);
    await sent;
    await page.goto(`/lista/${wish.id}`);
    await expect(savedPicture(page)).toBeVisible();
    await expect(savedPicture(page)).toHaveAttribute('src', /^\/bild\//);
  });

  test('opens on its saved picture, never on the icons first', async ({ page }) => {
    const dialog = await open(page, { picture: true });
    const seen = await page.evaluate(async () => {
      const dialog = document.getElementById('andra-utseende')!;
      const icons = dialog.querySelector<HTMLElement>('.icons')!;
      const picture = dialog.querySelector<HTMLElement>('.crop-view img')!;
      const seen = new Set<string>();
      document.querySelector<HTMLElement>('.appearance .picker')!.click();
      // Looks at every frame until the picture is in the frame, and a few more.
      const start = performance.now();
      let after = 5;
      while (after > 0 && performance.now() - start < 2000) {
        if ((dialog as HTMLDialogElement).open) seen.add(icons.offsetParent ? 'icons' : 'frame');
        if (/width: \d/.test(picture.getAttribute('style') ?? '')) after--;
        await new Promise((resolve) => requestAnimationFrame(resolve));
      }
      return [...seen];
    });
    expect(seen).toEqual(['frame']);
    await expect(dialog.locator('.crop-view img')).toHaveAttribute('style', /width: \d/);
  });

  test('a saved picture that is gone opens on the icons', async ({ page }) => {
    const dialog = await open(page, { picture: true });
    const errors: Error[] = [];
    page.on('pageerror', (error) => errors.push(error));
    // As when another tab has replaced the picture since this page was loaded.
    await page.route('**/bild/**', (route) => route.fulfill({ status: 404, body: 'Not found' }));
    await box(page).click();
    await expect(dialog.locator('.icons')).toBeVisible();
    await expect(dialog.locator('.crop')).toBeHidden();
    expect(errors).toEqual([]);
  });

  test('Escape keeps a picture removed by mistake', async ({ page }) => {
    const dialog = await open(page, { picture: true });
    await box(page).click();
    await dialog.getByRole('button', { name: 'Ta bort' }).click();
    await expect(dialog.locator('.icons')).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(dialog).not.toBeVisible();
    await expect(savedPicture(page)).toBeVisible();
    await page.reload();
    await expect(savedPicture(page)).toBeVisible();
  });

  test('"Ta bort" and "Klar" remove the picture', async ({ page }) => {
    const dialog = await open(page, { picture: true });
    await box(page).click();
    await dialog.getByRole('button', { name: 'Ta bort' }).click();
    const sent = saved(page, wish.id);
    await dialog.getByRole('button', { name: 'Klar' }).click();
    await sent;
    await page.goto(`/lista/${wish.id}`);
    await expect(savedPicture(page)).toBeHidden();
  });

  test('arrow keys move through the icons; a click picks one and saves it', async ({ page }) => {
    const dialog = await open(page);
    await box(page).click();
    await dialog.locator('.icons input:checked').focus();
    await page.keyboard.press('ArrowRight');
    await expect(dialog).toBeVisible();
    const picked = await dialog.locator('.icons label[title]').nth(5).locator('input').getAttribute('value');
    const sent = saved(page, wish.id);
    await dialog.locator('.icons label[title]').nth(5).click();
    await sent;
    await page.goto(`/lista/${wish.id}`);
    await expect(page.locator(`#andra-utseende input[value="${picked}"]`)).toBeChecked();
  });

  test('a link dropped on "Länk" is left to the field', async ({ page }) => {
    await open(page);
    let fetched = false;
    page.on('request', (request) => (fetched ||= request.url().includes('/api/bild')));
    const link = '<a href="https://butik.example/sak"><img src="https://butik.example/sak.jpg"></a>';
    expect(await dropFromChrome(page.locator('#andra-lank'), link, 'https://butik.example/sak')).toBe(false);
    await page.waitForTimeout(300);
    expect(fetched).toBe(false);
    await expect(savedPicture(page)).toBeHidden();
  });

  test('a picture that cannot be fetched is explained', async ({ page }) => {
    await open(page);
    await answerPictures(page, false);
    await dropFromChrome(box(page));
    await expect(page.locator('.appearance > .picture-status')).toHaveText(/gick inte att hämta/);
  });
});

test.describe('a new wish', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/lista');
    await page.getByRole('button', { name: 'Lägg till önskning' }).click();
  });

  test('a dropped picture goes into the box without opening the frame', async ({ page }) => {
    await answerPictures(page);
    await dropFromChrome(page.locator('#ny .picker'));
    await expect(page.locator('#ny .picker img')).toBeVisible();
    await expect(page.locator('#ny-utseende')).not.toBeVisible();
    expect(await page.locator('#ny-utseende input[type="file"]').evaluate((input: HTMLInputElement) => input.files?.length)).toBe(1);
  });

  test('the dialog keeps its size while it fades out', async ({ page }) => {
    await page.locator('#ny .picker').click();
    const dialog = page.locator('#ny-utseende');
    await expect(dialog).toBeVisible();
    // Every look at the icons while it closes finds them as big as when it was
    // open (0 once it is gone; a browser without the fade-out is gone at once).
    const { open, closing } = await page.evaluate(async () => {
      const dialog = document.getElementById('ny-utseende')!;
      const cell = dialog.querySelector('.icons label')!;
      const width = () => Math.round(cell.getBoundingClientRect().width);
      const open = width();
      const closing: number[] = [];
      dialog.querySelector<HTMLButtonElement>('button[command="close"]')!.click();
      const start = performance.now();
      while (performance.now() - start < 200) {
        closing.push(width());
        await new Promise((resolve) => requestAnimationFrame(resolve));
      }
      return { open, closing };
    });
    expect(open).toBeGreaterThan(0);
    expect(closing.filter((width) => width !== 0 && width !== open)).toEqual([]);
  });

  test('"Klar" stays on screen on a small phone', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 568 });
    await page.locator('#ny .picker').click();
    const dialog = page.locator('#ny-utseende');
    await dialog.locator('input[type="file"]').setInputFiles(PICTURE);
    await expect(dialog.locator('.crop')).toBeVisible();
    await expect(dialog.getByRole('button', { name: 'Klar' })).toBeInViewport({ ratio: 1 });
  });
});

test.describe('on a touch screen', () => {
  // Skipped before any page is opened.
  test.skip(({ hasTouch }) => !hasTouch, 'only touch screens lack hover');

  test('the box shows its pencil without hover', async ({ page }) => {
    await page.goto('/lista');
    await page.getByRole('button', { name: 'Lägg till önskning' }).click();
    await expect(page.locator('#ny .picker [data-icon="edit"]')).toBeVisible();
  });
});

test.describe('the account picture', () => {
  test('is saved, and the e-mail stays', async ({ page }) => {
    await page.goto('/konto');
    const email = await page.locator('#epost').inputValue();
    await page.locator('.appearance.round .picker').click();
    await page.locator('#profilbild input[type="file"]').setInputFiles(PICTURE);
    const saved = page.waitForURL('**/konto?sparat=bild');
    await page.locator('#profilbild').getByRole('button', { name: 'Klar' }).click();
    await saved;
    await expect(page.locator('.appearance.round .picker img')).toBeVisible();
    await expect(page.locator('#epost')).toHaveValue(email);
  });
});

test.describe('without script', () => {
  test.use({ javaScriptEnabled: false });
  test.skip(({ browserName }) => browserName === 'webkit', 'Safari before 26.2 opens dialogs only with /js/command.js');

  test('a saved picture can still be removed', async ({ page }) => {
    const wish = await addWish(page, { picture: true });
    await page.goto(`/lista/${wish.id}`);
    await box(page).click();
    const dialog = page.locator('#andra-utseende');
    await expect(dialog).toBeVisible();
    await dialog.getByLabel('Ta bort bilden').check();
    await dialog.getByRole('button', { name: 'Klar' }).click();
    await page.getByRole('button', { name: 'Spara' }).click();
    await page.goto(`/lista/${wish.id}`);
    await expect(savedPicture(page)).toBeHidden();
    await deleteWish(page, wish.id);
  });
});
