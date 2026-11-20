import { expect, test as setup } from '@playwright/test';
import { OWNER } from './helpers';

// Logs in the dev server's test owner once, made on the first visit, and keeps
// the session for every test in every browser.
setup('log in the test owner', async ({ request }) => {
  const response = await request.get('/dev/login');
  expect(new URL(response.url()).pathname).toBe('/lista');
  await request.storageState({ path: OWNER });
});
