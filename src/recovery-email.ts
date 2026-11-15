// Better Auth requires an email on every user. Accounts without a recovery
// address get this placeholder; ".invalid" can never receive mail.
const PLACEHOLDER_DOMAIN = 'ingen-epost.invalid';

export const placeholderEmail = (username: string) => `${username}@${PLACEHOLDER_DOMAIN}`;

export const isPlaceholderEmail = (email: string) => email.endsWith(`@${PLACEHOLDER_DOMAIN}`);

/** Trims and lowercases; returns null unless it looks like a deliverable address. */
export function parseRecoveryEmail(input: string) {
  const email = input.trim().toLowerCase();
  if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return null;
  return isPlaceholderEmail(email) ? null : email;
}
