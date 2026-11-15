import { passkeyClient } from '@better-auth/passkey/client';
import { createAuthClient } from 'void/client';

export const auth = createAuthClient({ basePath: '/api/auth', plugins: [passkeyClient()] });

/** Passkey prompts fail in two ways: the user cancels, or the server says no. */
export function passkeyErrorMessage(error: { message?: string; code?: string } | null | undefined) {
  if (!error) return null;
  if (error.code === 'AUTH_CANCELLED' || /cancel|abort|not allowed|timed out/i.test(error.message ?? '')) {
    return 'Det blev ingen passkey. Försök igen när du vill.';
  }
  if (/previously registered/i.test(error.message ?? '')) return 'Den här enheten har redan en passkey för kontot.';
  return error.message || 'Något gick fel. Försök igen.';
}
