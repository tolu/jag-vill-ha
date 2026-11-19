// The dev server's way in without a passkey: /dev/login logs in a test owner.
// Nothing here is reached in a build: every caller checks import.meta.env.DEV.

export const DEV_OWNER = { username: 'testare', email: 'testare@example.test' };

/** What the test owner's list starts with, so there is something to look at. */
export const DEV_WISHES = [
  { title: 'Stickad mössa i ull', icon: 't-shirt', note: 'Gärna grön' },
  { title: 'Mumin-muggen Vinternatt', icon: 'coffee', note: null },
  { title: 'Pussel med 1000 bitar', icon: 'puzzle-piece', note: null },
];

// Better Auth hands the one-time link to auth.ts, which would mail it. For
// the test owner it is kept here instead, for the route to follow.
let link: string | null = null;

/** Keeps the link if it is the test owner's, and says whether it was. */
export function keepDevLink(email: string, url: string) {
  if (email !== DEV_OWNER.email) return false;
  link = url;
  return true;
}

/** The kept link, once. */
export function takeDevLink() {
  const kept = link;
  link = null;
  return kept;
}
