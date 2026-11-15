import { passkey } from '@better-auth/passkey';
import { APIError } from 'better-auth/api';
import { magicLink } from 'better-auth/plugins';
import { defineAuth } from 'void/auth';
import { isPlaceholderEmail, placeholderEmail } from './src/recovery-email';
import { parseSignup } from './src/signup';
import { checkClaim, defaultDisplayName } from './src/username';

// Our own refusals carry this code, so the page can tell them from Better
// Auth's English ones and show them as they are.
const refuse = (message: string) => new APIError('BAD_REQUEST', { message, code: 'JVH' });

async function claim(context: string | null | undefined) {
  // Loaded lazily so `void prepare` can generate the auth schema on a fresh clone.
  const { db, eq } = await import('void/db');
  const { lists } = await import('@schema');
  const { userTable } = await import('@auth-schema');
  const signup = parseSignup(context);
  const result = await checkClaim(signup.username, async (username) => {
    const rows = await db.select({ id: lists.id }).from(lists).where(eq(lists.username, username));
    return rows.length > 0;
  });
  if (!result.ok) throw refuse(result.message);
  if (signup.email === 'bad') throw refuse('Det där ser inte ut som en e-postadress.');
  // An address that already belongs to a list is left out without a word:
  // saying so here, to someone who is not logged in, would tell anyone which
  // addresses have a list. Her own list page asks for an e-mail again.
  const known = signup.email
    ? await db.select({ id: userTable.id }).from(userTable).where(eq(userTable.email, signup.email))
    : [];
  return { username: result.username, email: known.length > 0 ? null : signup.email, db, lists };
}

export default defineAuth(({ defaults }) => ({
  ...defaults,
  // Passkey first: no passwords are ever stored.
  emailAndPassword: { enabled: false },
  // Owners return a few times a year around birthdays and Christmas: stay signed
  // in for 30 days, counted from the latest visit (refreshed at most once a day).
  session: { ...defaults.session, expiresIn: 60 * 60 * 24 * 30, updateAge: 60 * 60 * 24 },
  plugins: [
    ...(defaults.plugins ?? []),
    passkey({
      rpName: 'Jag vill ha',
      registration: {
        // Sign-up is "pick a username, create a passkey": there is no session yet.
        requireSession: false,
        // Runs before the browser prompt, so a taken name fails early.
        resolveUser: async ({ context }) => {
          const { username } = await claim(context);
          return { id: crypto.randomUUID(), name: username };
        },
        // The account and its list are only created once the passkey is verified.
        afterVerification: async ({ ctx, context }) => {
          if (ctx.context.session) return;
          const { username, email, db, lists } = await claim(context);
          const user = await ctx.context.internalAdapter.createUser(
            { name: username, email: email ?? placeholderEmail(username), emailVerified: false },
            ctx,
          );
          await db.insert(lists).values({ username, displayName: defaultDisplayName(username), ownerId: user.id });
          if (email) {
            const { sendAddressConfirmation } = await import('./src/recovery-mail');
            await sendAddressConfirmation(email, username);
          }
          return { userId: user.id, name: username };
        },
      },
    }),
    // Recovery only: mails a one-time link to an address the owner chose to add.
    magicLink({
      disableSignUp: true,
      // Long enough to find the mail and get to the right phone or computer.
      expiresIn: 60 * 60,
      sendMagicLink: async ({ email, url }) => {
        if (isPlaceholderEmail(email)) return;
        // Imported lazily: loading void/email while the config is read breaks `vp test`.
        const { sendRecoveryMail } = await import('./src/recovery-mail');
        await sendRecoveryMail(email, url);
      },
    }),
  ],
}));
