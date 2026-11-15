// Lives in src/ on purpose: void only provisions the mail binding when it
// finds the `void/email` import in a scanned directory, and auth.ts is not one.
import { sendEmail } from 'void/email';

/** Mails the one-time recovery link. Failures are logged, never shown to the visitor. */
export async function sendRecoveryMail(to: string, url: string) {
  const result = await sendEmail({
    to,
    subject: 'Logga in på din önskelista (jagvillha.fyi)',
    text: [
      'Hej!',
      'Du bad om en länk för att komma in i din önskelista på jagvillha.fyi. Öppna den på telefonen eller datorn du vill använda:',
      url,
      'Då är du inloggad och kan spara en ny nyckel där. Länken gäller i en timme och bara en gång.',
      'Bad du inte om den? Strunta i mejlet, då händer ingenting.',
    ].join('\n\n'),
  });
  if (!result.ok) console.error('Recovery mail failed', result);
}

/**
 * Sent when an address is added, so a mistyped one is noticed now and not on
 * the day she is locked out. Failures are logged, never shown.
 */
export async function sendAddressConfirmation(to: string, username: string) {
  const result = await sendEmail({
    to,
    subject: 'Din e-post är sparad (jagvillha.fyi)',
    text: [
      'Hej!',
      `Den här adressen hör nu till önskelistan jagvillha.fyi/${username}.`,
      'Vi använder den till en enda sak: att mejla dig en länk om du inte kan logga in. Ingen reklam, inga nyhetsbrev.',
      'Var det inte du som lade till den? Strunta i mejlet.',
    ].join('\n\n'),
  });
  if (!result.ok) console.error('Confirmation mail failed', result);
}
