import { test as base, expect } from '@playwright/test';

// Every test runs logged in as a test owner of its worker's own, `testare-w0`
// and so on, made on the first visit to /dev/login. Tests in other workers,
// in whichever browser, never touch its list, its picture or its theme.

/** The username of the test owner the running test is logged in as. */
export const ownerName = () => `testare-w${test.info().parallelIndex}`;

export const test = base.extend<object, { ownerState: string }>({
  /** The test owner's session, for a page or browser of its own. Playwright empties test-results before each run. */
  ownerState: [
    async ({ playwright }, use, workerInfo) => {
      const som = `w${workerInfo.parallelIndex}`;
      const path = `test-results/owner-${som}.json`;
      const context = await playwright.request.newContext({ baseURL: workerInfo.project.use.baseURL });
      const response = await context.get(`/dev/login?som=${som}`);
      expect(new URL(response.url()).pathname).toBe('/lista');
      await context.storageState({ path });
      await context.dispose();
      await use(path);
    },
    { scope: 'worker' },
  ],
  storageState: ({ ownerState }, use) => use(ownerState),
});

export { expect };
