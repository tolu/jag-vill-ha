// What /ny sends along with a new passkey: the address she chose and, if she
// gave one, an e-mail for getting back in. Better Auth carries it from the
// first request to the last as one string, the passkey "context".
import { parseRecoveryEmail } from './recovery-email';

export function signupContext(username: string, email: string) {
  return new URLSearchParams({ namn: username, epost: email }).toString();
}

/** `email` is null when none was given and 'bad' when it does not look like an address. */
export function parseSignup(context: string | null | undefined) {
  const fields = new URLSearchParams(context ?? '');
  const typed = (fields.get('epost') ?? '').trim();
  return {
    username: fields.get('namn') ?? '',
    email: typed === '' ? null : (parseRecoveryEmail(typed) ?? ('bad' as const)),
  };
}
