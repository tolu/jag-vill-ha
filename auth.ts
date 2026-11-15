import { passkey } from '@better-auth/passkey';
import { APIError } from 'better-auth/api';
import { magicLink } from 'better-auth/plugins';
import { defineAuth } from 'void/auth';
import { isPlaceholderEmail, placeholderEmail } from './src/recovery-email';
import { checkClaim, defaultDisplayName } from './src/username';

async function claim(input: string | null | undefined) {
  // Loaded lazily so `void prepare` can generate the auth schema on a fresh clone.
  const { db, eq } = await import('void/db');
  const { lists } = await import('@schema');
  const result = await checkClaim(input ?? '', async (username) => {
    const rows = await db.select({ id: lists.id }).from(lists).where(eq(lists.username, username));
    return rows.length > 0;
  });
  if (!result.ok) throw new APIError('BAD_REQUEST', { message: result.message });
  return { username: result.username, db, lists };
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
          const { username, db, lists } = await claim(context);
          const user = await ctx.context.internalAdapter.createUser(
            { name: username, email: placeholderEmail(username), emailVerified: false },
            ctx,
          );
          await db.insert(lists).values({ username, displayName: defaultDisplayName(username), ownerId: user.id });
          return { userId: user.id, name: username };
        },
      },
    }),
    // Recovery only: mails a one-time link to an address the owner chose to add.
    magicLink({
      disableSignUp: true,
      sendMagicLink: async ({ email, url }) => {
        if (isPlaceholderEmail(email)) return;
        // Imported lazily: loading void/email while the config is read breaks `vp test`.
        const { sendRecoveryMail } = await import('./src/recovery-mail');
        await sendRecoveryMail(email, url);
      },
    }),
  ],
}));
