import { defineConfig, devices } from '@playwright/test';

// End-to-end tests against the dev server on throwaway data: the same server
// as `app-test` in .claude/launch.json. Run with `npm run e2e`.
const PORT = 5183;

export default defineConfig({
  testDir: 'e2e',
  testMatch: '*.e2e.ts', // not *.test.ts, which the unit tests (`vp test`) pick up
  fullyParallel: false, // one test owner, one database: tests run one after another
  workers: 1,
  retries: process.env.CI ? 1 : 0,
  // In CI: annotations on the pull request, and a report with the traces that
  // the e2e job uploads.
  reporter: process.env.CI ? [['github'], ['html', { open: 'never' }]] : 'list',
  use: {
    baseURL: `http://localhost:${PORT}`,
    // In CI only the retry of a failed test is recorded: recording every test
    // costs time. A test that failed twice leaves the trace of its retry.
    trace: process.env.CI ? 'on-first-retry' : 'retain-on-failure',
  },
  projects: [
    { name: 'chrome', use: { ...devices['Desktop Chrome'] } },
    // WebKit is Safari's engine: it catches what only Safari lacks.
    { name: 'safari', use: { ...devices['Desktop Safari'] } },
    { name: 'phone', use: { ...devices['iPhone 15'] } },
  ],
  webServer: {
    command: `npm run dev -- --port ${PORT}`,
    url: `http://localhost:${PORT}`,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    env: {
      LOCAL_STATE: process.env.LOCAL_STATE ?? '.void/test-state',
      ADMIN_USER_ID: process.env.ADMIN_USER_ID ?? '',
    },
  },
});
