// When a stored picture stops being needed. Pure, so the rules that keep the
// bucket from filling up with discarded pictures can be tested without one.

/**
 * What an edit does to a wish's picture. A new upload wins; otherwise the
 * picture goes if the owner asked to remove it (or picked an icon), and stays
 * if not. `discard` is the stored picture that no longer has a wish.
 */
export function resolveImageChange(change: { uploaded: string | null; removeRequested: boolean; current: string | null }) {
  const imageKey = change.uploaded ?? (change.removeRequested ? null : change.current);
  return { imageKey, discard: change.current && change.current !== imageKey ? change.current : null };
}

/**
 * Runs a database write that points at a freshly stored picture. If the write
 * fails the picture would be left with no wish pointing at it, so it is
 * removed again before the error is passed on.
 */
export async function writeWithImage<T>(storedKey: string | null, write: () => Promise<T>, remove: (key: string) => Promise<void>) {
  try {
    return await write();
  } catch (error) {
    // The original failure is what matters; a failed clean-up must not hide it.
    if (storedKey) await remove(storedKey).catch(() => undefined);
    throw error;
  }
}
