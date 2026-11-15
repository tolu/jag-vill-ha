// Lives in src/ on purpose: void only provisions the mail binding when it
// finds the `void/email` import in a scanned directory, and auth.ts is not one.
import { sendEmail } from 'void/email';

/** Mails the one-time recovery link. Failures are logged, never shown to the visitor. */
export async function sendRecoveryMail(to: string, url: string) {
  const result = await sendEmail({
    to,
    subject: 'Din länk till Jag vill ha',
    text: `Öppna länken för att logga in och skapa en ny passkey:\n\n${url}\n\nLänken gäller en gång. Bad du inte om den kan du strunta i mejlet.`,
  });
  if (!result.ok) console.error('Recovery mail failed', result);
}
