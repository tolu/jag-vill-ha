// Who the admin is, and what the admin pages work out about an account. Pure,
// so it is tested: the pages in pages/admin/ do the reading.

/**
 * The admin is one account, named by its user id in ADMIN_USER_ID. Without
 * that value there is no admin at all, and a visitor who is not logged in is
 * never one: two missing values must not count as a match.
 */
export function isAdmin(userId: string | null | undefined, adminId: string | null | undefined) {
  return Boolean(userId) && Boolean(adminId) && userId === adminId;
}

/** A lost phone locks this owner out: one key, and no address to mail a link to. */
export function lockoutRisk(keys: number, hasEmail: boolean) {
  return keys <= 1 && !hasEmail;
}

/** How long after a passkey prompt the admin may still delete an account. */
export const PROOF_MS = 5 * 60 * 1000;

/** Where auth.ts notes that a session began with a passkey prompt, and the delete page looks for it. */
export const passkeyProofId = (sessionId: string) => `passkey-proof:${sessionId}`;

/**
 * Which accounts the admin may delete from the admin pages: any that has an
 * owner, except the admin's own. That one goes the usual way, from /konto.
 */
export function deletable(ownerId: string | null, adminId: string): ownerId is string {
  return Boolean(ownerId) && ownerId !== adminId;
}
