// Usernames are the public address of a list: jagvillha.fyi/<username>.
// Static pages win over the dynamic route, so every current or likely
// top-level path is reserved here to keep it from being claimed.
const RESERVED = new Set([
  'admin',
  'api',
  'app',
  'assets',
  'auth',
  'hjalp',
  'icons',
  'installningar',
  'jagvillha',
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

/** Lowercases and trims, so "Tobias " and "tobias" address the same list. */
export function normalizeUsername(input: string) {
  return input.trim().toLowerCase();
}

/** Returns why a normalized username is unusable, or null when it is fine. */
export function checkUsername(username: string): UsernameProblem | null {
  if (username.length < 3 || username.length > 30) return 'length';
  if (!USERNAME_PATTERN.test(username)) return 'characters';
  if (username.startsWith('-') || username.endsWith('-') || username.includes('--')) return 'hyphen';
  if (RESERVED.has(username)) return 'reserved';
  return null;
}
