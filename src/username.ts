// Usernames are the public address of a list: jagvillha.fyi/<username>.
// Static pages win over the dynamic route, so every current or likely
// top-level path is reserved here to keep it from being claimed.
const RESERVED = new Set([
  'admin',
  'api',
  'app',
  'aterstall',
  'assets',
  'auth',
  'bild',
  'hjalp',
  'icons',
  'installningar',
  'jagvillha',
  'js',
  'konto',
  'lista',
  'listor',
  'login',
  'logout',
  'manifest',
  'ny',
  'om',
  'public',
  'robots',
  'sitemap',
  'static',
  'support',
  'villkor',
  'www',
]);

export const USERNAME_PATTERN = /^[a-z0-9-]{3,30}$/;

export type UsernameProblem = 'length' | 'characters' | 'hyphen' | 'reserved';

/**
 * Turns what a person types into an address: "Görel Lundin " and
 * "gorel-lundin" are the same list. Accents are dropped and spaces become
 * hyphens. public/js/username.js does the same in the browser while typing.
 */
export function normalizeUsername(input: string) {
  return input
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .replaceAll('ø', 'o')
    .replaceAll('æ', 'ae')
    .replace(/[\s-]+/g, '-')
    .replace(/^-|-$/g, '');
}

/** The heading a new list starts with: "gorel-lundin" becomes "Gorel Lundin". */
export function defaultDisplayName(username: string) {
  return username
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

/** Returns why a normalized username is unusable, or null when it is fine. */
export function checkUsername(username: string): UsernameProblem | null {
  if (username.length < 3 || username.length > 30) return 'length';
  if (!USERNAME_PATTERN.test(username)) return 'characters';
  if (username.startsWith('-') || username.endsWith('-') || username.includes('--')) return 'hyphen';
  if (RESERVED.has(username)) return 'reserved';
  return null;
}

export type ClaimProblem = UsernameProblem | 'taken';

const MESSAGES: Record<ClaimProblem, string> = {
  length: 'Adressen ska vara 3–30 tecken.',
  characters: 'Bara bokstäver, siffror och bindestreck går bra. Inga punkter eller andra tecken.',
  hyphen: 'Bindestreck får inte stå först, sist eller dubbelt.',
  reserved: 'Det namnet är upptaget.',
  taken: 'Det namnet är upptaget.',
};

export function claimMessage(problem: ClaimProblem) {
  return MESSAGES[problem];
}

/**
 * Decides whether a requested username can be claimed. `isTaken` is only
 * asked when the name itself is valid, so invalid input never hits the database.
 */
export async function checkClaim(input: string, isTaken: (username: string) => Promise<boolean>) {
  const username = normalizeUsername(input);
  const problem: ClaimProblem | null = checkUsername(username) ?? ((await isTaken(username)) ? 'taken' : null);
  return problem ? ({ ok: false, problem, message: claimMessage(problem) } as const) : ({ ok: true, username } as const);
}

/** Deleting an account asks the owner to type their username; case and spaces are forgiven. */
export function confirmsDeletion(typed: unknown, username: string) {
  return typeof typed === 'string' && normalizeUsername(typed) === username;
}
