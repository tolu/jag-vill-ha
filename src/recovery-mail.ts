// Lives in src/ on purpose: void only provisions the mail binding when it
// finds the `void/email` import in a scanned directory, and auth.ts is not one.
// What the mails say and look like is in src/mail-template.ts.
import { sendEmail } from 'void/email';
import { confirmationMail, recoveryMail } from './mail-template';

/** Mails the one-time recovery link. Failures are logged, never shown to the visitor. */
export async function sendRecoveryMail(to: string, url: string) {
  const result = await sendEmail({ to, ...recoveryMail(url) });
  if (!result.ok) console.error('Recovery mail failed', result);
}

/**
 * Sent when an address is added, so a mistyped one is noticed now and not on
 * the day she is locked out. Failures are logged, never shown.
 */
export async function sendAddressConfirmation(to: string) {
  const result = await sendEmail({ to, ...confirmationMail() });
  if (!result.ok) console.error('Confirmation mail failed', result);
}
