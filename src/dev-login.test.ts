import { readFileSync } from 'node:fs';
import { expect, test } from 'vitest';
import { devOwner, keepDevLink, takeDevLink } from './dev-login';

test("the test owner's link is kept, and handed out once", () => {
  expect(keepDevLink(devOwner().email, 'http://localhost/link')).toBe(true);
  expect(takeDevLink()).toBe('http://localhost/link');
  expect(takeDevLink()).toBeNull();
});

test('each browser in the e2e tests has a test owner of its own', () => {
  expect(devOwner()).toEqual({ username: 'testare', email: 'testare@example.test' });
  expect(devOwner('chrome')).toEqual({ username: 'testare-chrome', email: 'testare-chrome@example.test' });
  expect(keepDevLink(devOwner('chrome').email, 'http://localhost/link')).toBe(true);
  expect(takeDevLink()).toBe('http://localhost/link');
});

test('anything else after ?som= is the ordinary test owner', () => {
  for (const som of ['', 'Chrome', 'a-b', 'x'.repeat(21), '../admin']) expect(devOwner(som).username).toBe('testare');
});

test("anyone else's link is left to be mailed", () => {
  expect(keepDevLink('someone@example.com', 'http://localhost/link')).toBe(false);
  expect(takeDevLink()).toBeNull();
});

// A route that logs someone in without a passkey must not answer in a build.
test('the route, the mail hook and the link on the landing page are all behind import.meta.env.DEV', () => {
  const read = (path: string) => readFileSync(new URL(path, import.meta.url), 'utf8');
  expect(read('../routes/dev/login.ts')).toMatch(/defineHandler\(async \(c\) => \{\s*if \(!import\.meta\.env\.DEV\) return c\.notFound\(\);/);
  expect(read('../auth.ts')).toMatch(/if \(import\.meta\.env\.DEV && \(await import\('\.\/src\/dev-login'\)\)\.keepDevLink/);
  expect(read('../pages/index.island.tsx')).toMatch(/\{import\.meta\.env\.DEV && \(\s*<p className="hint">\s*Dev server: <a href="\/dev\/login">/);
});
