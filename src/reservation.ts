// Rules for reserving ("paxa") a wish. Givers have no account: a random token
// in a cookie is what lets the same device undo its own reservations.

/** A giver's name as shown to other givers; null when unusable. */
export function parseGiverName(input: unknown) {
  if (typeof input !== 'string') return null;
  const name = input.trim().replace(/\s+/g, ' ');
  return name.length >= 1 && name.length <= 40 ? name : null;
}

export function newToken() {
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('');
}

/** Only the hash is stored, so a leaked database cannot be used to undo reservations. */
export async function hashToken(token: string) {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(token));
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('');
}

type WishRow = {
  id: number;
  title: string;
  url: string | null;
  note: string | null;
  icon: string | null;
  imageKey: string | null;
};

type ReservationRow = { wishId: number; name: string; tokenHash: string };

/**
 * Loads reservations for everyone except the list's owner. The owner must
 * never learn what is reserved, so for them the loader is not even called.
 */
export async function reservationsForViewer(isOwner: boolean, load: () => Promise<ReservationRow[]>) {
  return isOwner ? null : load();
}

/**
 * What a visitor sees for each wish. `reservations` is null for the owner, and
 * then nothing about reservations ends up in the result.
 */
export function publicWishes(wishes: WishRow[], reservations: ReservationRow[] | null, viewerTokenHash: string | null) {
  return wishes.map((wish) => {
    const reservation = reservations?.find((row) => row.wishId === wish.id);
    const state = !reservations ? 'hidden' : !reservation ? 'free' : reservation.tokenHash === viewerTokenHash ? 'mine' : 'taken';
    return {
      id: wish.id,
      title: wish.title,
      url: wish.url,
      note: wish.note,
      icon: wish.icon,
      imageKey: wish.imageKey,
      state: state as 'hidden' | 'free' | 'mine' | 'taken',
      takenBy: state === 'taken' ? reservation!.name : null,
    };
  });
}
