// The dev server's way in without a passkey: /dev/login logs in a test owner.
// Nothing here is reached in a build: every caller checks import.meta.env.DEV.

const OWNER_EMAIL = /^testare(-[a-z0-9]+)?@example\.test$/;

/**
 * A test owner: `testare`, or with `som` one of its own, such as
 * `testare-chrome` for the e2e tests in Chrome, so tests in other browsers
 * never touch its list.
 */
export function devOwner(som?: string | null) {
  const username = som && /^[a-z0-9]{1,20}$/.test(som) ? `testare-${som}` : 'testare';
  return { username, email: `${username}@example.test` };
}

/** What the test owner's list starts with, so there is something to look at. */
export const DEV_WISHES = [
  { title: 'Stickad mössa i ull', icon: 't-shirt', note: 'Gärna grön' },
  { title: 'Mumin-muggen Vinternatt', icon: 'coffee', note: null },
  { title: 'Pussel med 1000 bitar', icon: 'puzzle-piece', note: null },
];

// Better Auth hands the one-time link to auth.ts, which would mail it. For
// a test owner it is kept here instead, for the route to follow.
let link: string | null = null;

/** Keeps the link if it is a test owner's, and says whether it was. */
export function keepDevLink(email: string, url: string) {
  if (!OWNER_EMAIL.test(email)) return false;
  link = url;
  return true;
}

/** The kept link, once. */
export function takeDevLink() {
  const kept = link;
  link = null;
  return kept;
}
